package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.Marks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Long> {
    List<Marks> findByStudentId(Long studentId);

    Optional<Marks> findByStudentIdAndSubjectSubjectId(Long studentId, Long subjectId);

    List<Marks> findBySubjectSubjectId(Long subjectId);
}
