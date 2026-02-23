package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.Classroom;
import com.rit.digitaltwin.model.ExamTimetable;
import com.rit.digitaltwin.model.Faculty;
import com.rit.digitaltwin.model.Subject;
import com.rit.digitaltwin.repository.ClassroomRepository;
import com.rit.digitaltwin.repository.ExamTimetableRepository;
import com.rit.digitaltwin.repository.FacultyRepository;
import com.rit.digitaltwin.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamTimetableService {

    private final ExamTimetableRepository examTimetableRepository;
    private final SubjectRepository subjectRepository;
    private final FacultyRepository facultyRepository;
    private final ClassroomRepository classroomRepository;

    @Transactional
    public List<ExamTimetable> generateExamTimetable(LocalDate startDate) {
        // Massive simplification of constraint logic for demonstration without deep DB
        // pulls
        List<Subject> subjects = subjectRepository.findAll();
        List<Faculty> faculties = facultyRepository.findAll();
        List<Classroom> rooms = classroomRepository.findAll();

        LocalDate currentDate = startDate;
        LocalTime startTime = LocalTime.of(9, 0);
        LocalTime endTime = LocalTime.of(12, 0);

        int facIndex = 0;
        int roomIndex = 0;

        for (Subject subject : subjects) {
            if (faculties.isEmpty() || rooms.isEmpty())
                break;

            ExamTimetable entry = ExamTimetable.builder()
                    .subject(subject)
                    .examDate(currentDate)
                    .startTime(startTime)
                    .endTime(endTime)
                    .invigilator(faculties.get(facIndex % faculties.size()))
                    .room(rooms.get(roomIndex % rooms.size()))
                    .build();

            examTimetableRepository.save(entry);

            facIndex++;
            roomIndex++;

            // Advance date skipping weekends generically
            currentDate = currentDate.plusDays(1);
            if (currentDate.getDayOfWeek().getValue() >= 6) {
                currentDate = currentDate.plusDays(2);
            }
        }

        return examTimetableRepository.findAll();
    }
}
