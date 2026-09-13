package com.university.erp.repository;

import com.university.erp.model.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

@Repository
public interface ParentRepository extends JpaRepository<Parent, Long> {
    Optional<Parent> findByUser_Id(Long userId);

    @Query("select p from Parent p join fetch p.student s join fetch s.user left join fetch s.department where p.user.id = :userId")
    Optional<Parent> findAssignedByUserId(@Param("userId") Long userId);
}
