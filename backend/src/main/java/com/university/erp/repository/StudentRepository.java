package com.university.erp.repository;

import com.university.erp.model.Student;
import com.university.erp.repository.projection.StudentAdminSummaryProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    /** First-year students (all branches) — under H&S (SANDH) for reporting */
    List<Student> findByYear(Integer year);
    Page<Student> findByYear(Integer year, Pageable pageable);
    Page<Student> findByYearAndSectionIgnoreCase(Integer year, String section, Pageable pageable);
    long countByYear(Integer year);

    /** From second year onward, students are under their department */
    List<Student> findByDepartment_IdAndYearGreaterThanEqual(Long departmentId, Integer year);
    Page<Student> findByDepartment_IdAndYearGreaterThanEqual(Long departmentId, Integer year, Pageable pageable);
    Page<Student> findByDepartment_IdAndYear(Long departmentId, Integer year, Pageable pageable);
    Page<Student> findByDepartment_IdAndYearAndSectionIgnoreCase(Long departmentId, Integer year, String section, Pageable pageable);
    Page<Student> findByDepartment_IdAndSectionIgnoreCase(Long departmentId, String section, Pageable pageable);
    long countByDepartment_IdAndYearGreaterThanEqual(Long departmentId, Integer year);

    @EntityGraph(attributePaths = { "user", "department" })
    Optional<Student> findByStudentIdNumber(String studentIdNumber);

    long countBySection(String section);

    @EntityGraph(attributePaths = { "user", "department" })
    Optional<Student> findByRegisterNo(String registerNo);

    @EntityGraph(attributePaths = { "user", "department" })
    List<Student> findAllByRegisterNoEndingWith(String suffix);

    @EntityGraph(attributePaths = { "user", "department" })
    Optional<Student> findByEmailIgnoreCase(String email);

    Optional<Student> findByUser_Id(Long userId);

    List<Student> findByDepartmentId(Long departmentId);

    Page<Student> findByDepartmentId(Long departmentId, Pageable pageable);

    Page<Student> findAll(Pageable pageable);

    long countByDepartment_Id(Long departmentId);

    long countByDepartment_IdAndYear(Long departmentId, Integer year);

    List<Student> findBySectionIgnoreCase(String section);

    @Query("select distinct upper(trim(s.section)) from Student s where s.department.id = :departmentId and s.section is not null and trim(s.section) <> ''")
    List<String> findDistinctSectionsByDepartmentId(@Param("departmentId") Long departmentId);

    @Query("""
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
    List<StudentAdminSummaryProjection> findAdminSummaryBySection(@Param("section") String section);

    @Query("""
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
            where (:section is null or :section = '' or upper(s.section) = upper(:section))
              and (:departmentCode is null or :departmentCode = '' or upper(d.code) = upper(:departmentCode))
            """)
    Page<StudentAdminSummaryProjection> findAdminSummaryByFilters(
            @Param("section") String section,
            @Param("departmentCode") String departmentCode,
            Pageable pageable
    );
}
