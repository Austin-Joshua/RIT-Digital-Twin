package com.university.erp.repository;

import com.university.erp.model.StudentClubMembership;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StudentClubMembershipRepository extends JpaRepository<StudentClubMembership, Long> {

    @EntityGraph(attributePaths = {
            "student", "student.user", "student.department",
            "club", "club.facultyCoordinator"
    })
    List<StudentClubMembership> findByStudent_IdOrderByJoinedDateDesc(Long studentId);

    @EntityGraph(attributePaths = {
            "student", "student.user", "student.department",
            "club", "club.facultyCoordinator"
    })
    List<StudentClubMembership> findByClub_ClubIdOrderByJoinedDateDesc(Long clubId);

    Optional<StudentClubMembership> findByStudent_IdAndClub_ClubId(Long studentId, Long clubId);

    long countByClub_ClubIdAndStatusIgnoreCase(Long clubId, String status);

    long countByStatusIgnoreCase(String status);

    @Query("""
            select coalesce(s.department.code, 'UNASSIGNED') as deptCode, count(m)
            from StudentClubMembership m
            join m.student s
            where lower(m.status) = 'active'
            group by s.department.code
            order by count(m) desc
            """)
    List<Object[]> participationByDepartment();

    @Query("""
            select coalesce(s.year, 0) as yearValue, count(m)
            from StudentClubMembership m
            join m.student s
            where lower(m.status) = 'active'
            group by s.year
            order by s.year asc
            """)
    List<Object[]> participationByYear();

    @EntityGraph(attributePaths = {
            "student", "student.user", "student.department",
            "club", "club.facultyCoordinator"
    })
    List<StudentClubMembership> findByStatusIgnoreCaseOrderByJoinedDateDesc(String status);
}
