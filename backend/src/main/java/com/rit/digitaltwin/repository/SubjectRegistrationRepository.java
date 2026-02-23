package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.SubjectRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRegistrationRepository extends JpaRepository<SubjectRegistration, Long> {
    List<SubjectRegistration> findByStudentId(Long studentId);

    List<SubjectRegistration> findBySubjectId(Long subjectId);

    Optional<SubjectRegistration> findByStudentIdAndSubjectId(Long studentId, Long subjectId);
}
