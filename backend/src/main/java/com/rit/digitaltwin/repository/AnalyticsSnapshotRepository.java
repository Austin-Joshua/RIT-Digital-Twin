package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.AnalyticsSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalyticsSnapshotRepository extends JpaRepository<AnalyticsSnapshot, Long> {
    List<AnalyticsSnapshot> findByDepartmentIdAndAcademicYear(Long departmentId, Integer academicYear);

    List<AnalyticsSnapshot> findByDepartmentIdAndAcademicYearAndSemester(Long departmentId, Integer academicYear,
            Integer semester);
}
