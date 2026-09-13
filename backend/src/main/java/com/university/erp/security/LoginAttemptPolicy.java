package com.university.erp.security;

/**
 * One failed secret increments the stored counter once. Success clears it.
 * A locked account is not incremented again.
 */
public final class LoginAttemptPolicy {

    public static final int MAX_ATTEMPTS = 5;

    private LoginAttemptPolicy() {
    }

    public static int onSuccess() {
        return 0;
    }

    public static Outcome onFailure(int currentAttempts, boolean alreadyLocked) {
        if (alreadyLocked) {
            return new Outcome(currentAttempts, true, "Account locked due to 5 failed attempts. Contact admin.");
        }
        int next = currentAttempts + 1;
        if (next >= MAX_ATTEMPTS) {
            return new Outcome(next, true, "Account locked due to 5 failed attempts. Contact admin.");
        }
        return new Outcome(next, false, "Invalid username or password. " + (MAX_ATTEMPTS - next) + " attempts remaining.");
    }

    public record Outcome(int attempts, boolean locked, String message) {
    }
}
