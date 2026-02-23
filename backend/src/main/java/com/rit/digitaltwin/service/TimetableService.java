package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.*;
import com.rit.digitaltwin.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TimetableService {
    private final TimetableRepository timetableRepository;
    private final FacultyRepository facultyRepository;
    private final SubjectRepository subjectRepository;

    public List<Timetable> generateWeeklyTimetable(Long facultyId, Long subjectId, Integer totalHours,
            String classListStr) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        List<Timetable> generated = new ArrayList<>();
        int hoursConfigured = 0;

        DayOfWeek[] workingDays = { DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY,
                DayOfWeek.FRIDAY };
        LocalTime[] timeSlots = {
                LocalTime.of(9, 0), LocalTime.of(10, 0), LocalTime.of(11, 0),
                LocalTime.of(13, 0), LocalTime.of(14, 0), LocalTime.of(15, 0)
        };

        for (DayOfWeek day : workingDays) {
            for (LocalTime start : timeSlots) {
                if (hoursConfigured >= totalHours)
                    break;

                List<Timetable> existing = timetableRepository.findByFacultyIdAndDayOfWeekAndStartTime(facultyId, day,
                        start);
                if (existing.isEmpty()) {
                    Timetable t = new Timetable();
                    t.setFaculty(faculty);
                    t.setSubject(subject);
                    t.setDayOfWeek(day);
                    t.setStartTime(start);
                    t.setEndTime(start.plusHours(1));
                    t.setSection(classListStr);
                    // classroom allocation logic excluded for simplicity
                    generated.add(timetableRepository.save(t));
                    hoursConfigured++;
                }
            }
        }
        return generated;
    }
}
