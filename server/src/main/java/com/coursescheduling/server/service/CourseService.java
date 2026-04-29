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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;


@Service
public class CourseService {

    private static final int SEMESTER_MIN = 1;
    private static final int SEMESTER_MAX = 8;
    private static final String COURSE_ID_PATTERN = "^\\d{5,6}$";
    
    private List<Course> cachedCourses = null;
    private long lastFetchTime = 0;
    private static final long CACHE_DURATION = 30 * 60 * 1000;
    

    @Autowired
    @Lazy   
    private LessonService lessonService;
    
    

    private String normalizeAndValidateCourseId(String rawCourseId) {
        String normalized = rawCourseId == null ? "" : rawCourseId.trim();
        if (!normalized.matches(COURSE_ID_PATTERN)) {
            throw new IllegalArgumentException("Course code must contain exactly 5 or 6 digits.");
        }
        return normalized;
    }

    private String normalizeClusterName(int cluster, String clusterName) {
        if (clusterName != null && !clusterName.isBlank()) {
            return clusterName.trim();
        }

        if (cluster >= SEMESTER_MIN && cluster <= SEMESTER_MAX) {
            return "סמסטר " + cluster;
        }

        return "";
    }


    
    public void saveCourseToFirebase(List<Course> courses) throws Exception {
    	
    	this.cachedCourses = null;
    	
    	if (lessonService != null) 
    	    lessonService.invalidateGroupedCache();
    	
    	
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
            data.put("clusterName", normalizedClusterName);

            DocumentReference docRef = db.collection("courses").document(course.getCourseId());
            batch.set(docRef, data);

        }

        batch.commit().get();            
    }


    public void saveSingleCourse(Course course) {
    	
    	this.cachedCourses = null;
    	if (lessonService != null) 
    	    lessonService.invalidateGroupedCache();
    	
        Firestore db = FirestoreClient.getFirestore();
        String normalizedCourseId = normalizeAndValidateCourseId(course.getCourseId());

        Map<String, Object> data = new HashMap<>();
        String normalizedClusterName = normalizeClusterName(course.getCluster(), course.getClusterName());
        data.put("cluster", course.getCluster());
        data.put("courseId", normalizedCourseId);
        data.put("courseName", course.getCourseName());
        data.put("prerequisiteCourseNumber", course.getPrerequisiteCourseNumber());
        data.put("lectureHours", course.getLectureHours());
        data.put("tutorialHours", course.getTutorialHours());
        data.put("labHours", course.getLabHours());
        data.put("projectHours", course.getProjectHours());
        data.put("credits", course.getCredits());
        data.put("clusterName", normalizedClusterName);

        db.collection("courses").document(normalizedCourseId).set(data);

    }
    

    public void deleteCourses(List<CourseDeleteRequest> courses) throws Exception {
    	
    	this.cachedCourses = null;
    	if (lessonService != null) 
    	    lessonService.invalidateGroupedCache();
    	
        Firestore db = FirestoreClient.getFirestore();
        WriteBatch batch = db.batch();

        for(CourseDeleteRequest course : courses) {
            DocumentReference docRef = db.collection("courses").document(course.getCourseId());
            batch.delete(docRef);
        }

        batch.commit().get();
    }

    public List<Course> getAllCourses() throws Exception {
    	
    	if (cachedCourses != null && (System.currentTimeMillis() - lastFetchTime < CACHE_DURATION)) {
            System.out.println("Returning Courses from Server Cache (0 Firebase Reads)");
            return cachedCourses;
        }
    	
    	
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
            course.setClusterName(normalizeClusterName(cluster, clusterName));

            courses.add(course);
        }
        
        this.cachedCourses = courses;
        this.lastFetchTime = System.currentTimeMillis();

        return courses;
    }


    public void updateCourse(Course oldCourse, Course newCourse) throws Exception {
    	
    	this.cachedCourses = null;
    	if (lessonService != null) 
    	    lessonService.invalidateGroupedCache();
    	
        Firestore db = FirestoreClient.getFirestore();
        WriteBatch batch = db.batch();

        String oldCourseId = oldCourse != null && oldCourse.getCourseId() != null
            ? oldCourse.getCourseId().trim()
            : "";
        String newCourseId = newCourse != null && newCourse.getCourseId() != null
            ? newCourse.getCourseId().trim()
            : "";

        if (oldCourseId.isEmpty() || newCourseId.isEmpty()) {
            throw new IllegalArgumentException("Both old and new courseId are required for update.");
        }

        newCourseId = normalizeAndValidateCourseId(newCourseId);

        DocumentReference oldDoc = db.collection("courses").document(oldCourseId);
        batch.delete(oldDoc);

        DocumentReference newDoc = db.collection("courses").document(newCourseId);
        String normalizedClusterName = normalizeClusterName(newCourse.getCluster(), newCourse.getClusterName());

        Map<String, Object> data = new HashMap<>();
        data.put("cluster", newCourse.getCluster());
        data.put("courseId", newCourseId);
        data.put("courseName", newCourse.getCourseName());
        data.put("prerequisiteCourseNumber", newCourse.getPrerequisiteCourseNumber());
        data.put("lectureHours", newCourse.getLectureHours());
        data.put("tutorialHours", newCourse.getTutorialHours());
        data.put("labHours", newCourse.getLabHours());
        data.put("projectHours", newCourse.getProjectHours());
        data.put("credits", newCourse.getCredits());
        data.put("clusterName", normalizedClusterName);

        batch.set(newDoc, data);

        batch.commit().get();
    }
    
    
    
    public Course getCourseById(String courseId) {
    	
    	if (cachedCourses != null && (System.currentTimeMillis() - lastFetchTime < CACHE_DURATION)) {
            for (Course course : cachedCourses) {
                if (course.getCourseId().equals(courseId)) {
                    return course; 
                }
            }
        }
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
   

