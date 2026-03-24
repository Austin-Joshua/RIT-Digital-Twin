package com.university.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;
    private Long id;
    private String username;
    private String role;
    private String email;
    private String firstName;
    private String lastName;
    private Boolean forcePasswordChange;
}
