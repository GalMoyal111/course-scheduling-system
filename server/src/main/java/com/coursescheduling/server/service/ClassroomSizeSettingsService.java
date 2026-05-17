package com.coursescheduling.server.service;

import com.coursescheduling.server.model.ClassroomSizeSettings;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

@Service
public class ClassroomSizeSettingsService {

    private static final String SETTINGS_COLLECTION = "system_settings";
    private static final String CLASSROOM_SIZE_DOC = "classroom_size_requirements";

    private ClassroomSizeSettings cachedSettings = null;
    private long lastFetchTime = 0;
    private static final long CACHE_DURATION = 60 * 60 * 1000;


    public ClassroomSizeSettings getClassroomSizeSettings() throws Exception {

            if (cachedSettings != null && (System.currentTimeMillis() - lastFetchTime < CACHE_DURATION)) {
                System.out.println("Returning Classroom Size Settings from Server Cache");
                return cachedSettings;
            }

            Firestore db = FirestoreClient.getFirestore();
            DocumentSnapshot doc = db.collection(SETTINGS_COLLECTION).document(CLASSROOM_SIZE_DOC).get().get();

            ClassroomSizeSettings settings;

            if (doc.exists()) {
                settings = doc.toObject(ClassroomSizeSettings.class);
            } else {
                settings = ClassroomSizeSettings.createDefault();
                db.collection(SETTINGS_COLLECTION).document(CLASSROOM_SIZE_DOC).set(settings).get();
            }

            this.cachedSettings = settings;
            this.lastFetchTime = System.currentTimeMillis();

            return settings;
        }
    

    public void updateClassroomSizeSettings(ClassroomSizeSettings settings) throws Exception {
        this.cachedSettings = null;
        Firestore db = FirestoreClient.getFirestore();
        if(settings == null) {
            throw new IllegalArgumentException("Settings cannot be null");
        }
        db.collection(SETTINGS_COLLECTION).document(CLASSROOM_SIZE_DOC).set(settings).get();
    }

}