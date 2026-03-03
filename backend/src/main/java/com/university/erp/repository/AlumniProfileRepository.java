package com.university.erp.repository;

import com.university.erp.model.AlumniProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlumniProfileRepository extends JpaRepository<AlumniProfile, Long> {
}
