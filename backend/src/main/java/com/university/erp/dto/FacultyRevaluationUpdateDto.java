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
public class FacultyRevaluationUpdateDto {
    private BigDecimal newInternal;
    private BigDecimal newExternal;
}

