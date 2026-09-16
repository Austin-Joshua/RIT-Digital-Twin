package com.university.erp.controller;

import com.university.erp.model.CourseMaterial;
import com.university.erp.repository.CourseMaterialRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.university.erp.util.FileUploadSecurityValidator;

@RestController
@RequestMapping("/api/materials")
public class CourseMaterialController {

    private final CourseMaterialRepository materialRepository;

    public CourseMaterialController(CourseMaterialRepository materialRepository) {
        this.materialRepository = materialRepository;
    }

    @GetMapping
    public ResponseEntity<List<CourseMaterial>> getMaterials(@RequestParam(required = false) String subjectCode) {
        if (subjectCode != null && !subjectCode.isBlank()) {
            return ResponseEntity.ok(materialRepository.findBySubjectCodeOrderByCreatedAtDesc(subjectCode.trim()));
        }
        return ResponseEntity.ok(materialRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FACULTY', 'HOD', 'ADMIN')")
    public ResponseEntity<CourseMaterial> uploadMaterial(
            @RequestBody Map<String, Object> payload,
            Authentication auth) {

        String subjectCode = String.valueOf(payload.getOrDefault("subjectCode", payload.getOrDefault("subject", "GENERIC")));
        String title = String.valueOf(payload.getOrDefault("title", "Lecture Notes"));
        String fileType = String.valueOf(payload.getOrDefault("type", "PDF"));
        String fileSize = String.valueOf(payload.getOrDefault("size", "2.5 MB"));
        
        String candidateFile = String.valueOf(payload.getOrDefault("fileName", title.replaceAll("\\s+", "_") + "." + fileType.toLowerCase()));
        String safeFileName = FileUploadSecurityValidator.sanitizeAndValidateFileName(candidateFile);
        String secureStoragePath = FileUploadSecurityValidator.generateSecureStoragePath("materials", safeFileName);
        String uploadedBy = (auth != null) ? auth.getName() : "FACULTY";

        CourseMaterial material = CourseMaterial.builder()
                .subjectCode(subjectCode)
                .title(title)
                .fileType(fileType.toUpperCase())
                .fileSize(fileSize)
                .filePath(secureStoragePath)
                .uploadedBy(uploadedBy)
                .build();

        return ResponseEntity.ok(materialRepository.save(material));
    }
}
