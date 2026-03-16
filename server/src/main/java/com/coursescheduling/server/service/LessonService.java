package com.coursescheduling.server.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.coursescheduling.server.model.Lesson;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.WriteBatch;
import com.google.firebase.cloud.FirestoreClient;

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
}
