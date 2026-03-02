package com.university.erp.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("admin123:" + encoder.encode("admin123"));
        System.out.println("faculty123:" + encoder.encode("faculty123"));
        System.out.println("student123:" + encoder.encode("student123"));
    }
}
