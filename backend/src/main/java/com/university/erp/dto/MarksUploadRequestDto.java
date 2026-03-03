package com.university.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarksUploadRequestDto {
    private String studentIdentifier; // RegNo or Email
    private String subjectCode;
    private BigDecimal cat1;
    private BigDecimal cat2;
    private BigDecimal cat3;
    private BigDecimal assignment;
    private String semesterGrade;
}
