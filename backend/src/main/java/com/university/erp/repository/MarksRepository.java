package com.university.erp.repository;

import com.university.erp.model.Marks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Long> {
    List<Marks> findByStudentId(Long studentId);

    List<Marks> findByStudentIdAndSemester(Long studentId, Integer semester);
}
