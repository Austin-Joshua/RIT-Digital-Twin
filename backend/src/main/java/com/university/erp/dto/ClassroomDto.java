package com.university.erp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClassroomDto {
    private Long id;
    private String name;
    private String buildingName;
    private Integer capacity;
    private String type;
    private Boolean available;
}
