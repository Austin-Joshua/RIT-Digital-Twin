package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.ResearchPublication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResearchPublicationRepository extends JpaRepository<ResearchPublication, Long> {
    List<ResearchPublication> findByFacultyId(Long facultyId);
}
