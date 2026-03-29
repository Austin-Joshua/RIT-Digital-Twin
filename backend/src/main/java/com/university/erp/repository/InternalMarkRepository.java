package com.university.erp.repository;

import com.university.erp.model.InternalMark;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InternalMarkRepository extends JpaRepository<InternalMark, Long> {
    @EntityGraph(attributePaths = { "studentSubject", "studentSubject.student", "studentSubject.subject", "studentSubject.semester" })
    Optional<InternalMark> findByStudentSubject_StudentSubjectId(Long studentSubjectId);

    @EntityGraph(attributePaths = { "studentSubject", "studentSubject.student", "studentSubject.subject", "studentSubject.semester" })
    List<InternalMark> findByStudentSubject_Student_Id(Long studentId);
}
