package com.university.erp.repository;

import com.university.erp.entity.Marks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Long> {
        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "student", "subject" })
        List<Marks> findByStudentId(Long studentId);

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "student", "subject" })
        org.springframework.data.domain.Page<Marks> findByStudentId(Long studentId,
                        org.springframework.data.domain.Pageable pageable);

        List<Marks> findByStudentIdAndSemester(Long studentId, Integer semester);

        org.springframework.data.domain.Page<Marks> findByStudentIdAndSemester(Long studentId, Integer semester,
                        org.springframework.data.domain.Pageable pageable);
}
