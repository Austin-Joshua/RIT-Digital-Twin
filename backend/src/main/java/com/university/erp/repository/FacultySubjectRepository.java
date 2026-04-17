package com.university.erp.repository;

import com.university.erp.model.FacultySubject;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FacultySubjectRepository extends JpaRepository<FacultySubject, Long> {
    @EntityGraph(attributePaths = { "faculty", "faculty.user", "subject", "semester" })
    List<FacultySubject> findByFaculty_User_Id(Long userId);

    @EntityGraph(attributePaths = { "faculty", "faculty.user", "subject", "semester" })
    List<FacultySubject> findBySubject_IdAndSemester_SemesterNumberAndSectionIgnoreCase(Long subjectId, Integer semester, String section);

    @EntityGraph(attributePaths = { "faculty", "faculty.user", "subject", "subject.department", "subject.semester", "semester" })
    List<FacultySubject> findBySubject_Department_Id(Long departmentId);

    @EntityGraph(attributePaths = { "faculty", "faculty.user", "subject", "subject.department", "subject.semester", "semester", "requestedBy", "approvedBy" })
    List<FacultySubject> findBySubject_Department_IdAndApprovalStatusIgnoreCase(Long departmentId, String approvalStatus);

    @EntityGraph(attributePaths = { "faculty", "faculty.user", "subject", "subject.department", "subject.semester", "semester", "requestedBy", "approvedBy" })
    List<FacultySubject> findByApprovalStatusIgnoreCase(String approvalStatus);

    @EntityGraph(attributePaths = { "faculty", "faculty.user", "subject", "subject.department", "subject.semester", "semester", "requestedBy", "approvedBy" })
    List<FacultySubject> findByApprovalStatusIgnoreCaseAndSubject_Department_Id(String approvalStatus, Long departmentId);
}
