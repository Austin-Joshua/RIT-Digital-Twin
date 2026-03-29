package com.university.erp.repository;

import com.university.erp.model.Section;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SectionRepository extends JpaRepository<Section, Long> {
    Optional<Section> findBySectionNameIgnoreCase(String sectionName);
}
