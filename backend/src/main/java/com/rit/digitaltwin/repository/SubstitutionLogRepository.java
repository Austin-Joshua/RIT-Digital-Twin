package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.SubstitutionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubstitutionLogRepository extends JpaRepository<SubstitutionLog, Long> {
    List<SubstitutionLog> findBySubstituteFacultyId(Long facultyId);
}
