package com.university.erp.repository;

import com.university.erp.model.Club;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClubRepository extends JpaRepository<Club, Long> {

    @EntityGraph(attributePaths = { "facultyCoordinator", "facultyCoordinator.department" })
    List<Club> findAllByOrderByClubNameAsc();

    @EntityGraph(attributePaths = { "facultyCoordinator", "facultyCoordinator.department" })
    Optional<Club> findByClubId(Long clubId);

    boolean existsByClubNameIgnoreCase(String clubName);

    List<Club> findByFacultyCoordinator_IdOrderByClubNameAsc(Long facultyCoordinatorId);

    List<Club> findByFacultyCoordinator_Department_IdOrderByClubNameAsc(Long departmentId);
}
