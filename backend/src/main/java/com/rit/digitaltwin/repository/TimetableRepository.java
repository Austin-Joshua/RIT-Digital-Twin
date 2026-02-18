package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
        List<Timetable> findByClassroomId(Long classroomId);
}
