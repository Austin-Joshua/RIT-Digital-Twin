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
        return registerNo != null && registerNo.matches("^211724002\\d{4}$|^211724008\\d{4}$|^2117\\d+$");
    }

    public static String departmentCode(String registerNo) {
        if (registerNo != null && registerNo.startsWith("211724008")) {
            return "CSBS";
        }
        return "CSE";
    }

    public static String studentPassword(String registerNo) {
        return registerNo != null ? registerNo.trim() : "";
    }

    public static String studentPhone(String registerNo) {
        return "9" + tail(registerNo, 9);
    }

    public static String parentPhone(String registerNo) {
        return "8" + tail(registerNo, 9);
    }

    public static String emailNumberSuffix(String registerNo) {
        if (registerNo == null) {
            return "000000";
        }
        String digits = registerNo.replaceAll("\\D", "");
        if (digits.length() >= 13) {
            String year = digits.substring(4, 6);
            String roll = digits.substring(digits.length() - 4);
            return year + roll;
        }
        return tail(digits, 6);
    }

    public static String collegeEmail(String registerNo, String firstName) {
        String namePart = firstName != null && !firstName.isBlank()
                ? firstName.trim().split(" ")[0].toLowerCase(Locale.ROOT)
                : "student";
        String suffix = emailNumberSuffix(registerNo);
        return namePart + "." + suffix + "@" + departmentCode(registerNo).toLowerCase(Locale.ROOT) + ".ritchennai.edu.in";
    }

    public static String collegeEmail(String registerNo) {
        return collegeEmail(registerNo, "student");
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
        if (submitted == null || stored == null || stored.isBlank()) {
            return false;
        }
        String sClean = submitted.trim();
        String stClean = stored.trim();
        if (java.security.MessageDigest.isEqual(sClean.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                stClean.getBytes(java.nio.charset.StandardCharsets.UTF_8))) {
            return true;
        }
        return false;
    }

    private static String tail(String value, int length) {
        String digits = value == null ? "" : value.replaceAll("\\D", "");
        if (digits.length() < length) {
            return "0".repeat(length - digits.length()) + digits;
        }
        return digits.substring(digits.length() - length);
    }
}
