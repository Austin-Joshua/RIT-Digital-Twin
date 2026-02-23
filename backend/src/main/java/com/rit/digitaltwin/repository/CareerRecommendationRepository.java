package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.CareerRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CareerRecommendationRepository extends JpaRepository<CareerRecommendation, Long> {
    Optional<CareerRecommendation> findByStudentId(Long studentId);
}
