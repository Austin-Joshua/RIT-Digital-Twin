package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.ODApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ODApplicationRepository extends JpaRepository<ODApplication, Long> {
    List<ODApplication> findByStudentId(Long studentId);

    List<ODApplication> findByStatus(String status);
}
