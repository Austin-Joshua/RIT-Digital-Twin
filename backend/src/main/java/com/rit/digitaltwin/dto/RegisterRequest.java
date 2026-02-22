package com.rit.digitaltwin.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String role; // ADMIN, MANAGEMENT, FACULTY, STUDENT
}
