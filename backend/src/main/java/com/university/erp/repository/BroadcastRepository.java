package com.university.erp.repository;

import com.university.erp.model.Broadcast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BroadcastRepository extends JpaRepository<Broadcast, Long> {
    List<Broadcast> findByActiveTrueOrderByCreatedAtDesc();
    List<Broadcast> findByAudienceInAndActiveTrueOrderByCreatedAtDesc(List<String> audiences);
}
