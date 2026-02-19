package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
        List<Timetable> findByClassroomId(Long classroomId);

        @Query("SELECT t FROM Timetable t WHERE t.classroom.id = :classroomId AND t.dayOfWeek = :dayOfWeek AND t.startTime < :endTime AND t.endTime > :startTime")
        List<Timetable> findConflictingSlots(Long classroomId, java.time.DayOfWeek dayOfWeek,
                        java.time.LocalTime startTime, java.time.LocalTime endTime);
}
