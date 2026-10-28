package com.university.erp.repository;

import com.university.erp.model.Marks;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Long> {

    Optional<Marks> findByStudent_IdAndSubject_Id(Long studentId, Long subjectId);

    @EntityGraph(attributePaths = { "student", "subject" })
    List<Marks> findByStudent_Id(Long studentId);

    @EntityGraph(attributePaths = { "student", "subject" })
    Page<Marks> findByStudent_Id(Long studentId, Pageable pageable);

    List<Marks> findByStudent_IdAndSemester(Long studentId, Integer semester);

    Page<Marks> findByStudent_IdAndSemester(Long studentId, Integer semester, Pageable pageable);

    @EntityGraph(attributePaths = { "student", "subject" })
    @Query("SELECT m FROM Marks m JOIN m.student s WHERE s.department.id = :departmentId")
    List<Marks> findByDepartmentId(@Param("departmentId") Long departmentId);

    @EntityGraph(attributePaths = { "student", "subject" })
    @Query("SELECT m FROM Marks m WHERE m.student.id IN :studentIds")
    List<Marks> findAllByStudentIdIn(@Param("studentIds") Collection<Long> studentIds);

    @Query("select count(m) from Marks m where m.grade is not null and m.grade <> ''")
    long countGradedMarks();

    @Query("select count(m) from Marks m where m.grade is not null and m.grade <> '' and upper(m.grade) not in ('F', 'AB')")
    long countPassingGrades();

    /**
     * Database-level aggregate for departmental academic metrics:
     * returns [avgTotalScore, avgInternalScore, passCount, totalGradedCount]
     */
    @Query("""
        SELECT
            AVG(m.totalScore),
            AVG(m.calculatedInternal),
            SUM(CASE WHEN m.grade IS NOT NULL AND m.grade <> '' AND UPPER(m.grade) NOT IN ('F', 'AB') THEN 1 ELSE 0 END),
            SUM(CASE WHEN m.grade IS NOT NULL AND m.grade <> '' THEN 1 ELSE 0 END)
        FROM Marks m
        JOIN m.student s
        WHERE s.department.id = :departmentId AND s.year >= :minYear
    """)
    List<Object[]> getDepartmentMarksSummary(@Param("departmentId") Long departmentId, @Param("minYear") Integer minYear);

    /**
     * Database-level aggregate for first-year H&S academic metrics:
     * returns [avgTotalScore, avgInternalScore, passCount, totalGradedCount]
     */
    @Query("""
        SELECT
            AVG(m.totalScore),
            AVG(m.calculatedInternal),
            SUM(CASE WHEN m.grade IS NOT NULL AND m.grade <> '' AND UPPER(m.grade) NOT IN ('F', 'AB') THEN 1 ELSE 0 END),
            SUM(CASE WHEN m.grade IS NOT NULL AND m.grade <> '' THEN 1 ELSE 0 END)
        FROM Marks m
        JOIN m.student s
        WHERE s.year = 1
    """)
    List<Object[]> getFirstYearMarksSummary();

    /**
     * Database-level aggregate for class performance metrics grouped by year and section
     * returns List of [year, section, studentCount, avgTotalScore, failCount, totalGraded]
     */
    @Query("""
        SELECT
            s.year,
            s.section,
            COUNT(DISTINCT s.id),
            AVG(m.totalScore),
            SUM(CASE WHEN m.grade IS NOT NULL AND UPPER(m.grade) IN ('F', 'AB') THEN 1 ELSE 0 END),
            SUM(CASE WHEN m.grade IS NOT NULL AND m.grade <> '' THEN 1 ELSE 0 END)
        FROM Student s
        LEFT JOIN Marks m ON m.student.id = s.id
        WHERE s.department.id = :departmentId AND s.year >= 2
        GROUP BY s.year, s.section
        ORDER BY s.year ASC, s.section ASC
    """)
    List<Object[]> getClassPerformanceMarksSummary(@Param("departmentId") Long departmentId);

    @Query("""
        SELECT
            s.year,
            s.section,
            COUNT(DISTINCT s.id),
            AVG(m.totalScore),
            SUM(CASE WHEN m.grade IS NOT NULL AND UPPER(m.grade) IN ('F', 'AB') THEN 1 ELSE 0 END),
            SUM(CASE WHEN m.grade IS NOT NULL AND m.grade <> '' THEN 1 ELSE 0 END)
        FROM Student s
        LEFT JOIN Marks m ON m.student.id = s.id
        WHERE s.year = 1
        GROUP BY s.year, s.section
        ORDER BY s.year ASC, s.section ASC
    """)
    List<Object[]> getFirstYearClassPerformanceMarksSummary();
}
