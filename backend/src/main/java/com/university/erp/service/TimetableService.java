package com.university.erp.service;

import com.university.erp.entity.Department;
import com.university.erp.entity.Student;
import com.university.erp.entity.Subject;
import com.university.erp.entity.TimetableSlot;
import com.university.erp.repository.DepartmentRepository;
import com.university.erp.repository.StudentRepository;
import com.university.erp.repository.SubjectRepository;
import com.university.erp.repository.TimetableSlotRepository;
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

    public TimetableService(TimetableSlotRepository timetableSlotRepository, StudentRepository studentRepository,
            SubjectRepository subjectRepository, DepartmentRepository departmentRepository) {
        this.timetableSlotRepository = timetableSlotRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "studentTimetable", key = "#userId")
    public List<TimetableSlot> getStudentTimetable(Long userId) {
        Student student = studentRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        if (student.getDepartment() == null) {
            return Collections.emptyList();
        }

        return timetableSlotRepository.findByDepartmentIdAndSection(student.getDepartment().getId(),
                student.getSection());
    }

    @Transactional
    @CacheEvict(cacheNames = "studentTimetable", allEntries = true)
    public List<TimetableSlot> generateWeeklyTimetable(Long deptId, String section) {
        Department dept = departmentRepository.findById(deptId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        List<Subject> subjects = subjectRepository.findByDepartmentId(deptId);
        if (subjects.isEmpty()) {
            throw new RuntimeException("No subjects found for this department to generate timetable.");
        }

        // Clear existing for this dept/section
        timetableSlotRepository.deleteAll(timetableSlotRepository.findByDepartmentIdAndSection(deptId, section));

        String[] days = { "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY" };
        String[] startTimes = { "09:00:00", "10:00:00", "11:00:00", "13:00:00", "14:00:00", "15:00:00" };
        String[] endTimes = { "10:00:00", "11:00:00", "12:00:00", "14:00:00", "15:00:00", "16:00:00" };

        List<TimetableSlot> generated = new ArrayList<>();
        int subjectIndex = 0;

        for (String day : days) {
            for (int i = 0; i < startTimes.length; i++) {
                Subject sub = subjects.get(subjectIndex % subjects.size());
                TimetableSlot slot = TimetableSlot.builder()
                        .dayOfWeek(day)
                        .startTime(startTimes[i])
                        .endTime(endTimes[i])
                        .subject(sub)
                        .section(section)
                        .department(dept)
                        .build();
                generated.add(timetableSlotRepository.save(slot));
                subjectIndex++;
            }
        }
        return generated;
    }
}
