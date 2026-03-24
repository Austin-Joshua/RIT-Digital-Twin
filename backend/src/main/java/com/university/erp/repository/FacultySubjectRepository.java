package com.university.erp.repository;

import com.university.erp.entity.FacultySubject;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FacultySubjectRepository extends JpaRepository<FacultySubject, Long> {
    @EntityGraph(attributePaths = { "faculty", "faculty.user", "subject", "semester" })
    List<FacultySubject> findByFaculty_User_Id(Long userId);

    @EntityGraph(attributePaths = { "faculty", "faculty.user", "subject", "semester" })
    List<FacultySubject> findBySubject_IdAndSemester_SemesterNumberAndSectionIgnoreCase(Long subjectId, Integer semester, String section);
}
