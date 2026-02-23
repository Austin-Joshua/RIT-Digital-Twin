package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.*;
import com.rit.digitaltwin.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimetableGenerationService {

        private final TimetableRepository timetableRepository;
        private final SubjectRepository subjectRepository;
        private final ClassroomRepository classroomRepository;
        private final FacultyRepository facultyRepository;
        private final DepartmentRepository departmentRepository;
        private final ExamTimetableRepository examTimetableRepository;

        @Transactional
        public List<Timetable> generateWeeklyTimetable(Long departmentId, String section) {
                Department dept = departmentRepository.findById(departmentId)
                                .orElseThrow(() -> new RuntimeException("Department not found"));

                List<Subject> subjects = subjectRepository.findAll().stream()
                                .filter(s -> s.getDepartment() != null
                                                && s.getDepartment().getDeptId().equals(departmentId))
                                .collect(Collectors.toList());

                List<Classroom> classrooms = classroomRepository.findAll();
                List<Faculty> faculties = facultyRepository.findAll().stream()
                                .filter(f -> f.getUser().getDepartment() != null
                                                && f.getUser().getDepartment().getDeptId().equals(departmentId))
                                .collect(Collectors.toList());

                // Clear existing for this section
                List<Timetable> existing = timetableRepository.findAll().stream()
                                .filter(t -> t.getDepartment().getDeptId().equals(departmentId)
                                                && t.getSection().equals(section))
                                .collect(Collectors.toList());
                timetableRepository.deleteAll(existing);

                List<Timetable> generated = new ArrayList<>();
                DayOfWeek[] days = { DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY,
                                DayOfWeek.FRIDAY };
                LocalTime[] slots = {
                                LocalTime.of(9, 0), LocalTime.of(10, 0), LocalTime.of(11, 0),
                                LocalTime.of(13, 0), LocalTime.of(14, 0), LocalTime.of(15, 0)
                };

                Random random = new Random();

                for (DayOfWeek day : days) {
                        for (LocalTime slot : slots) {
                                if (subjects.isEmpty())
                                        break;

                                Subject subject = subjects.get(random.nextInt(subjects.size()));
                                Faculty faculty = faculties.isEmpty() ? null
                                                : faculties.get(random.nextInt(faculties.size()));
                                Classroom room = classrooms.isEmpty() ? null
                                                : classrooms.get(random.nextInt(classrooms.size()));

                                // Check for clashes
                                boolean isFacultyBusy = faculty != null
                                                && !timetableRepository.findByFacultyIdAndDayOfWeekAndStartTime(
                                                                faculty.getId(), day, slot).isEmpty();

                                boolean isRoomBusy = room != null && !timetableRepository.findConflictingSlots(
                                                room.getId(), day, slot, slot.plusHours(1)).isEmpty();

                                if (!isFacultyBusy && !isRoomBusy) {
                                        Timetable entry = Timetable.builder()
                                                        .dayOfWeek(day)
                                                        .startTime(slot)
                                                        .endTime(slot.plusHours(1))
                                                        .subject(subject)
                                                        .subjectName(subject.getSubjectName())
                                                        .faculty(faculty)
                                                        .classroom(room)
                                                        .department(dept)
                                                        .section(section)
                                                        .courseName(dept.getDeptName())
                                                        .build();
                                        generated.add(entry);
                                }
                        }
                }
                return timetableRepository.saveAll(generated);
        }

        @Transactional
        public List<ExamTimetable> generateExamTimetable(Long departmentId, LocalDate startDate) {
                // Validation check but not used in logic yet for constraints
                departmentRepository.findById(departmentId)
                                .orElseThrow(() -> new RuntimeException("Department not found"));

                List<Subject> subjects = subjectRepository.findAll().stream()
                                .filter(s -> s.getDepartment() != null
                                                && s.getDepartment().getDeptId().equals(departmentId))
                                .collect(Collectors.toList());

                List<Classroom> classrooms = classroomRepository.findAll();
                List<Faculty> faculties = facultyRepository.findAll();

                // Clear existing for this dept/dates (simplified)
                examTimetableRepository.deleteAll();

                List<ExamTimetable> generated = new ArrayList<>();
                LocalDate currentDate = startDate;

                for (Subject subject : subjects) {
                        if (classrooms.isEmpty() || faculties.isEmpty())
                                break;

                        Classroom room = classrooms.get(new Random().nextInt(classrooms.size()));
                        Faculty invigilator = faculties.get(new Random().nextInt(faculties.size()));

                        ExamTimetable exam = ExamTimetable.builder()
                                        .subject(subject)
                                        .examDate(currentDate)
                                        .startTime(LocalTime.of(10, 0))
                                        .endTime(LocalTime.of(13, 0))
                                        .room(room)
                                        .invigilator(invigilator)
                                        .build();

                        generated.add(exam);
                        currentDate = currentDate.plusDays(2); // Alternate days for study
                }

                return examTimetableRepository.saveAll(generated);
        }
}
