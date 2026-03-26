package com.coursescheduling.server.service;

import java.util.*;

// import java.util.HashMap;
// import java.util.List;
// import java.util.Map;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.coursescheduling.server.model.Course;
import com.coursescheduling.server.model.CourseDeleteRequest;
import org.springframework.stereotype.Service;


@Service
public class CourseService {

    private static final int SEMESTER_MIN = 1;
    private static final int SEMESTER_MAX = 8;

    private String normalizeClusterName(int cluster, String clusterName) {
        if (clusterName != null && !clusterName.isBlank()) {
            return clusterName.trim();
        }

        if (cluster >= SEMESTER_MIN && cluster <= SEMESTER_MAX) {
            return "סמסטר " + cluster;
        }

        return "";
    }

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
            String normalizedClusterName = normalizeClusterName(course.getCluster(), course.getClusterName());
            data.put("cluster", course.getCluster());
            data.put("courseId", course.getCourseId());
            data.put("courseName", course.getCourseName());
            data.put("prerequisiteCourseNumber", course.getPrerequisiteCourseNumber());
            data.put("lectureHours", course.getLectureHours());
            data.put("tutorialHours", course.getTutorialHours());
            data.put("labHours", course.getLabHours());
            data.put("projectHours", course.getProjectHours());
            data.put("credits", course.getCredits());
            data.put("notes", course.getNotes());
            data.put("clusterName", normalizedClusterName);

            DocumentReference docRef = db.collection("courses").document(course.getCourseId());
            batch.set(docRef, data);

        }

        batch.commit().get();            
    }


    public void saveSingleCourse(Course course) {
        Firestore db = FirestoreClient.getFirestore();

        Map<String, Object> data = new HashMap<>();
        String normalizedClusterName = normalizeClusterName(course.getCluster(), course.getClusterName());
        data.put("cluster", course.getCluster());
        data.put("courseId", course.getCourseId());
        data.put("courseName", course.getCourseName());
        data.put("prerequisiteCourseNumber", course.getPrerequisiteCourseNumber());
        data.put("lectureHours", course.getLectureHours());
        data.put("tutorialHours", course.getTutorialHours());
        data.put("labHours", course.getLabHours());
        data.put("projectHours", course.getProjectHours());
        data.put("credits", course.getCredits());
        data.put("notes", course.getNotes());
        data.put("clusterName", normalizedClusterName);

        db.collection("courses").document(course.getCourseId()).set(data);

    }
    

    public void deleteCourses(List<CourseDeleteRequest> courses) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        WriteBatch batch = db.batch();

        for(CourseDeleteRequest course : courses) {
            DocumentReference docRef = db.collection("courses").document(course.getCourseId());
            batch.delete(docRef);
        }

        batch.commit().get();
    }

    public List<Course> getAllCourses() throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        List<Course> courses = new ArrayList<>();

        ApiFuture<QuerySnapshot> future = db.collection("courses").get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        for (QueryDocumentSnapshot doc : documents) {

            Map<String, Object> courseData = doc.getData();


            int cluster = ((Number) courseData.get("cluster")).intValue();
            String courseName = (String) courseData.get("courseName");
            String prerequisiteCourseNumber = (String) courseData.get("prerequisiteCourseNumber");

            int lectureHours = ((Number) courseData.get("lectureHours")).intValue();
            int tutorialHours = ((Number) courseData.get("tutorialHours")).intValue();
            int labHours = ((Number) courseData.get("labHours")).intValue();
            int projectHours = ((Number) courseData.get("projectHours")).intValue();
            float credits = ((Number) courseData.get("credits")).floatValue();

            String notes = (String) courseData.get("notes");
            String clusterName = (String) courseData.get("clusterName");

            Course course = new Course();

            course.setCourseId(doc.getId());

            course.setCluster(cluster);
            course.setCourseName(courseName);
            course.setPrerequisiteCourseNumber(prerequisiteCourseNumber);
            course.setLectureHours(lectureHours);
            course.setTutorialHours(tutorialHours);
            course.setLabHours(labHours);
            course.setProjectHours(projectHours);
            course.setCredits(credits);
            course.setNotes(notes);
            course.setClusterName(normalizeClusterName(cluster, clusterName));

            courses.add(course);
        }

        return courses;
    }


    public void updateCourse(Course oldCourse, Course newCourse) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        WriteBatch batch = db.batch();

        DocumentReference oldDoc = db.collection("courses").document(oldCourse.getCourseId());
        
        Map<String, Object> deleteMap = new HashMap<>();
        deleteMap.put(oldCourse.getCourseId(), FieldValue.delete());
        deleteMap.put(oldCourse.getCourseId(), FieldValue.delete());

        batch.update(oldDoc, deleteMap);

        DocumentReference newDoc = db.collection("courses").document(newCourse.getCourseId());
        String normalizedClusterName = normalizeClusterName(newCourse.getCluster(), newCourse.getClusterName());

        Map<String, Object> data = new HashMap<>();
        data.put("cluster", newCourse.getCluster());
        data.put("courseId", newCourse.getCourseId());
        data.put("courseName", newCourse.getCourseName());
        data.put("prerequisiteCourseNumber", newCourse.getPrerequisiteCourseNumber());
        data.put("lectureHours", newCourse.getLectureHours());
        data.put("tutorialHours", newCourse.getTutorialHours());
        data.put("labHours", newCourse.getLabHours());
        data.put("projectHours", newCourse.getProjectHours());
        data.put("credits", newCourse.getCredits());
        data.put("notes", newCourse.getNotes());
        data.put("clusterName", normalizedClusterName);

        batch.set(newDoc, data);

        batch.commit().get();
    }
    
    
    
    public Course getCourseById(String courseId) {
        Firestore db = FirestoreClient.getFirestore();

        try {
            DocumentSnapshot doc = db.collection("courses").document(courseId).get().get();
            if (!doc.exists()) 
            	return null;

            return doc.toObject(Course.class);

        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch course", e);
        }
    }
    
   
}
   

