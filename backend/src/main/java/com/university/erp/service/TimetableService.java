package com.university.erp.service;

import com.university.erp.entity.*;
import com.university.erp.repository.*;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class TimetableService {

    private final TimetableSlotRepository timetableSlotRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final DepartmentRepository departmentRepository;
    private final FacultySubjectRepository facultySubjectRepository;

    public TimetableService(TimetableSlotRepository timetableSlotRepository, StudentRepository studentRepository,
            SubjectRepository subjectRepository, DepartmentRepository departmentRepository, FacultySubjectRepository facultySubjectRepository) {
        this.timetableSlotRepository = timetableSlotRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.departmentRepository = departmentRepository;
        this.facultySubjectRepository = facultySubjectRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "studentTimetable", key = "#userId")
    public List<TimetableSlot> getStudentTimetable(Long userId) {
        Student student = studentRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
        if (student.getDepartment() == null) return Collections.emptyList();
        return timetableSlotRepository.findByDepartmentIdAndSection(student.getDepartment().getId(), student.getSection());
    }

    @Transactional(readOnly = true)
    public List<TimetableSlot> getFacultyTimetable(Long facultyUserId) {
        // Find all subjects this faculty is teaching
        List<FacultySubject> fsList = facultySubjectRepository.findByFaculty_User_Id(facultyUserId);
        List<TimetableSlot> result = new ArrayList<>();
        for (FacultySubject fs : fsList) {
            List<TimetableSlot> slots = timetableSlotRepository.findByDepartmentIdAndSection(fs.getSubject().getDepartment().getId(), fs.getSection());
            for (TimetableSlot slot : slots) {
                if (slot.getSubject().getId().equals(fs.getSubject().getId())) {
                    result.add(slot);
                }
            }
        }
        return result;
    }

    @Transactional
    @CacheEvict(cacheNames = "studentTimetable", allEntries = true)
    public List<TimetableSlot> generateWeeklyTimetable(Long deptId, String section) {
        Department dept = departmentRepository.findById(deptId).orElseThrow(() -> new RuntimeException("Department not found"));
        List<Subject> subjects = subjectRepository.findByDepartmentId(deptId);
        if (subjects.isEmpty()) throw new RuntimeException("No subjects found for this department.");

        timetableSlotRepository.deleteAll(timetableSlotRepository.findByDepartmentIdAndSection(deptId, section));

        List<TimetableSlot> allSlots = timetableSlotRepository.findAll();
        List<FacultySubject> allAllocations = facultySubjectRepository.findAll();

        String[] days = { "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY" };
        String[] startTimes = { "09:00:00", "10:00:00", "11:00:00", "13:00:00", "14:00:00", "15:00:00" };
        String[] endTimes = { "10:00:00", "11:00:00", "12:00:00", "14:00:00", "15:00:00", "16:00:00" };

        List<TimetableSlot> generated = new ArrayList<>();
        Map<Subject, Integer> weeklySubjectCount = new HashMap<>();

        for (String day : days) {
            Map<Subject, Integer> dailySubjectCount = new HashMap<>();
            for (int i = 0; i < startTimes.length; i++) {
                String st = startTimes[i];
                Subject chosen = findOptimizedSubject(subjects, day, st, i, section, allSlots, allAllocations, weeklySubjectCount, dailySubjectCount);
                if (chosen != null) {
                    weeklySubjectCount.put(chosen, weeklySubjectCount.getOrDefault(chosen, 0) + 1);
                    dailySubjectCount.put(chosen, dailySubjectCount.getOrDefault(chosen, 0) + 1);
                    TimetableSlot slot = TimetableSlot.builder()
                            .dayOfWeek(day)
                            .startTime(st)
                            .endTime(endTimes[i])
                            .subject(chosen)
                            .section(section)
                            .department(dept)
                            .build();
                    TimetableSlot saved = timetableSlotRepository.save(slot);
                    generated.add(saved);
                    allSlots.add(saved);
                }
            }
        }
        return generated;
    }

    private Subject findOptimizedSubject(List<Subject> subjects, String day, String startTime, int slotIndex, String section,
                                        List<TimetableSlot> allSlots, List<FacultySubject> allAllocations,
                                        Map<Subject, Integer> weeklyCounts, Map<Subject, Integer> dailyCounts) {
        
        Subject bestSubject = null;
        double bestScore = Double.NEGATIVE_INFINITY;

        for (Subject sub : subjects) {
            FacultyProfile teacher = allAllocations.stream()
                    .filter(fs -> fs.getSubject().getId().equals(sub.getId()) && section.equalsIgnoreCase(fs.getSection()))
                    .map(FacultySubject::getFaculty)
                    .findFirst().orElse(null);

            if (teacher != null) {
                // Hard constraint: Teacher must be free
                boolean busy = allSlots.stream().anyMatch(s -> 
                    s.getDayOfWeek().equalsIgnoreCase(day) && s.getStartTime().equals(startTime) &&
                    allAllocations.stream().anyMatch(fs -> 
                        fs.getSubject().getId().equals(s.getSubject().getId()) && 
                        s.getSection().equalsIgnoreCase(fs.getSection()) && 
                        fs.getFaculty().getFacultyId().equals(teacher.getFacultyId()))
                );
                if (busy) continue;
            }

            // Heuristic Scoring
            double score = 0;
            
            // 1. Workload balance (Weekly) - Prefer subjects with fewer classes scheduled
            score -= weeklyCounts.getOrDefault(sub, 0) * 10;
            
            // 2. Daily variety - Strongly penalize same subject twice a day
            score -= dailyCounts.getOrDefault(sub, 0) * 50;

            if (teacher != null) {
                // 3. Minimize Faculty Gaps
                // Check if teacher has class in previous slot
                final String prevStartTime = slotIndex > 0 ? getStartTimeForIndex(slotIndex - 1) : null;
                boolean hadPrevClass = (prevStartTime != null) && allSlots.stream().anyMatch(s -> 
                    s.getDayOfWeek().equalsIgnoreCase(day) && s.getStartTime().equals(prevStartTime) &&
                    allAllocations.stream().anyMatch(fs -> 
                        fs.getSubject().getId().equals(s.getSubject().getId()) && 
                        s.getSection().equalsIgnoreCase(fs.getSection()) && 
                        fs.getFaculty().getFacultyId().equals(teacher.getFacultyId()))
                );
                if (hadPrevClass) score += 20; // Reward consecutive classes for faculty (less idle time)
            }

            // 4. Time preference
            if (slotIndex < 2 && sub.getSubjectName().toLowerCase().contains("lab")) score -= 20; // Labs usually preferred later or block sessions
            if (slotIndex < 3 && !sub.getSubjectName().toLowerCase().contains("lab")) score += 5; // Theory preferred in morning

            if (score > bestScore) {
                bestScore = score;
                bestSubject = sub;
            }
        }
        return bestSubject;
    }

    private String getStartTimeForIndex(int index) {
        String[] startTimes = { "09:00:00", "10:00:00", "11:00:00", "13:00:00", "14:00:00", "15:00:00" };
        return startTimes[index];
    }
}
