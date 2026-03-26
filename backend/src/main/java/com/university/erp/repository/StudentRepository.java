package com.university.erp.repository;

import com.university.erp.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    /** First-year students (all branches) — under H&S (SANDH) for reporting */
    List<Student> findByYear(Integer year);
    long countByYear(Integer year);

    /** From second year onward, students are under their department */
    List<Student> findByDepartment_IdAndYearGreaterThanEqual(Long departmentId, Integer year);
    long countByDepartment_IdAndYearGreaterThanEqual(Long departmentId, Integer year);
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "user", "department" })
    Optional<Student> findByStudentIdNumber(String studentIdNumber);
    // Add countBySection method for crowd density simulation context
    long countBySection(String section);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "user", "department" })
    Optional<Student> findByRegisterNo(String registerNo);

    Optional<Student> findByUser_Id(Long userId);

    List<Student> findByDepartmentId(Long departmentId);

    org.springframework.data.domain.Page<Student> findByDepartmentId(Long departmentId,
            org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<Student> findAll(org.springframework.data.domain.Pageable pageable);

    long countByDepartment_Id(Long departmentId);

    long countByDepartment_IdAndYear(Long departmentId, Integer year);

    List<Student> findBySectionIgnoreCase(String section);
}
