package com.university.erp.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevaluationRequestDto {
    private Long marksId;
    private String reason;
    // Optional override values if student is supplying expected corrections
    private BigDecimal proposedInternal;
    private BigDecimal proposedExternal;
}

