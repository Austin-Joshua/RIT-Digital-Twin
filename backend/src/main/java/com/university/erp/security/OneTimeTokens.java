package com.university.erp.security;

import java.security.SecureRandom;
import java.util.Base64;

/** Unguessable one-time passwords. Callers must not log the returned value. */
public final class OneTimeTokens {

    private static final SecureRandom RANDOM = new SecureRandom();

    private OneTimeTokens() {
    }

    public static String generate() {
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
