package com.university.erp.repository;

import com.university.erp.model.ResearchPublication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResearchPublicationRepository extends JpaRepository<ResearchPublication, Long> {
    List<ResearchPublication> findAllByOrderByCreatedAtDesc();
    List<ResearchPublication> findByUser_UserIdOrderByCreatedAtDesc(Long userId);
}
