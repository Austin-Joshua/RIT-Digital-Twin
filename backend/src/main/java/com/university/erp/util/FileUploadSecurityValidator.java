package com.university.erp.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

public final class FileUploadSecurityValidator {

    public static final long MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "zip", "png", "jpg", "jpeg"
    );

    private static final Set<String> PROHIBITED_EXTENSIONS = Set.of(
            "exe", "dll", "jsp", "jspx", "asp", "aspx", "php", "cgi", "sh", "bat", "cmd", "vbs", "js", "jar", "war", "html", "htm"
    );

    private FileUploadSecurityValidator() {}

    /**
     * Validates that uploaded file size does not exceed institutional limits.
     */
    public static void validateFileSize(long sizeBytes) {
        if (sizeBytes <= 0) {
            throw new ErpException.InvalidOperationException("File cannot be empty.");
        }
        if (sizeBytes > MAX_FILE_SIZE_BYTES) {
            throw new ErpException.InvalidOperationException("File size exceeds maximum permitted limit of 25MB.");
        }
    }

    /**
     * Sanitizes client-provided filename and ensures no directory traversal or executable exploits.
     */
    public static String sanitizeAndValidateFileName(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new ErpException.InvalidOperationException("File name cannot be empty.");
        }

        // Strip path traversal attempts and control characters
        String cleanName = originalFilename.trim()
                .replace("\\", "/")
                .replaceAll("/+", "/");

        // Extract raw basename
        if (cleanName.contains("/")) {
            cleanName = cleanName.substring(cleanName.lastIndexOf('/') + 1);
        }

        // Null-byte injection protection
        if (cleanName.contains("\0") || cleanName.contains("..")) {
            throw new ErpException.InvalidOperationException("Security violation: Malicious path traversal sequence detected in filename.");
        }

        // Extension extraction and verification
        int dotIndex = cleanName.lastIndexOf('.');
        if (dotIndex == -1 || dotIndex == cleanName.length() - 1) {
            throw new ErpException.InvalidOperationException("File must have a valid extension.");
        }

        String extension = cleanName.substring(dotIndex + 1).toLowerCase(Locale.ROOT);

        if (PROHIBITED_EXTENSIONS.contains(extension)) {
            throw new ErpException.InvalidOperationException("Security violation: Executable and script file uploads are strictly prohibited (." + extension + ").");
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new ErpException.InvalidOperationException("File format ." + extension + " is not permitted. Allowed: " + ALLOWED_EXTENSIONS);
        }

        // Whitelist filename characters to alphanumeric, dashes, underscores, and dots
        String safeBase = cleanName.substring(0, dotIndex).replaceAll("[^a-zA-Z0-9._-]", "_");
        if (safeBase.isBlank()) {
            safeBase = "attachment";
        }

        return safeBase + "." + extension;
    }

    /**
     * Validates magic bytes/file header against claimed extension.
     */
    public static void validateFileMagicBytes(byte[] headerBytes, String sanitizedFilename) {
        if (headerBytes == null || headerBytes.length < 4) {
            return; // Too short for magic byte verification
        }

        int dotIndex = sanitizedFilename.lastIndexOf('.');
        if (dotIndex == -1) return;
        String extension = sanitizedFilename.substring(dotIndex + 1).toLowerCase(Locale.ROOT);

        if ("pdf".equals(extension)) {
            // %PDF-
            if (headerBytes[0] != 0x25 || headerBytes[1] != 0x50 || headerBytes[2] != 0x44 || headerBytes[3] != 0x46) {
                throw new ErpException.InvalidOperationException("File signature mismatch: File claims to be PDF but header does not match.");
            }
        } else if ("png".equals(extension)) {
            // \x89PNG
            if ((headerBytes[0] & 0xFF) != 0x89 || headerBytes[1] != 0x50 || headerBytes[2] != 0x4E || headerBytes[3] != 0x47) {
                throw new ErpException.InvalidOperationException("File signature mismatch: File claims to be PNG but header does not match.");
            }
        } else if ("jpg".equals(extension) || "jpeg".equals(extension)) {
            // \xFF\xD8\xFF
            if ((headerBytes[0] & 0xFF) != 0xFF || (headerBytes[1] & 0xFF) != 0xD8 || (headerBytes[2] & 0xFF) != 0xFF) {
                throw new ErpException.InvalidOperationException("File signature mismatch: File claims to be JPEG but header does not match.");
            }
        } else if ("zip".equals(extension) || "docx".equals(extension) || "xlsx".equals(extension) || "pptx".equals(extension)) {
            // PK\x03\x04
            if (headerBytes[0] != 0x50 || headerBytes[1] != 0x4B || headerBytes[2] != 0x03 || headerBytes[3] != 0x04) {
                throw new ErpException.InvalidOperationException("File signature mismatch: Archive/Office container header does not match.");
            }
        }
    }

    /**
     * Computes SHA-256 hex checksum.
     */
    public static String computeSha256(byte[] data) {
        if (data == null) return null;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            return UUID.randomUUID().toString();
        }
    }

    /**
     * Generates an isolated, collision-safe physical storage key.
     */
    public static String generateStorageKey(String module, String sanitizedFilename) {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        return module + "/" + uuid + "_" + sanitizedFilename;
    }

    public static String generateSecureStoragePath(String module, String sanitizedFilename) {
        return "/var/rit_storage/" + generateStorageKey(module, sanitizedFilename);
    }
}
