package com.coursescheduling.server.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            // קודם כל, נבדוק אם כבר יש אפליקציה מאותחלת (מונע שגיאות כפולות)
            if (!FirebaseApp.getApps().isEmpty()) {
                return;
            }

            InputStream serviceAccount = null;

            // 1. ננסה לחפש משתנה סביבה (מתאים לענן - Render)
            String firebaseKey = System.getenv("FIREBASE_SERVICE_ACCOUNT");
            if (firebaseKey != null && !firebaseKey.trim().isEmpty()) {
                serviceAccount = new ByteArrayInputStream(firebaseKey.getBytes(StandardCharsets.UTF_8));
                System.out.println("✅ Using Firebase key from Environment Variable.");
            } else {
                // 2. אם אין משתנה סביבה, ננסה למצוא את הקובץ הפיזי (מתאים לפיתוח מקומי)
                serviceAccount = getClass().getClassLoader().getResourceAsStream("firebase/serviceAccountKey.json");
                if (serviceAccount != null) {
                    System.out.println("✅ Using Firebase key from local JSON file.");
                }
            }

            // 3. אם גם הקובץ לא נמצא, רק אז נזרוק שגיאה שעוצרת הכל
            if (serviceAccount == null) {
                throw new IllegalStateException("❌ Firebase service account key not found! Missing environment variable or local file.");
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
            System.out.println("✅ Firebase initialized successfully");

        } catch (Exception e) {
            System.err.println("❌ Failed to initialize Firebase:");
            e.printStackTrace();
            throw new RuntimeException("Firebase initialization failed", e);
        }
    }

    @Bean
    public Firestore getFirestore() {
        return FirestoreClient.getFirestore();
    }
}