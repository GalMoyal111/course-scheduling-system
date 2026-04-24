package com.coursescheduling.server.service;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Row;
import org.springframework.stereotype.Service;

import com.coursescheduling.server.model.ClusterCoursesList;
import com.coursescheduling.server.model.Course;
import com.coursescheduling.server.model.Lesson;
import com.coursescheduling.server.model.LessonType;
import com.coursescheduling.server.model.Semester;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteBatch;
import com.google.firebase.cloud.FirestoreClient;
import java.util.UUID;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

@Service
public class LessonService {

	private final CourseService courseService;
	
	private List<Lesson> cachedLessons = null;
	private long lastFetchTime = 0;
	private static final long CACHE_DURATION = 30 * 60 * 1000;
	
	private List<ClusterCoursesList> cachedGroupedCourses = null;
	private long lastGroupedFetchTime = 0;
	

    public LessonService(CourseService courseService) {
        this.courseService = courseService;
    }
	
    public void deleteAllLessons() {
    	
    	this.cachedLessons = null;
    	
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
		
		this.cachedLessons = null;
		
		
	    Firestore db = FirestoreClient.getFirestore();
	    
	    deleteAllLessons();

	    WriteBatch batch = db.batch();
	    int count = 0;

	    for (Lesson lesson : lessons) {

	        if (lesson.getLessonId() == null) {
	            lesson.setLessonId(UUID.randomUUID().toString());
	        }

	        DocumentReference docRef = db.collection("lessons").document(lesson.getLessonId());
	        batch.set(docRef, convertLessonToMap(lesson));
	        count++;
	        
	        if (count == 500) {
	            try {
	                batch.commit().get();
	                batch = db.batch(); 
	                count = 0;
	            } catch (Exception e) {
	                throw new RuntimeException("Failed to commit batch of 500", e);
	            }
	        }

	    }

	    if (count > 0) {
	        try {
	            batch.commit().get();
	        } catch (Exception e) {
	            throw new RuntimeException("Failed to commit final batch", e);
	        }
	    }
	}
	
	
	
	
	public List<Lesson> getAllLessons() {
		
		if (cachedLessons != null && (System.currentTimeMillis() - lastFetchTime < CACHE_DURATION)) {
	        System.out.println("Returning Lessons from Server Cache (Big Save!)");
	        return cachedLessons;
	    }
		
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

	    this.cachedLessons = lessons;
	    this.lastFetchTime = System.currentTimeMillis();
	    
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
		
		this.cachedLessons = null;
		
		
	    Firestore db = FirestoreClient.getFirestore();

	    Course course = courseService.getCourseById(lesson.getCourseId());

	    if (course == null)
	        throw new RuntimeException("Course not found");

	    String lecturerName = lesson.getLecturer() != null ? lesson.getLecturer().trim() : "";
	    if (lecturerName.isEmpty())
	        throw new RuntimeException("Lecturer name is required");
	    
	    lesson.setLecturer(lecturerName);
	    
	    if (lesson.getType() == LessonType.LAB) {
	        if (lesson.getCourseId().equals("61181")) {
	            lesson.setType(LessonType.PHYSICS_LAB);
	        } else if (lesson.getCourseId().equals("61765")) {
	            lesson.setType(LessonType.NETWORKING_LAB);
	        }
	    }
	    
	    
	    lesson.setCourseName(course.getCourseName());
	    lesson.setCluster(course.getCluster());
	    lesson.setCredits(course.getCredits());

	    if (lesson.getSemester() == null)
	        throw new RuntimeException("Semester is required");

	    List<Lesson> lessonsToSave = new ArrayList<>();

	    if (lesson.getDuration() > 3) {

	    	String splitGroupId = UUID.randomUUID().toString();
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

	        lesson.setSplitGroupId(null);
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
		
		this.cachedLessons = null;
		
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
		
		if (cachedGroupedCourses != null && (System.currentTimeMillis() - lastGroupedFetchTime < CACHE_DURATION)) {
	        System.out.println("Returning Grouped Courses from Server Cache");
	        return cachedGroupedCourses;
	    }
		
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

	        this.cachedGroupedCourses = result;
	        this.lastGroupedFetchTime = System.currentTimeMillis();
	        
	        return result;

	    } catch (Exception e) {
	        e.printStackTrace();
	        throw new RuntimeException("Failed to fetch courses", e);
	    }
	}
	
	
	public byte[] exportLessonsToExcel() {
	    try (Workbook workbook = new XSSFWorkbook()) {

	        Sheet sheet = workbook.createSheet("Lessons");

	        List<Lesson> lessons = getAllLessons();

	        Map<String, List<Lesson>> grouped = new HashMap<>();
	        List<Lesson> singles = new ArrayList<>();

	        for (Lesson lesson : lessons) {
	            if (lesson.getSplitGroupId() == null) {
	                singles.add(lesson);
	            } else {
	                grouped.computeIfAbsent(lesson.getSplitGroupId(), k -> new ArrayList<>())
	                       .add(lesson);
	            }
	        }

	        List<Lesson> finalLessons = new ArrayList<>();

	        finalLessons.addAll(singles);

	        for (List<Lesson> group : grouped.values()) {
	            Lesson base = group.get(0);

	            int totalDuration = group.stream().mapToInt(Lesson::getDuration).sum();

	            Lesson merged = new Lesson();
	            merged.setCourseId(base.getCourseId());
	            merged.setCourseName(base.getCourseName());
	            merged.setLecturer(base.getLecturer());
	            merged.setType(base.getType());
	            merged.setSemester(base.getSemester());
	            merged.setDuration(totalDuration);

	            finalLessons.add(merged);
	        }

	        Row header = sheet.createRow(0);
	        header.createCell(0).setCellValue("מס' קורס");
	        header.createCell(1).setCellValue("שם הקורס");
	        header.createCell(2).setCellValue("סוג");
	        header.createCell(3).setCellValue("מרצה");
	        header.createCell(4).setCellValue("סגל / ממח / עמית");
	        header.createCell(5).setCellValue("סמסטר");
	        header.createCell(6).setCellValue("מחלקה");
	        header.createCell(7).setCellValue("שע'");
	        header.createCell(8).setCellValue("מרצה");
	        header.createCell(9).setCellValue("הערות");
	        header.createCell(10).setCellValue("תאריך עדכון");

	        int rowNum = 1;

	        for (Lesson lesson : finalLessons) {
	            Row row = sheet.createRow(rowNum++);

	            row.createCell(0).setCellValue(lesson.getCourseId());
	            row.createCell(1).setCellValue(lesson.getCourseName());
	            row.createCell(2).setCellValue(formatType(lesson.getType()));
	            row.createCell(3).setCellValue(lesson.getLecturer());
	            row.createCell(4).setCellValue(formatSemester(lesson.getSemester()));
	            
	            row.createCell(4).setCellValue(""); 
	            row.createCell(6).setCellValue(""); 
	            row.createCell(8).setCellValue("");  
	            row.createCell(9).setCellValue(""); 
	            row.createCell(10).setCellValue(""); 

	            row.createCell(5).setCellValue(formatSemester(lesson.getSemester()));
	            row.createCell(7).setCellValue(lesson.getDuration());
	        }

	        for (int i = 0; i < 6; i++) {
	            sheet.autoSizeColumn(i);
	        }

	        ByteArrayOutputStream out = new ByteArrayOutputStream();
	        workbook.write(out);

	        return out.toByteArray();

	    } catch (Exception e) {
	        throw new RuntimeException("Failed to export lessons", e);
	    }
	}
	
	
	private String formatSemester(Semester semester) {
	    switch (semester) {
	        case A:
	            return "סמסטר א";
	        case B:
	            return "סמסטר ב";
	        case SUMMER:
	            return "סמסטר קיץ";
	        default:
	            return "";
	    }
	}
	
	private String formatType(LessonType type) {
	    switch (type) {
	        case LECTURE:
	            return "הרצאה";
	        case TUTORIAL:
	            return "תרגיל";
	        case LAB:    
	            return "מעבדה";
	        case PHYSICS_LAB:  
	            return "מעבדה";
	        case NETWORKING_LAB: 
	            return "מעבדה";
	        case PBL:
	            return "PBL";
	        case PROJECT:
	            return "פרויקט";
	        default:
	            return "";
	    }
	}
	
	
	
	public List<Lesson> getLessonsBySemester(Semester semester) {

	    Firestore db = FirestoreClient.getFirestore();
	    List<Lesson> lessons = new ArrayList<>();

	    try {
	        ApiFuture<QuerySnapshot> future = db.collection("lessons").whereEqualTo("semester", semester.name()).get();

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
	
	
	public void invalidateGroupedCache() {
	    this.cachedGroupedCourses = null;
	    this.lastGroupedFetchTime = 0;
	    System.out.println("LessonService: Grouped courses cache cleared.");
	}
	
	
	
	
	
	
	
		
}
