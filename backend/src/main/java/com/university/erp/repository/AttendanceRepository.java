package com.university.erp.repository;

import com.university.erp.model.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);

    Page<Attendance> findByStudentId(Long studentId, Pageable pageable);

    @Query("SELECT a FROM Attendance a JOIN a.student s WHERE s.department.id = :departmentId")
    List<Attendance> findByDepartmentId(@Param("departmentId") Long departmentId);

    List<Attendance> findByStudent_IdIn(Collection<Long> studentIds);

    @Query("select avg(a.percentage) from Attendance a where a.percentage is not null")
    Double averageAttendancePercentage();

    @Query("""
        SELECT AVG(a.percentage)
        FROM Attendance a
        JOIN a.student s
        WHERE s.department.id = :departmentId AND s.year >= :minYear AND a.percentage IS NOT NULL
    """)
    Double getDepartmentAverageAttendance(@Param("departmentId") Long departmentId, @Param("minYear") Integer minYear);

    @Query("""
        SELECT AVG(a.percentage)
        FROM Attendance a
        JOIN a.student s
        WHERE s.year = 1 AND a.percentage IS NOT NULL
    """)
    Double getFirstYearAverageAttendance();

    @Query("""
        SELECT s.year, s.section, AVG(a.percentage)
        FROM Student s
        LEFT JOIN Attendance a ON a.student.id = s.id AND a.percentage IS NOT NULL
        WHERE s.department.id = :departmentId AND s.year >= 2
        GROUP BY s.year, s.section
    """)
    List<Object[]> getClassAttendanceAverages(@Param("departmentId") Long departmentId);

    @Query("""
        SELECT s.year, s.section, AVG(a.percentage)
        FROM Student s
        LEFT JOIN Attendance a ON a.student.id = s.id AND a.percentage IS NOT NULL
        WHERE s.year = 1
        GROUP BY s.year, s.section
    """)
    List<Object[]> getFirstYearClassAttendanceAverages();
}
