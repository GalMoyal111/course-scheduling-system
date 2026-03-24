package com.coursescheduling.server.service;

import com.coursescheduling.server.model.Classroom;
import com.coursescheduling.server.model.ClassroomDeleteRequest;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.google.api.core.ApiFuture;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ClassroomService {

    public void saveClassroomsToFirebase(List<Classroom> classrooms) throws Exception {

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
            data.put("type", classroom.getType());

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

        Firestore db = FirestoreClient.getFirestore();

        Map<String, Object> data = new HashMap<>();
        data.put("capacity", classroom.getCapacity());
        data.put("type", classroom.getType());

        db.collection("classrooms")
                .document(classroom.getBuilding())
                .set(Map.of(classroom.getClassroomName(), data), SetOptions.merge());
    }


    public void deleteClassrooms(List<ClassroomDeleteRequest> classrooms) throws Exception {

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
                String type = (String) classroomData.get("type");

                Classroom classroom = new Classroom();

                classroom.setBuilding(building);
                classroom.setClassroomName(classroomName);
                classroom.setCapacity(capacity);
                classroom.setType(type);

                classrooms.add(classroom);
            }
        }

        return classrooms;
    }
    
    
    public void updateClassroom(Classroom oldClassroom, Classroom newClassroom) throws Exception {

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