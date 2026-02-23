package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.StudyPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudyPlanRepository extends JpaRepository<StudyPlan, Long> {
    List<StudyPlan> findByStudentStudentId(Long studentId);
}
