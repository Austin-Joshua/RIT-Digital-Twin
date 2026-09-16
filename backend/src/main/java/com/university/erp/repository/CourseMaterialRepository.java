package com.university.erp.repository;

import com.university.erp.model.CourseMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, Long> {
    List<CourseMaterial> findBySubjectCodeOrderByCreatedAtDesc(String subjectCode);
    List<CourseMaterial> findAllByOrderByCreatedAtDesc();
}
