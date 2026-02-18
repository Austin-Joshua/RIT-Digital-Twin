package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.Timetable;
import com.rit.digitaltwin.model.DayOfWeek;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {

    List<Timetable> findByClassroomIdAndDayOfWeekAndIsActiveTrue(Long classroomId, DayOfWeek dayOfWeek);

    @Query("SELECT t FROM Timetable t WHERE t.classroom.id = :classroomId " +
            "AND t.dayOfWeek = :day AND t.isActive = true " +
            "AND ((t.startTime < :endTime AND t.endTime > :startTime))")
    List<Timetable> findConflictingSlots(
            @Param("classroomId") Long classroomId,
            @Param("day") DayOfWeek day,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    @Query("SELECT t FROM Timetable t WHERE t.classroom.id = :classroomId AND t.isActive = true")
    List<Timetable> findActiveByClassroom(@Param("classroomId") Long classroomId);
}
