package com.university.erp.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class TimetableService {

    public Map<String, List<String>> generateWeeklyTimetable(Long deptId, String section) {
        Map<String, List<String>> timetable = new LinkedHashMap<>();
        String[] days = { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday" };
        String[] periods = { "9:00-10:00", "10:00-11:00", "11:15-12:15", "1:15-2:15", "2:15-3:15" };

        for (String day : days) {
            List<String> daySchedule = new ArrayList<>();
            for (String period : periods) {
                daySchedule.add("Subject [Randomly Generated for " + period + "]");
            }
            timetable.put(day, daySchedule);
        }
        return timetable;
    }
}
