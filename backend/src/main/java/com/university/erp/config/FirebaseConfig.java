package com.university.erp.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${app.firebase.credentials:}")
    private String firebaseCredentialsJson;

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream serviceAccount;

                // 1. Try to load from Environment Variable (for Render/Production)
                if (firebaseCredentialsJson != null && !firebaseCredentialsJson.trim().isEmpty()) {
                    serviceAccount = new java.io.ByteArrayInputStream(firebaseCredentialsJson.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                    System.out.println("Firebase Auth: Loaded service account from Environment Variable");
                } 
                // 2. Fall back to local file (for local development)
                else {
                    serviceAccount = getClass().getClassLoader().getResourceAsStream("firebase-service-account.json");
                    if (serviceAccount == null) {
                        throw new IOException("Could not find firebase-service-account.json in classpath resources, and FIREBASE_CREDENTIALS env var is missing.");
                    }
                    System.out.println("Firebase Auth: Loaded service account from local resource file");
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
