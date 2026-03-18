package com.coursescheduling.server.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.coursescheduling.server.model.ClusterCoursesList;
import com.coursescheduling.server.model.Course;
import com.coursescheduling.server.model.Lesson;
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

@Service
public class LessonService {

	
	
	public void deleteAllLessons() {
		Firestore db = FirestoreClient.getFirestore();
		String[] semesters = {"A", "B", "SUMMER"};
		
		for (String semester : semesters) {
	        db.collection("lessons").document(semester).delete();
	    }
	}
	
	
	public void saveLessons(List<Lesson> lessons){
		deleteAllLessons();
		
		Map<String, Map<String, Lesson>> lessonsBySemester = new HashMap<>();
		
		for (Lesson l : lessons) {
			String semester = l.getSemester().name();
			String key = l.getCourseId() + "_" + l.getIndex();
			
			if (!lessonsBySemester.containsKey(semester)) {
				Map<String, Lesson> upload = new HashMap<>();
				lessonsBySemester.put(semester, upload);
			}
			lessonsBySemester.get(semester).put(key, l);							
		}
		Firestore db = FirestoreClient.getFirestore();
	    WriteBatch batch = db.batch();
	    
	    for (String s : lessonsBySemester.keySet()) {
	        Map<String, Lesson> semesterLessons = lessonsBySemester.get(s);
	        DocumentReference docRef = db.collection("lessons").document(s);
	        batch.set(docRef, semesterLessons);	      
	    }
	    batch.commit();
		
	}
	
	
	public List<Lesson> getAllLessons() {

		Firestore db = FirestoreClient.getFirestore();
	    List<Lesson> lessons = new ArrayList<>();
	    String[] semesters = {"A", "B", "SUMMER"};

	    try {
	        for (String semester : semesters) {

	            DocumentSnapshot doc = db.collection("lessons").document(semester).get().get();

	            if (!doc.exists())
	                continue;

	            Map<String, Object> data = doc.getData();
	            if (data == null)
	                continue;

	            for (Object value : data.values()) {
	                Lesson lesson = ((CustomClassMapper.convertToCustomClass(value, Lesson.class)));
	                lessons.add(lesson);
	            }
	        }
	    } catch (Exception e) {
	        e.printStackTrace();
	    }

	    return lessons;
	}
	
	
	public void addLesson(Lesson lesson){
	    Firestore db = FirestoreClient.getFirestore();

	    String semester = lesson.getSemester().name();
	    String key = lesson.getCourseId() + "_" + lesson.getIndex();

	    DocumentReference docRef = db.collection("lessons").document(semester);

	    Map<String, Lesson> update = new HashMap<>();
	    update.put(key, lesson);

	    docRef.set(update, SetOptions.merge());
	}
	
	
	public void deleteLessons(List<Lesson> lessons) throws Exception {
	    Firestore db = FirestoreClient.getFirestore();

	    Map<String, List<Lesson>> lessonsBySemester = new HashMap<>();

	    for (Lesson lesson : lessons) {
	        String semester = lesson.getSemester().name();

	        if (!lessonsBySemester.containsKey(semester)) 
	            lessonsBySemester.put(semester, new ArrayList<>());
	        
	        lessonsBySemester.get(semester).add(lesson);
	    }

	    for (String semester : lessonsBySemester.keySet()) {
	        DocumentReference docRef = db.collection("lessons").document(semester);

	        Map<String, Object> updates = new HashMap<>();

	        for (Lesson lesson : lessonsBySemester.get(semester)) {
	            String key = lesson.getCourseId() + "_" + lesson.getIndex();
	            updates.put(key, FieldValue.delete());
	        }

	        docRef.update(updates);
	    }
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
	
	
	
	
	
	
	
}
