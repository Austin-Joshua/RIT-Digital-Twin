package com.university.erp.service;

import java.util.Locale;
import java.util.Set;

/**
 * Status transitions for an existing certificate request.
 * A review does not create a PDF or a second request row.
 */
public final class CertificateReview {

    public static final String REQUESTED = "REQUESTED";
    public static final String PENDING = "PENDING";
    public static final String APPROVED = "APPROVED";
    public static final String REJECTED = "REJECTED";

    private static final Set<String> OPEN = Set.of(REQUESTED, PENDING);
    private static final Set<String> DECISIONS = Set.of(APPROVED, REJECTED);

    private CertificateReview() {
    }

    public static String decide(String current, String requested) {
        String next = requested == null ? "" : requested.trim().toUpperCase(Locale.ROOT);
        if (!DECISIONS.contains(next)) {
            throw new IllegalArgumentException("Decision must be APPROVED or REJECTED.");
        }
        String status = current == null ? "" : current.trim().toUpperCase(Locale.ROOT);
        if (!OPEN.contains(status)) {
            throw new IllegalStateException("Only a requested certificate can be reviewed.");
        }
        return next;
    }
}
