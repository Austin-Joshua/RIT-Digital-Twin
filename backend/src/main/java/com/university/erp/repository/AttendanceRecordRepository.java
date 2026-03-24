package com.university.erp.repository;

import com.university.erp.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    @EntityGraph(attributePaths = { "studentSubject", "studentSubject.student", "studentSubject.subject" })
    List<AttendanceRecord> findByStudentSubject_Student_Id(Long studentId);

    @EntityGraph(attributePaths = { "studentSubject", "studentSubject.student", "studentSubject.subject" })
    List<AttendanceRecord> findByStudentSubject_Subject_IdAndStudentSubject_Semester_SemesterNumberAndStudentSubject_Student_SectionIgnoreCase(
            Long subjectId, Integer semester, String section);

    Optional<AttendanceRecord> findByStudentSubject_StudentSubjectIdAndDate(Long studentSubjectId, LocalDate date);
}
