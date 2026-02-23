package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ParentRepository extends JpaRepository<Parent, Long> {
    Optional<Parent> findByUserUserId(Long userId);

    Optional<Parent> findByUserUsername(String username);
}
