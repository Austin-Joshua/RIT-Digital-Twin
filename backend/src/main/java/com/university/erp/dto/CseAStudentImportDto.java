package com.university.erp.dto;

import lombok.Data;

@Data
public class CseAStudentImportDto {
    private String registerNo;
    private String name;
    private String scholarType; // Day Scholar / Hosteller
    private String email;
    private String phone;
}
