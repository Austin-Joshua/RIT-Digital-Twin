package com.university.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "certificate_requests")
public class CertificateRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;
    private String certificateType; // BONAFIDE, FEE_RECEIPT, TRANSCRIPT
    private String status;         // PENDING, APPROVED, REJECTED
    private String pdfUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
