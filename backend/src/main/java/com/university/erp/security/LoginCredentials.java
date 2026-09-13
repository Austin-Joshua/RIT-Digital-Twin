package com.university.erp.security;

import java.util.Locale;
import java.util.Optional;

/**
 * Local login identities. A class student keeps one account for register number,
 * college email, and phone. Non-student accounts use mock staff credentials.
 * Known passwords are not logged.
 */
public final class LoginCredentials {

    public static final String STAFF_MOCK_PASSWORD = "Rit-Mock-2026";

    private LoginCredentials() {
    }

    public static boolean classRegister(String registerNo) {
        return registerNo != null && registerNo.matches("^211724002\\d{4}$|^211724008\\d{4}$");
    }

    public static String departmentCode(String registerNo) {
        if (registerNo != null && registerNo.startsWith("211724008")) {
            return "CSBS";
        }
        return "CSE";
    }

    public static String studentPassword(String registerNo) {
        return "Rit-" + tail(registerNo, 6);
    }

    public static String studentPhone(String registerNo) {
        return "9" + tail(registerNo, 9);
    }

    public static String parentPhone(String registerNo) {
        return "8" + tail(registerNo, 9);
    }

    public static String collegeEmail(String registerNo) {
        return registerNo + "@" + departmentCode(registerNo).toLowerCase(Locale.ROOT) + ".ritchennai.edu.in";
    }

    public static String parentEmail(String registerNo) {
        return registerNo + ".parent@" + departmentCode(registerNo).toLowerCase(Locale.ROOT) + ".ritchennai.edu.in";
    }

    public static String parentUsername(String registerNo) {
        return "P-" + registerNo;
    }

    public static String staffPhone(long userId) {
        return String.format("6%09d", Math.floorMod(userId, 1_000_000_000L));
    }

    public static Optional<String> storedUsername(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return Optional.empty();
        }
        String value = identifier.trim();
        String lower = value.toLowerCase(Locale.ROOT);
        if (lower.matches("^hod-[a-z0-9]+$")) {
            return Optional.of("hod_" + lower.substring(4) + "@ritchennai.edu.in");
        }
        if (lower.matches("^\\d{10,14}_parent@ritchennai\\.edu\\.in$")) {
            return Optional.of("P-" + lower.substring(0, lower.indexOf('_')));
        }
        if (lower.matches("^\\d{10,14}\\.parent@[a-z0-9]+\\.ritchennai\\.edu\\.in$")) {
            return Optional.of("P-" + lower.substring(0, lower.indexOf('.')));
        }
        return Optional.empty();
    }

    public static boolean sameSecret(String submitted, String stored) {
        if (submitted == null || stored == null || stored.isBlank() || !stored.matches("^\\d{10}$")) {
            return false;
        }
        return java.security.MessageDigest.isEqual(submitted.trim().getBytes(java.nio.charset.StandardCharsets.UTF_8),
                stored.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    private static String tail(String value, int length) {
        String digits = value == null ? "" : value.replaceAll("\\D", "");
        if (digits.length() < length) {
            return "0".repeat(length - digits.length()) + digits;
        }
        return digits.substring(digits.length() - length);
    }
}
