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

@Service
public class LessonService {

	private final CourseService courseService;
	private int splitGroupCounter = 1;


    public LessonService(CourseService courseService) {
        this.courseService = courseService;
    }
	
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
	
	private int generateSplitGroupId() {
	    return splitGroupCounter++;
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
	    
	    String semester = lesson.getSemester().name();
	    DocumentReference docRef = db.collection("lessons").document(semester);

	    try {
	        DocumentSnapshot snapshot = docRef.get().get();
	        Map<String, Object> data = snapshot.exists() ? snapshot.getData() : null;

	        List<Lesson> lessons = new ArrayList<>();

	        if (data != null) {
	            for (Map.Entry<String, Object> entry : data.entrySet()) {
	                String key = entry.getKey();

	                if (key.startsWith(lesson.getCourseId() + "_")) {
	                    Lesson l = convertToLesson(entry.getValue());	                    
	                    lessons.add(l);
	                }
	            }
	        }

	        if (lesson.getDuration() > 3) {

	            int splitGroupId = generateSplitGroupId(); 

	            int half = lesson.getDuration() / 2;

	            Lesson l1 = copyLesson(lesson);
	            Lesson l2 = copyLesson(lesson);

	            l1.setDuration(half);
	            l2.setDuration(half);

	            l1.setSplitGroupId(splitGroupId);
	            l2.setSplitGroupId(splitGroupId);

	            lessons.add(l1);
	            lessons.add(l2);

	        } else {
	            lesson.setSplitGroupId(0);
	            lessons.add(lesson);
	        }

	        lessons.sort((l1, l2) ->
	            Integer.compare(l1.getType().getPriority(),l2.getType().getPriority())
	        );

	        int index = 1;
	        for (Lesson l : lessons) {
	            l.setIndex(index++);
	        }
	        
	        WriteBatch batch = db.batch();

	        if (data != null) {
	            for (String key : data.keySet()) {
	                if (key.startsWith(lesson.getCourseId() + "_")) 
	                    batch.update(docRef, key, FieldValue.delete());     
	            }
	        }

	        for (Lesson l : lessons) {
	            String key = l.getCourseId() + "_" + l.getIndex();

	            Map<String, Object> lessonMap = convertLessonToMap(l); 

	            batch.set(docRef,Collections.singletonMap(key, lessonMap),SetOptions.merge()); 
	        }

	        batch.commit().get();

	    } catch (Exception e) {
	        throw new RuntimeException("Failed to add lesson", e);
	    }
	}
	
	
	private Map<String, Object> convertLessonToMap(Lesson lesson) {
	    Map<String, Object> map = new HashMap<>();

	    map.put("courseId", lesson.getCourseId());
	    map.put("courseName", lesson.getCourseName());
	    map.put("cluster", lesson.getCluster());
	    map.put("lecturer", lesson.getLecturer());
	    map.put("credits", lesson.getCredits());
	    map.put("duration", lesson.getDuration());
	    map.put("type", lesson.getType().name());
	    map.put("index", lesson.getIndex());
	    map.put("splitGroupId", lesson.getSplitGroupId());
	    map.put("semester", lesson.getSemester().name());

	    return map;
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
	
	
	private Lesson convertToLesson(Object obj) {
	    ObjectMapper mapper = new ObjectMapper();
	    return mapper.convertValue(obj, Lesson.class);
	}
	
	
	
	
	
	
	
	
}
