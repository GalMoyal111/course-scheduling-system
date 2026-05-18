package com.coursescheduling.server.service;

import com.coursescheduling.server.model.Lecturer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteBatch;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class LecturerService {

    private static final String COLLECTION_NAME = "lecturers";
    private List<Lecturer> cachedLecturers = null;
    private long lastFetchTime = 0;
    private static final long CACHE_DURATION = 60 * 60 * 1000;
    private LecturerExcelService.LecturerUploadSummary cachedSummary = null;
    
    public List<Lecturer> getAllLecturers() throws Exception {
        if (cachedLecturers != null && (System.currentTimeMillis() - lastFetchTime < CACHE_DURATION)) {
            System.out.println("Returning Lecturers from Server Cache");
            return new ArrayList<>(cachedLecturers);
        }

        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<QuerySnapshot> future = db.collection(COLLECTION_NAME).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        List<Lecturer> lecturers = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            Lecturer lecturer = document.toObject(Lecturer.class);
            lecturer.setId(document.getId());
            lecturers.add(lecturer);
        }

        this.cachedLecturers = new ArrayList<>(lecturers);
        this.lastFetchTime = System.currentTimeMillis();

        return new ArrayList<>(lecturers);
    }

    public Lecturer addLecturer(Lecturer lecturer) throws Exception {
        
        Firestore db = FirestoreClient.getFirestore();

        if (lecturer.getName() != null) {
            lecturer.setName(lecturer.getName().trim());
        }

        String id = (lecturer.getId() != null && !String.valueOf(lecturer.getId()).isEmpty())
                ? String.valueOf(lecturer.getId())
                : db.collection(COLLECTION_NAME).document().getId();

        DocumentReference docRef = db.collection(COLLECTION_NAME).document(id);
        lecturer.setId(id);
        docRef.set(lecturer).get();

        this.cachedLecturers = null;
        this.lastFetchTime = 0;
        return lecturer;
    }

    public void updateLecturer(Lecturer lecturer) throws Exception {
        
        Firestore db = FirestoreClient.getFirestore();

        if (lecturer.getId() != null) {
            db.collection(COLLECTION_NAME).document(String.valueOf(lecturer.getId())).set(lecturer).get();
            this.cachedLecturers = null;
            this.lastFetchTime = 0;
        } else {
            throw new Exception("Cannot update lecturer without an ID");
        }
    }

    public void deleteLecturers(List<Lecturer> lecturers) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        WriteBatch batch = db.batch();

        for (Lecturer lecturer : lecturers) {
            if (lecturer.getId() != null) {
                DocumentReference docRef = db.collection(COLLECTION_NAME).document(String.valueOf(lecturer.getId()));
                batch.delete(docRef);
            }
        }
        batch.commit().get();
        this.cachedLecturers = null;
        this.lastFetchTime = 0;

    }

    public void saveLecturersBatch(List<Lecturer> lecturers) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        WriteBatch batch = db.batch();

        for (Lecturer lecturer : lecturers) {
            String id = (lecturer.getId() != null && !lecturer.getId().isEmpty())
                    ? lecturer.getId()
                    : db.collection(COLLECTION_NAME).document().getId();

            DocumentReference docRef = db.collection(COLLECTION_NAME).document(id);
            lecturer.setId(id);
            batch.set(docRef, lecturer);
        }
        batch.commit().get();
        this.cachedLecturers = null;
        this.lastFetchTime = 0;

    }

    public void deleteAllLecturers() throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        Iterable<DocumentReference> docRefs = db.collection(COLLECTION_NAME).listDocuments();

        WriteBatch batch = db.batch();
        boolean hasOperations = false;

        for (DocumentReference docRef : docRefs) {
            batch.delete(docRef);
            hasOperations = true;
        }
        if (hasOperations) {
            batch.commit().get();
            this.cachedLecturers = null;
            this.lastFetchTime = 0;

        }
    }
    
    public void saveSummary(LecturerExcelService.LecturerUploadSummary summary) {

        this.cachedSummary = summary;

        Firestore db = FirestoreClient.getFirestore();

        ObjectMapper mapper = new ObjectMapper();

        Map<String, Object> summaryMap = mapper.convertValue(summary, Map.class);

        db.collection("system_data")
          .document("lastLecturerUploadSummary")
          .set(summaryMap);
    }
    
    public LecturerExcelService.LecturerUploadSummary getLatestSummary() {

        if (this.cachedSummary != null) {
            return this.cachedSummary;
        }

        Firestore db = FirestoreClient.getFirestore();

        try {

            var doc = db.collection("system_data")
                    .document("lastLecturerUploadSummary")
                    .get()
                    .get();

            if (doc.exists()) {

                ObjectMapper mapper = new ObjectMapper();

                this.cachedSummary =
                        mapper.convertValue(
                                doc.getData(),
                                LecturerExcelService.LecturerUploadSummary.class
                        );

                return this.cachedSummary;
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }
    
    
}