package com.university.erp.repository;

import com.university.erp.entity.Role;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    @Cacheable(value = "roles", key = "#roleName")
    Optional<Role> findByRoleName(Role.UserRole roleName);
}
