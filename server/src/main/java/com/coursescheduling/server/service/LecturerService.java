package com.coursescheduling.server.service;


import com.coursescheduling.server.model.Lecturer;
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

@Service
public class LecturerService {
	
	private static final String COLLECTION_NAME = "lecturers";
	
	public List<Lecturer> getAllLecturers() throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<QuerySnapshot> future = db.collection(COLLECTION_NAME).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        
        List<Lecturer> lecturers = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            Lecturer lecturer = document.toObject(Lecturer.class);
            lecturer.setId(document.getId()); 
            lecturers.add(lecturer);
        }
        return lecturers;
    }
	
	public void addLecturer(Lecturer lecturer) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        
        if (lecturer.getId() != null && !String.valueOf(lecturer.getId()).isEmpty()) {
            db.collection(COLLECTION_NAME).document(String.valueOf(lecturer.getId())).set(lecturer).get(); 
        } else {
            db.collection(COLLECTION_NAME).add(lecturer).get();
        }
    }



	public void updateLecturer(Lecturer lecturer) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        
        if (lecturer.getId() != null) {
            db.collection(COLLECTION_NAME).document(String.valueOf(lecturer.getId())).set(lecturer) .get();
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
	}

}
