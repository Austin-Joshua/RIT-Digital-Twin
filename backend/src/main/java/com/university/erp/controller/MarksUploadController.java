package com.university.erp.controller;

import com.university.erp.dto.MarksUploadRequestDto;
import com.university.erp.service.AcademicService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({ "/api/marks", "/api/academics/marks" })
public class MarksUploadController {

    private final AcademicService academicService;

    public MarksUploadController(AcademicService academicService) {
        this.academicService = academicService;
    }

    @PostMapping("/bulk-upload")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<?> bulkUploadMarks(@RequestBody List<MarksUploadRequestDto> payload) {
        academicService.bulkUploadMarks(payload);
        return ResponseEntity.ok(Map.of("message", "Marks successfully processed and saved."));
    }
}
