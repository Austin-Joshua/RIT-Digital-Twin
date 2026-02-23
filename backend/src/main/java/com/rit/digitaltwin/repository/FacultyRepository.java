package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByFacultyIdNumber(String facultyIdNumber);

    Optional<Faculty> findByUserUsername(String username);

    Optional<Faculty> findByUserUserId(Long userId);
}
