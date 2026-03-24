package com.coursescheduling.server.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.coursescheduling.server.model.ClusterCoursesList;
import com.coursescheduling.server.model.Course;
import com.coursescheduling.server.model.Lesson;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.SetOptions;
import com.google.cloud.firestore.WriteBatch;
import com.google.cloud.firestore.WriteResult;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.database.utilities.encoding.CustomClassMapper;
import java.util.UUID;


@Service
public class LessonService {

	private final CourseService courseService;
	private int splitGroupCounter = 1;


    public LessonService(CourseService courseService) {
        this.courseService = courseService;
    }
	
    public void deleteAllLessons() {
        Firestore db = FirestoreClient.getFirestore();

        try {
            ApiFuture<QuerySnapshot> future = db.collection("lessons").get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();

            WriteBatch batch = db.batch();

            for (QueryDocumentSnapshot doc : documents) {
                batch.delete(doc.getReference());
            }

            batch.commit().get();

        } catch (Exception e) {
            throw new RuntimeException("Failed to delete all lessons", e);
        }
    }
	
	
	public void saveLessons(List<Lesson> lessons) {
	    Firestore db = FirestoreClient.getFirestore();
	    
	    deleteAllLessons();

	    WriteBatch batch = db.batch();

	    for (Lesson lesson : lessons) {

	        if (lesson.getLessonId() == null) {
	            lesson.setLessonId(UUID.randomUUID().toString());
	        }

	        DocumentReference docRef = db.collection("lessons").document(lesson.getLessonId());

	        Map<String, Object> lessonMap = convertLessonToMap(lesson);

	        batch.set(docRef, lessonMap);
	    }

	    batch.commit();
	}
	
	private int generateSplitGroupId() {
	    return splitGroupCounter++;
	}
	
	
	
	
	
	public List<Lesson> getAllLessons() {
	    Firestore db = FirestoreClient.getFirestore();
	    List<Lesson> lessons = new ArrayList<>();

	    try {
	        ApiFuture<QuerySnapshot> future = db.collection("lessons").get();
	        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

	        for (QueryDocumentSnapshot doc : documents) {
	            Lesson lesson = doc.toObject(Lesson.class);
	            lessons.add(lesson);
	        }

	    } catch (Exception e) {
	        e.printStackTrace();
	    }

	    return lessons;
	}
	
	
	private Lesson copyLesson(Lesson original) {
	    Lesson l = new Lesson();

	    l.setCourseId(original.getCourseId());
	    l.setCourseName(original.getCourseName());
	    l.setLecturer(original.getLecturer());
	    l.setCluster(original.getCluster());
	    l.setType(original.getType());
	    l.setSemester(original.getSemester());
	    l.setCredits(original.getCredits());

	    return l;
	}
	
	public void addLesson(Lesson lesson) {
	    Firestore db = FirestoreClient.getFirestore();

	    Course course = courseService.getCourseById(lesson.getCourseId());

	    if (course == null)
	        throw new RuntimeException("Course not found");

	    lesson.setCourseName(course.getCourseName());
	    lesson.setCluster(course.getCluster());
	    lesson.setCredits(course.getCredits());

	    if (lesson.getSemester() == null)
	        throw new RuntimeException("Semester is required");

	    List<Lesson> lessonsToSave = new ArrayList<>();

	    if (lesson.getDuration() > 3) {

	        int splitGroupId = generateSplitGroupId();
	        int half = lesson.getDuration() / 2;

	        Lesson l1 = copyLesson(lesson);
	        Lesson l2 = copyLesson(lesson);

	        l1.setDuration(half);
	        l2.setDuration(half);

	        l1.setSplitGroupId(splitGroupId);
	        l2.setSplitGroupId(splitGroupId);

	        l1.setLessonId(UUID.randomUUID().toString());
	        l2.setLessonId(UUID.randomUUID().toString());

	        lessonsToSave.add(l1);
	        lessonsToSave.add(l2);

	    } else {

	        lesson.setSplitGroupId(0);
	        lesson.setLessonId(UUID.randomUUID().toString());

	        lessonsToSave.add(lesson);
	    }

	    WriteBatch batch = db.batch();

	    for (Lesson l : lessonsToSave) {
	        DocumentReference docRef = db.collection("lessons").document(l.getLessonId());
	        Map<String, Object> lessonMap = convertLessonToMap(l);
	        batch.set(docRef, lessonMap);
	    }

	    try {
	        batch.commit().get();
	    } catch (Exception e) {
	        throw new RuntimeException("Failed to add lesson", e);
	    }
	}
	
	
	private Map<String, Object> convertLessonToMap(Lesson lesson) {
	    Map<String, Object> map = new HashMap<>();

	    map.put("lessonId", lesson.getLessonId());
	    map.put("courseId", lesson.getCourseId());
	    map.put("courseName", lesson.getCourseName());
	    map.put("cluster", lesson.getCluster());
	    map.put("lecturer", lesson.getLecturer());
	    map.put("credits", lesson.getCredits());
	    map.put("duration", lesson.getDuration());
	    map.put("type", lesson.getType().name());
	    map.put("splitGroupId", lesson.getSplitGroupId());
	    map.put("semester", lesson.getSemester().name());
	    

	    return map;
	}
	
	
	public void deleteLessons(List<Lesson> lessons) throws Exception {
	    Firestore db = FirestoreClient.getFirestore();
	    WriteBatch batch = db.batch();

	    for (Lesson lesson : lessons) {

	        if (lesson.getLessonId() == null)
	            continue;

	        DocumentReference docRef = db.collection("lessons").document(lesson.getLessonId());

	        batch.delete(docRef);
	    }
	    batch.commit().get();
	}
	
	
	
	public List<ClusterCoursesList> getAllCoursesGroupedByCluster() {
	    Firestore db = FirestoreClient.getFirestore();

	    try {
	        ApiFuture<QuerySnapshot> future = db.collection("courses").get();
	        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

	        List<Course> allCourses = new ArrayList<>();

	        for (QueryDocumentSnapshot doc : documents) {
	        	
	        	
	            Course course = doc.toObject(Course.class);

	            course.setCourseId(doc.getId());

	            allCourses.add(course);
	        }

	        Map<String, List<Course>> grouped = allCourses.stream().collect(Collectors.groupingBy(Course::getClusterName));

	        List<ClusterCoursesList> result = new ArrayList<>();

	        for (Map.Entry<String, List<Course>> entry : grouped.entrySet()) {
	            result.add(new ClusterCoursesList(entry.getKey(), entry.getValue()));
	        }

	        return result;

	    } catch (Exception e) {
	        e.printStackTrace();
	        throw new RuntimeException("Failed to fetch courses", e);
	    }
	}
	
	
	private Lesson convertToLesson(Object obj) {
	    ObjectMapper mapper = new ObjectMapper();
	    return mapper.convertValue(obj, Lesson.class);
	}
	
	
	
	
	
	
	
	
}
