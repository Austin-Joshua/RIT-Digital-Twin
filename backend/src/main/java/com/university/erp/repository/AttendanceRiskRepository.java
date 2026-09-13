package com.university.erp.repository;

import com.university.erp.model.AttendanceRisk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;

@Repository
public interface AttendanceRiskRepository extends JpaRepository<AttendanceRisk, Long> {
    List<AttendanceRisk> findByStudent_IdOrderByAnalyzedAtDesc(Long studentId);

    @Query("select s.section, count(r) from AttendanceRisk r join r.student s where lower(r.riskLevel) = 'high' and s.section is not null group by s.section")
    List<Object[]> countHighRiskBySection();

    @Query("select r from AttendanceRisk r join fetch r.student s where lower(s.section) in :sections and lower(r.riskLevel) in ('high', 'medium') order by r.analyzedAt desc")
    List<AttendanceRisk> findElevatedBySections(@Param("sections") Collection<String> sections);
}
