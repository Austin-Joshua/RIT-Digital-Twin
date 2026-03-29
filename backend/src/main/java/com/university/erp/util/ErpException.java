package com.university.erp.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Standard Application Exception for RIT Digital Twin.
 * Consolidated into the util package during architectural cleanup.
 */
public class ErpException extends RuntimeException {
    
    public ErpException(String message) {
        super(message);
    }

    public ErpException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * Specialized exception for missing entities.
     * Maps to HTTP 404 via @ResponseStatus.
     */
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class ResourceNotFoundException extends ErpException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
    }

    /**
     * Specialized exception for security/scope violations if AccessDeniedException is not suitable.
     */
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public static class UnauthorizedAccessException extends ErpException {
        public UnauthorizedAccessException(String message) {
            super(message);
        }
    }

    /**
     * Specialized exception for illegal operations or invalid state.
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public static class InvalidOperationException extends ErpException {
        public InvalidOperationException(String message) {
            super(message);
        }
    }
}

