package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.CGPA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CGPARepository extends JpaRepository<CGPA, Long> {
    List<CGPA> findByStudentId(Long studentId);
}
