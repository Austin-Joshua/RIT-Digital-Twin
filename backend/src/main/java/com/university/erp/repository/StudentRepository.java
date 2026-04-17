package com.university.erp.repository;

import com.university.erp.model.Student;
import com.university.erp.repository.projection.StudentAdminSummaryProjection;
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
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "user", "department" })
    Optional<Student> findByEmailIgnoreCase(String email);

    Optional<Student> findByUser_Id(Long userId);

    List<Student> findByDepartmentId(Long departmentId);

    org.springframework.data.domain.Page<Student> findByDepartmentId(Long departmentId,
            org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<Student> findAll(org.springframework.data.domain.Pageable pageable);

    long countByDepartment_Id(Long departmentId);

    long countByDepartment_IdAndYear(Long departmentId, Integer year);

    List<Student> findBySectionIgnoreCase(String section);

    @org.springframework.data.jpa.repository.Query("select distinct upper(trim(s.section)) from Student s where s.department.id = :departmentId and s.section is not null and trim(s.section) <> ''")
    List<String> findDistinctSectionsByDepartmentId(@org.springframework.data.repository.query.Param("departmentId") Long departmentId);

    @org.springframework.data.jpa.repository.Query("""
            select
                s.id as studentId,
                coalesce(s.registerNo, s.studentIdNumber) as registerNo,
                coalesce(s.studentName, concat(coalesce(u.firstName, ''), ' ', coalesce(u.lastName, ''))) as name,
                d.deptName as department,
                s.section as section,
                s.batch as batch,
                s.scholarType as scholarType,
                coalesce(s.email, u.email) as email,
                s.phone as phone,
                s.status as status,
                s.currentCgpa as cgpa
            from Student s
            left join s.user u
            left join s.department d
            where upper(s.section) = upper(:section)
            """)
    List<StudentAdminSummaryProjection> findAdminSummaryBySection(@org.springframework.data.repository.query.Param("section") String section);
}
