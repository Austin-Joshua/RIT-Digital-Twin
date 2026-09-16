package com.university.erp.util;

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
     * Validates that uploaded file does not exceed institutional limits.
     */
    public static void validateFileSize(long sizeBytes) {
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
     * Generates an isolated, collision-safe physical storage path outside web root.
     */
    public static String generateSecureStoragePath(String module, String sanitizedFilename) {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        return "/var/rit_storage/" + module + "/" + uuid + "_" + sanitizedFilename;
    }
}
