package com.university.erp.repository;

import com.university.erp.entity.Marks;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Long> {

    @EntityGraph(attributePaths = { "student", "subject" })
    List<Marks> findByStudent_Id(Long studentId);

    @EntityGraph(attributePaths = { "student", "subject" })
    Page<Marks> findByStudent_Id(Long studentId, Pageable pageable);

    List<Marks> findByStudent_IdAndSemester(Long studentId, Integer semester);

    Page<Marks> findByStudent_IdAndSemester(Long studentId, Integer semester, Pageable pageable);

    @EntityGraph(attributePaths = { "student", "subject" })
    @Query("SELECT m FROM Marks m JOIN m.student s WHERE s.department.id = :departmentId")
    List<Marks> findByDepartmentId(Long departmentId);

    @EntityGraph(attributePaths = { "student", "subject" })
    @Query("SELECT m FROM Marks m WHERE m.student.id IN :studentIds")
    List<Marks> findAllByStudentIdIn(Collection<Long> studentIds);
}
