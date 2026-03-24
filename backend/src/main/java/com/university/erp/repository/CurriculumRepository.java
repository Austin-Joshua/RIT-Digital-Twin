package com.university.erp.repository;

import com.university.erp.entity.Curriculum;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CurriculumRepository extends JpaRepository<Curriculum, Long> {
    Optional<Curriculum> findByDepartmentAndRegulationYearAndBatchRange(String department, Integer regulationYear, String batchRange);
}
