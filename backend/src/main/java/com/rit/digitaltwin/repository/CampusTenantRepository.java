package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.CampusTenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CampusTenantRepository extends JpaRepository<CampusTenant, Long> {
    Optional<CampusTenant> findByCode(String code);

    Optional<CampusTenant> findBySubdomain(String subdomain);
}
