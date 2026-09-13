package com.university.erp.repository;

import com.university.erp.model.PerformanceWarning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;

@Repository
public interface PerformanceWarningRepository extends JpaRepository<PerformanceWarning, Long> {
    List<PerformanceWarning> findByStudent_IdOrderByAnalyzedAtDesc(Long studentId);

    @Query("select w.status, count(w) from PerformanceWarning w where w.isResolved is null or w.isResolved = false group by w.status")
    List<Object[]> countOpenByStatus();

    @Query("select w from PerformanceWarning w join fetch w.student s where lower(s.section) in :sections and (w.isResolved is null or w.isResolved = false) order by w.analyzedAt desc")
    List<PerformanceWarning> findOpenBySections(@Param("sections") Collection<String> sections);
}
