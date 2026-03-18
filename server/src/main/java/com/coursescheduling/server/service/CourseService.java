package com.coursescheduling.server.service;

import java.util.*;

// import java.util.HashMap;
// import java.util.List;
// import java.util.Map;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.google.protobuf.Api;
import com.coursescheduling.server.model.Classroom;
import com.coursescheduling.server.model.Course;
import com.coursescheduling.server.model.CourseDeleteRequest;
import org.springframework.stereotype.Service;

import org.checkerframework.checker.units.qual.C;

@Service
public class CourseService {

    /* public void saveCoursesToDatabase(List<Course> courses) {
        // Implement logic to save the list of courses to the database (e.g., Firestore)
        Firestore db = FirestoreClient.getFirestore();
        for (Course course : courses) {
            Map<String, Object> data = new HashMap<>();
            data.put("courseName", course.getCourseName());
            data.put("prerequisiteCourseNumberOrConditions", course.getPrerequisiteCourseNumberOrConditions());
            data.put("lectureHours", course.getLectureHours());
            data.put("tutorialHours", course.getTutorialHours());
            data.put("labHours", course.getLabHours());
            data.put("projectHours", course.getProjectHours());
            data.put("credits", course.getCredits());
            data.put("notes", course.getNotes());
            data.put("clusterName", course.getClusterName());

            // db.collection("courses").document(course.getCourseCode()).set(data, SetOptions.merge());
            db.collection("courses").document(course.getSemesterNumber()).set(Map.of(course.getCourseCode(), data), SetOptions.merge());
        }
    } */
    
    public void saveCourseToFirebase(List<Course> courses) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        ApiFuture<QuerySnapshot> future = db.collection("courses").get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        WriteBatch deleteBatch = db.batch();
        for (QueryDocumentSnapshot doc : documents) {
            deleteBatch.delete(doc.getReference());
        }
        deleteBatch.commit().get();
        WriteBatch batch = db.batch();
        for (Course course : courses) {
            Map<String, Object> data = new HashMap<>();
            data.put("courseName", course.getCourseName());
            data.put("prerequisiteCourseNumberOrConditions", course.getPrerequisiteCourseNumberOrConditions());
            data.put("lectureHours", course.getLectureHours());
            data.put("tutorialHours", course.getTutorialHours());
            data.put("labHours", course.getLabHours());
            data.put("projectHours", course.getProjectHours());
            data.put("credits", course.getCredits());
            data.put("notes", course.getNotes());
            data.put("clusterName", course.getClusterName());

            DocumentReference docRef = db.collection("courses").document(course.getCourseId());
            batch.set(docRef, Map.of(course.getCourseId(), data), SetOptions.merge());
        }

        batch.commit().get();            
    }


    public void saveSingleCourse(Course course) {
        Firestore db = FirestoreClient.getFirestore();

        Map<String, Object> data = new HashMap<>();
        data.put("courseName", course.getCourseName());
        data.put("prerequisiteCourseNumberOrConditions", course.getPrerequisiteCourseNumberOrConditions());
        data.put("lectureHours", course.getLectureHours());
        data.put("tutorialHours", course.getTutorialHours());
        data.put("labHours", course.getLabHours());
        data.put("projectHours", course.getProjectHours());
        data.put("credits", course.getCredits());
        data.put("notes", course.getNotes());
        data.put("clusterName", course.getClusterName());

        db.collection("courses").document(course.getCourseId()).set(Map.of(course.getCourseId(), data), SetOptions.merge());

    }
    

    public void deleteCourses(List<CourseDeleteRequest> courses) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        WriteBatch batch = db.batch();

        for(CourseDeleteRequest course : courses) {
            DocumentReference docRef = db.collection("courses").document(course.getCourseCode());

            Map<String, Object> updates = new HashMap<>();
            updates.put(course.getCourseCode(), FieldValue.delete());
            batch.update(docRef, updates);

        }

        batch.commit().get();
    }

    public List<Course> getAllCourses() throws Exception{
        Firestore db = FirestoreClient.getFirestore();

        List<Course> courses = new ArrayList<>();

        ApiFuture<QuerySnapshot> future = db.collection("courses").get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        for (QueryDocumentSnapshot doc : documents) {

            String courseCode = doc.getId();
            Map<String, Object> data = doc.getData();

            for (String courseKey : data.keySet()) {

                Map<String, Object> courseData =
                        (Map<String, Object>) data.get(courseKey);

                
                String courseName = (String) courseData.get("courseName");
                String prerequisiteCourseNumberOrConditions = (String) courseData.get("prerequisiteCourseNumberOrConditions");
                int lectureHours = ((Number) courseData.get("lectureHours")).intValue();
                int tutorialHours = ((Number) courseData.get("tutorialHours")).intValue();
                int labHours = ((Number) courseData.get("labHours")).intValue();
                int projectHours = ((Number) courseData.get("projectHours")).intValue();
                int credits = ((Number) courseData.get("credits")).intValue();
                String notes = (String) courseData.get("notes");
                String clusterName = (String) courseData.get("clusterName");
                
            
                Course course = new Course();

                course.setCourseId(courseCode);
                course.setCourseName(courseName);
                course.setPrerequisiteCourseNumberOrConditions(prerequisiteCourseNumberOrConditions);
                course.setLectureHours(lectureHours);
                course.setTutorialHours(tutorialHours);
                course.setLabHours(labHours);
                course.setProjectHours(projectHours);
                course.setCredits(credits);
                course.setNotes(notes);
                course.setClusterName(clusterName);

                courses.add(course);
            }

        }

        return courses;
    }

    public void updateCourse(Course oldCourse, Course newCourse) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        WriteBatch batch = db.batch();

        DocumentReference oldDoc = db.collection("courses").document(oldCourse.getCourseId());
        
        Map<String, Object> deleteMap = new HashMap<>();
        deleteMap.put(oldCourse.getCourseId(), FieldValue.delete());

        batch.update(oldDoc, deleteMap);

        DocumentReference newDoc = db.collection("courses").document(newCourse.getCourseId());

        Map<String, Object> data = new HashMap<>();
        data.put("courseName", newCourse.getCourseName());
        data.put("prerequisiteCourseNumberOrConditions", newCourse.getPrerequisiteCourseNumberOrConditions());
        data.put("lectureHours", newCourse.getLectureHours());
        data.put("tutorialHours", newCourse.getTutorialHours());
        data.put("labHours", newCourse.getLabHours());
        data.put("projectHours", newCourse.getProjectHours());
        data.put("credits", newCourse.getCredits());
        data.put("notes", newCourse.getNotes());
        data.put("clusterName", newCourse.getClusterName());

        batch.set(newDoc, Map.of(newCourse.getCourseId(), data), SetOptions.merge());

        batch.commit().get();
    }
    
   
}
   

