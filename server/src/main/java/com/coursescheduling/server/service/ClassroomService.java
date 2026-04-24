package com.coursescheduling.server.service;

import com.coursescheduling.server.model.Classroom;
import com.coursescheduling.server.model.ClassroomDeleteRequest;
import com.coursescheduling.server.model.RoomType;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.google.api.core.ApiFuture;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ClassroomService {
	
	private List<Classroom> cachedClassrooms = null;
	private long lastFetchTime = 0;
	private static final long CACHE_DURATION = 30 * 60 * 1000;
	

    public void saveClassroomsToFirebase(List<Classroom> classrooms) throws Exception {

    	this.cachedClassrooms = null;
    	
        Firestore db = FirestoreClient.getFirestore();

        ApiFuture<QuerySnapshot> future = db.collection("classrooms").get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        WriteBatch deleteBatch = db.batch();

        for (QueryDocumentSnapshot doc : documents) {
            deleteBatch.delete(doc.getReference());
        }

        deleteBatch.commit().get();


        WriteBatch batch = db.batch();

        for (Classroom classroom : classrooms) {

            Map<String, Object> data = new HashMap<>();
            data.put("capacity", classroom.getCapacity());
            data.put("type", classroom.getType().name());

            DocumentReference docRef =
                    db.collection("classrooms")
                            .document(classroom.getBuilding());

            batch.set(
                    docRef,
                    Map.of(classroom.getClassroomName(), data),
                    SetOptions.merge()
            );
        }

        batch.commit().get();
    }


    public void saveSingleClassroom(Classroom classroom) {

    	this.cachedClassrooms = null;
    	
        Firestore db = FirestoreClient.getFirestore();

        Map<String, Object> data = new HashMap<>();
        data.put("capacity", classroom.getCapacity());
        data.put("type", classroom.getType());

        db.collection("classrooms")
                .document(classroom.getBuilding())
                .set(Map.of(classroom.getClassroomName(), data), SetOptions.merge());
    }


    public void deleteClassrooms(List<ClassroomDeleteRequest> classrooms) throws Exception {

    	this.cachedClassrooms = null;
    	
        Firestore db = FirestoreClient.getFirestore();
        WriteBatch batch = db.batch();

        for (ClassroomDeleteRequest classroom : classrooms) {

            DocumentReference docRef =
                    db.collection("classrooms")
                            .document(classroom.getBuilding());

            Map<String, Object> updates = new HashMap<>();
            updates.put(classroom.getClassroomName(), FieldValue.delete());

            batch.update(docRef, updates);
        }

        batch.commit().get();
    }
    
    
    
    
    public List<Classroom> getAllClassrooms() throws Exception {
    	
    	if (cachedClassrooms != null && (System.currentTimeMillis() - lastFetchTime < CACHE_DURATION)) {
            System.out.println("Returning Classrooms from Server Cache");
            return cachedClassrooms;
        }

        Firestore db = FirestoreClient.getFirestore();

        List<Classroom> classrooms = new ArrayList<>();

        ApiFuture<QuerySnapshot> future = db.collection("classrooms").get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        for (QueryDocumentSnapshot doc : documents) {

            String building = doc.getId();
            Map<String, Object> data = doc.getData();

            for (String classroomName : data.keySet()) {

                Map<String, Object> classroomData = (Map<String, Object>) data.get(classroomName);

                int capacity = ((Number) classroomData.get("capacity")).intValue();
                String typeStr = (String) classroomData.get("type");
                
                Classroom classroom = new Classroom();

                classroom.setBuilding(building);
                classroom.setClassroomName(classroomName);
                classroom.setCapacity(capacity);


                RoomType type;

                try {
                    if (typeStr != null && !typeStr.isEmpty()) {
                        String normalized = typeStr.trim().toUpperCase().replace(" ", "_");
                        type = RoomType.valueOf(normalized);
                    } else {
                        type = RoomType.NORMAL;
                    }
                } catch (IllegalArgumentException e) {
                    String t = typeStr.toLowerCase();
                    if (t.contains("physics")) type = RoomType.PHYSICS_LAB;
                    else if (t.contains("network")) type = RoomType.NETWORKING_LAB;
                    else if (t.contains("auditorium")) type = RoomType.AUDITORIUM;
                    else if (t.contains("lab")) type = RoomType.LAB;
                    else type = RoomType.NORMAL;
                }
                classroom.setType(type);

                classrooms.add(classroom);
            }
        }

        this.cachedClassrooms = classrooms;
        this.lastFetchTime = System.currentTimeMillis();
        
        return classrooms;
    }
    
    
    public void updateClassroom(Classroom oldClassroom, Classroom newClassroom) throws Exception {

    	this.cachedClassrooms = null;
    	
        Firestore db = FirestoreClient.getFirestore();
        WriteBatch batch = db.batch();

        DocumentReference oldDoc =
                db.collection("classrooms")
                  .document(oldClassroom.getBuilding());

        Map<String, Object> deleteMap = new HashMap<>();
        deleteMap.put(oldClassroom.getClassroomName(), FieldValue.delete());

        batch.update(oldDoc, deleteMap);


        DocumentReference newDoc =
                db.collection("classrooms")
                  .document(newClassroom.getBuilding());

        Map<String, Object> data = new HashMap<>();
        data.put("capacity", newClassroom.getCapacity());
        data.put("type", newClassroom.getType());

        batch.set(
                newDoc,
                Map.of(newClassroom.getClassroomName(), data),
                SetOptions.merge()
        );

        batch.commit().get();
    }
    
    
    
}