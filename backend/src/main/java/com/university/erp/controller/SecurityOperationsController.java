package com.university.erp.controller;

import com.university.erp.dto.SecuritySystemReportDto;
import com.university.erp.service.SecureDataPlatformService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/security")
@RequiredArgsConstructor
public class SecurityOperationsController {

    private final SecureDataPlatformService secureDataPlatformService;

    @GetMapping("/system-report")
    @PreAuthorize("hasAnyRole('ADMIN','HOD')")
    public ResponseEntity<SecuritySystemReportDto> systemReport() {
        return ResponseEntity.ok(secureDataPlatformService.getSystemReport());
    }
}
