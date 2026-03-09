package com.coursescheduling.server.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;

// This class initializes the Firebase app and provides a Firestore bean for dependency injection.
@Configuration
public class FirebaseConfig {

    // Initialize Firebase app with credentials from the service account JSON file.
    @PostConstruct
    public void initialize() {
        // Load the service account key from the classpath and initialize Firebase.
        try {
            // Load the service account key from the classpath
            InputStream serviceAccount =
                    getClass().getClassLoader().getResourceAsStream("firebase/serviceAccountKey.json");
            // Build Firebase options with the loaded credentials
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();
            // Initialize Firebase app if it hasn't been initialized yet
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }

            System.out.println("Firebase initialized successfully");
        // Catch and print any exceptions that occur during initialization
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    // Provide a Firestore bean for dependency injection in other components.
    @Bean
    public Firestore getFirestore() {
        return FirestoreClient.getFirestore();
    }
}