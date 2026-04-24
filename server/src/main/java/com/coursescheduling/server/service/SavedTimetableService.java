package com.coursescheduling.server.service;

import com.coursescheduling.server.algorithm.model.ScheduledLessonDTO;
import com.coursescheduling.server.model.SaveTimetableRequest;
import com.coursescheduling.server.model.SavedTimetableMetadata;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteBatch;
import com.google.firebase.cloud.FirestoreClient;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class SavedTimetableService {

    private static final String MAIN_COLLECTION = "saved_timetables";
    private static final String SUB_COLLECTION = "schedule_data";

    public SavedTimetableMetadata saveTimetable(SaveTimetableRequest request) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        
        String timetableId = UUID.randomUUID().toString();
        long currentTimestamp = System.currentTimeMillis();

        SavedTimetableMetadata metadata = new SavedTimetableMetadata(
                timetableId,
                request.getName(),
                request.getSemester(),
                currentTimestamp
        );

        WriteBatch batch = db.batch();

        DocumentReference mainDocRef = db.collection(MAIN_COLLECTION).document(timetableId);
        batch.set(mainDocRef, metadata);

        DocumentReference subDocRef = mainDocRef.collection(SUB_COLLECTION).document("full_array");
        
        ScheduleWrapper wrapper = new ScheduleWrapper(request.getSchedule());
        batch.set(subDocRef, wrapper);

        batch.commit().get();

        return metadata; 
    }

    public List<SavedTimetableMetadata> getAllSavedMetadata() throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<QuerySnapshot> future = db.collection(MAIN_COLLECTION).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        List<SavedTimetableMetadata> metadataList = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            SavedTimetableMetadata metadata = document.toObject(SavedTimetableMetadata.class);
            metadataList.add(metadata);
        }

        return metadataList;
    }

    public List<ScheduledLessonDTO> getTimetableDataById(String timetableId) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        
        DocumentReference subDocRef = db.collection(MAIN_COLLECTION)
                                        .document(timetableId)
                                        .collection(SUB_COLLECTION)
                                        .document("full_array");
                                        
        ScheduleWrapper wrapper = subDocRef.get().get().toObject(ScheduleWrapper.class);
        
        if (wrapper != null && wrapper.getLessons() != null) {
            return wrapper.getLessons();
        }
        
        return new ArrayList<>(); 
    }

    public static class ScheduleWrapper {
        private List<ScheduledLessonDTO> lessons;

        public ScheduleWrapper() {} 

        public ScheduleWrapper(List<ScheduledLessonDTO> lessons) {
            this.lessons = lessons;
        }

        public List<ScheduledLessonDTO> getLessons() {
            return lessons;
        }

        public void setLessons(List<ScheduledLessonDTO> lessons) {
            this.lessons = lessons;
        }
    }
}