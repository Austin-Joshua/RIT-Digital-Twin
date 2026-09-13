package com.university.erp.intelligence;

import com.university.erp.security.LoginAttemptPolicy;
import com.university.erp.security.LoginCredentials;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LoginIdentityTest {

    @Test
    void classIdentitiesPointAtTheSameHolder() {
        String registerNo = "2117240020044";
        assertTrue(LoginCredentials.classRegister(registerNo));
        assertTrue(LoginCredentials.classRegister("2117240080119"));
        assertEquals("Rit-020044", LoginCredentials.studentPassword(registerNo));
        assertEquals("9240020044", LoginCredentials.studentPhone(registerNo));
        assertEquals("8240020044", LoginCredentials.parentPhone(registerNo));
        assertEquals("2117240020044@cse.ritchennai.edu.in", LoginCredentials.collegeEmail(registerNo));
        assertEquals("2117240020044.parent@cse.ritchennai.edu.in", LoginCredentials.parentEmail(registerNo));
        assertEquals("P-2117240020044", LoginCredentials.parentUsername(registerNo));
        assertEquals("2117240080119@csbs.ritchennai.edu.in", LoginCredentials.collegeEmail("2117240080119"));
        assertFalse(LoginCredentials.studentPhone(registerNo).equals(LoginCredentials.parentPhone(registerNo)));
    }

    @Test
    void aliasesResolveToTheStoredAccount() {
        assertEquals("hod_cse@ritchennai.edu.in", LoginCredentials.storedUsername("HOD-CSE").orElseThrow());
        assertEquals("P-2117240020044", LoginCredentials.storedUsername("2117240020044_parent@ritchennai.edu.in").orElseThrow());
        assertEquals("P-2117240080119", LoginCredentials.storedUsername("2117240080119.parent@csbs.ritchennai.edu.in").orElseThrow());
        assertTrue(LoginCredentials.sameSecret("9240020044", "9240020044"));
        assertFalse(LoginCredentials.sameSecret("8240020044", "9240020044"));
        assertFalse(LoginCredentials.sameSecret("short", "9240020044"));
    }

    @Test
    void wrongAttemptCountLocksOnceAndClearsOnSuccess() {
        LoginAttemptPolicy.Outcome first = LoginAttemptPolicy.onFailure(0, false);
        assertEquals(1, first.attempts());
        assertFalse(first.locked());
        assertTrue(first.message().contains("4 attempts remaining"));

        LoginAttemptPolicy.Outcome fifth = LoginAttemptPolicy.onFailure(4, false);
        assertEquals(5, fifth.attempts());
        assertTrue(fifth.locked());

        LoginAttemptPolicy.Outcome alreadyLocked = LoginAttemptPolicy.onFailure(5, true);
        assertEquals(5, alreadyLocked.attempts());
        assertEquals(0, LoginAttemptPolicy.onSuccess());
    }
}
