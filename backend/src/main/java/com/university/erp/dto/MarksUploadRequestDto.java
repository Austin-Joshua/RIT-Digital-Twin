package com.university.erp.dto;

import lombok.Data;

@Data
public class MarksUploadRequestDto {
    private String studentIdentifier; // RegNo or Email
    private String subjectCode;
    private Double cat1;
    private Double cat2;
    private Double cat3;
    private Double assignment;
    private String semesterGrade;
}
