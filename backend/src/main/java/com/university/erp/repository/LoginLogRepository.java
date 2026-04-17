package com.university.erp.repository;

import com.university.erp.model.LoginLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoginLogRepository extends JpaRepository<LoginLog, Long> {
    List<LoginLog> findByUsernameOrderByLoginTimeDesc(String username);
    List<LoginLog> findTop10ByUsernameOrderByLoginTimeDesc(String username);
    long countByIpAddressAndStatusAndLoginTimeAfter(String ipAddress, String status, LocalDateTime loginTime);
}
