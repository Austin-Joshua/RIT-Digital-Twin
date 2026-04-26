package com.university.erp.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

@Configuration
public class FirebaseConfig {

    @Value("${app.firebase.credentials:}")
    private String firebaseCredentialsJson;

    @Value("${app.firebase.credentials-file:}")
    private String firebaseCredentialsFile;

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream serviceAccount;

                // 1. Try to load from Environment Variable (for Render/Production)
                if (firebaseCredentialsJson != null && !firebaseCredentialsJson.trim().isEmpty()) {
                    serviceAccount = new java.io.ByteArrayInputStream(firebaseCredentialsJson.getBytes(StandardCharsets.UTF_8));
                    System.out.println("Firebase Auth: Loaded service account from Environment Variable");
                }
                // 2. Try external file path (for local development)
                else if (firebaseCredentialsFile != null && !firebaseCredentialsFile.trim().isEmpty()) {
                    Path credentialsPath = Path.of(firebaseCredentialsFile.trim());
                    if (!Files.exists(credentialsPath)) {
                        throw new IOException("Firebase credentials file not found: " + credentialsPath);
                    }
                    serviceAccount = new FileInputStream(credentialsPath.toFile());
                    System.out.println("Firebase Auth: Loaded service account from file path");
                }
                // 3. Fall back to common local file locations
                else {
                    Path[] localCandidates = new Path[] {
                            Path.of("backend", "secrets", "firebase-service-account.json"),
                            Path.of("secrets", "firebase-service-account.json")
                    };
                    InputStream resolved = null;
                    for (Path candidate : localCandidates) {
                        if (Files.exists(candidate)) {
                            resolved = new FileInputStream(candidate.toFile());
                            System.out.println("Firebase Auth: Loaded service account from local file: " + candidate);
                            break;
                        }
                    }
                    if (resolved == null) {
                        // 4. Final fallback to classpath file
                        resolved = getClass().getClassLoader().getResourceAsStream("firebase-service-account.json");
                        if (resolved != null) {
                            System.out.println("Firebase Auth: Loaded service account from classpath resource.");
                        }
                    }
                    if (resolved == null) {
                        throw new IOException("Could not find Firebase credentials in env, file path, local secrets, or classpath.");
                    }
                    serviceAccount = resolved;
                }

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                FirebaseApp.initializeApp(options);
                System.out.println("Firebase Admin SDK initialized successfully.");
            }
        } catch (IOException e) {
            System.err.println("Firebase initialization failed: " + e.getMessage());
        }
    }
}
