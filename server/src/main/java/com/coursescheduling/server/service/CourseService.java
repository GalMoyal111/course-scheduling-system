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
            data.put("semesterNumber", course.getSemesterNumber());
            data.put("courseId", course.getCourseId());
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
        data.put("semesterNumber", course.getSemesterNumber());
        data.put("courseId", course.getCourseId());
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
            // DocumentReference docRef = db.collection("courses").document(course.getCourseCode());]
            DocumentReference docRef = db.collection("courses").document(course.getCourseId());

            Map<String, Object> updates = new HashMap<>();
            updates.put(course.getCourseId(), FieldValue.delete());
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

            String docId = doc.getId();
            Map<String, Object> data = doc.getData();

            // Handle flat schema where course fields are stored directly on the document.
            if (isFlatCourseRecord(data)) {
                courses.add(buildCourseFromMap(data, docId, docId));
                continue;
            }

            for (String courseKey : data.keySet()) {

                Map<String, Object> courseData =
                        (Map<String, Object>) data.get(courseKey);
                if (!(courseData instanceof Map)) {
                    continue;
                }

                courses.add(buildCourseFromMap(courseData, docId, courseKey));
            }

        }

        return courses;
    }

    private boolean isFlatCourseRecord(Map<String, Object> data) {
        if (data == null) {
            return false;
        }

        return data.containsKey("courseName") || data.containsKey("courseId") || data.containsKey("semesterNumber");
    }

    private Course buildCourseFromMap(Map<String, Object> courseData, String docId, String courseKey) {
        String semesterNumber = getString(courseData.get("semesterNumber"));
        if (semesterNumber.isEmpty()) {
            // Legacy fallback: in older uploads semester was stored as clusterId.
            semesterNumber = getString(courseData.get("clusterId"));
        }
        if (semesterNumber.isEmpty() && !docId.equals(courseKey)) {
            // Legacy schema fallback: document ID represented the semester.
            semesterNumber = docId;
        }

        String courseId = getString(courseData.get("courseId"));
        if (courseId.isEmpty()) {
            courseId = courseKey;
        }
        if (courseId.isEmpty()) {
            courseId = docId;
        }

        Course course = new Course();
        course.setSemesterNumber(semesterNumber);
        course.setCourseId(courseId);
        course.setCourseName(getString(courseData.get("courseName")));
        course.setPrerequisiteCourseNumberOrConditions(getString(courseData.get("prerequisiteCourseNumberOrConditions")));
        course.setLectureHours(getInt(courseData.get("lectureHours")));
        course.setTutorialHours(getInt(courseData.get("tutorialHours")));
        course.setLabHours(getInt(courseData.get("labHours")));
        course.setProjectHours(getInt(courseData.get("projectHours")));
        course.setCredits(getInt(courseData.get("credits")));
        course.setNotes(getString(courseData.get("notes")));
        course.setClusterName(getString(courseData.get("clusterName")));

        return course;
    }

    private String getString(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private int getInt(Object value) {
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }

        if (value == null) {
            return 0;
        }

        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (NumberFormatException e) {
            return 0;
        }
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

        Map<String, Object> data = new HashMap<>();
        data.put("semesterNumber", newCourse.getSemesterNumber());
        data.put("courseId", newCourse.getCourseId());
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
        batch.set(newDoc, Map.of(newCourse.getCourseId(), data), SetOptions.merge());

        batch.commit().get();
    }
    
   
}
   

