package com.university.erp.repository.projection;

import java.math.BigDecimal;

public interface StudentAdminSummaryProjection {
    Long getStudentId();
    String getRegisterNo();
    String getName();
    String getDepartment();
    String getSection();
    String getBatch();
    String getScholarType();
    String getEmail();
    String getPhone();
    String getStatus();
    BigDecimal getCgpa();
}
