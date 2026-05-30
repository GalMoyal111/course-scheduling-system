package com.coursescheduling.server.service;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Row;
import org.springframework.stereotype.Service;

import com.coursescheduling.server.model.ClusterCoursesList;
import com.coursescheduling.server.model.Course;
import com.coursescheduling.server.model.Lesson;
import com.coursescheduling.server.model.LessonType;
import com.coursescheduling.server.model.Semester;
import com.coursescheduling.server.service.ExcelProcessingService.LessonUploadSummary;
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
	private static final long CACHE_DURATION = 60 * 60 * 1000;
	
	private List<ClusterCoursesList> cachedGroupedCourses = null;
	private long lastGroupedFetchTime = 0;
	private LessonUploadSummary cachedSummary = null;

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
        
        this.cachedLessons = null;
        this.lastFetchTime = 0;
    }
	
	
	public void saveLessons(List<Lesson> lessons) {

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
	            
	            this.cachedLessons = null;
	    		this.lastFetchTime = 0;
	    		
	        } catch (Exception e) {
	            throw new RuntimeException("Failed to commit final batch", e);
	        }
	    }
		

	}
	
	
	
	
	public List<Lesson> getAllLessons() {
		
		if (cachedLessons != null && (System.currentTimeMillis() - lastFetchTime < CACHE_DURATION)) {
	        System.out.println("Returning Lessons from Server Cache (Big Save!)");
	        return new ArrayList<>(cachedLessons);
	    }
		
	    Firestore db = FirestoreClient.getFirestore();
	    List<Lesson> lessons = new ArrayList<>();

	    try {
	        ApiFuture<QuerySnapshot> future = db.collection("lessons").get();
	        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

	        for (QueryDocumentSnapshot doc : documents) {
	            Lesson lesson = doc.toObject(Lesson.class);
	            lesson.setLessonId(doc.getId());
	            lessons.add(lesson);
	        }

	    } catch (Exception e) {
	        e.printStackTrace();
	    }

	    this.cachedLessons = new ArrayList<>(lessons);
	    this.lastFetchTime = System.currentTimeMillis();
	    
	    return new ArrayList<>(lessons);
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
	
	public List<Lesson> addLesson(Lesson lesson) {
	
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
	        this.cachedLessons = null;
	        this.lastFetchTime = 0;
	        return lessonsToSave;
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
	    
	    Set<String> idsToDelete = new HashSet<String>();
	    List<Lesson> allSystemLessons = getAllLessons();

	    for (Lesson lesson : lessons) {

	        if (lesson.getLessonId() == null)
	            continue;
	        
	        idsToDelete.add(lesson.getLessonId());
	        
	        if (lesson.getSplitGroupId() != null && !lesson.getSplitGroupId().isEmpty()) {
	            for (Lesson cachedLesson : allSystemLessons) {
	                if (lesson.getSplitGroupId().equals(cachedLesson.getSplitGroupId())) {
	                    idsToDelete.add(cachedLesson.getLessonId());
	                }
	            }
	        }
	    }
	    for (String id : idsToDelete) {
	        DocumentReference docRef = db.collection("lessons").document(id);
	        batch.delete(docRef);
	    }
	    
	    batch.commit().get();
	    
	    this.cachedLessons = null;
	    this.lastFetchTime = 0;
	}
	
	
	
	public List<ClusterCoursesList> getAllCoursesGroupedByCluster() {
		
		if (cachedGroupedCourses != null && (System.currentTimeMillis() - lastGroupedFetchTime < CACHE_DURATION)) {
	        System.out.println("Returning Grouped Courses from Server Cache");
	        return new ArrayList<>(cachedGroupedCourses);
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

	        this.cachedGroupedCourses = new ArrayList<>(result);
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

	        // 1. Group lessons by splitGroupId to merge split lessons back into a single row
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
	            
	            // Crucial: copy cluster and credits so sorting works on merged rows
	            merged.setCluster(base.getCluster());
	            merged.setCredits(base.getCredits());
	            merged.setDuration(totalDuration);

	            finalLessons.add(merged);
	        }

	        // 2. Sort the final list exactly like the frontend (Semester A -> Semester B -> Cluster -> Credits -> ID -> Type)
	        finalLessons.sort((a, b) -> {
	            // a. Semester priority (A before B)
	            int semA = getSemesterPriority(a.getSemester());
	            int semB = getSemesterPriority(b.getSemester());
	            if (semA != semB) return Integer.compare(semA, semB);

	            // b. Cluster (Ascending)
	            int clusterA = a.getCluster();
	            int clusterB = b.getCluster();
	            if (clusterA != clusterB) return Integer.compare(clusterA, clusterB);

	            // c. Credits (Descending order)
	            double credA = a.getCredits();
	            double credB = b.getCredits();
	            if (Double.compare(credB, credA) != 0) return Double.compare(credB, credA);

	            // d. Course ID (Alphanumeric/Numeric)
	            String idA = a.getCourseId() != null ? a.getCourseId() : "";
	            String idB = b.getCourseId() != null ? b.getCourseId() : "";
	            int idCompare = compareIdsNumeric(idA, idB);
	            if (idCompare != 0) return idCompare;

	            // e. Lesson Type Priority
	            int typeA = getTypePriority(a.getType());
	            int typeB = getTypePriority(b.getType());
	            return Integer.compare(typeA, typeB);
	        });

	        // 3. Create Excel headers and rows
	        Row header = sheet.createRow(0);
	        header.createCell(0).setCellValue("מס' קורס");
	        header.createCell(1).setCellValue("שם הקורס");
	        header.createCell(2).setCellValue("סוג");
	        header.createCell(3).setCellValue("מרצה");
	        header.createCell(4).setCellValue("סגל / ממח / עמית");
	        header.createCell(5).setCellValue("סמסטר");
	        header.createCell(6).setCellValue("מחלקה");
	        header.createCell(7).setCellValue("שע'");

	        int rowNum = 1;

	        for (Lesson lesson : finalLessons) {
	            Row row = sheet.createRow(rowNum++);

	            row.createCell(0).setCellValue(lesson.getCourseId());
	            row.createCell(1).setCellValue(lesson.getCourseName());
	            row.createCell(2).setCellValue(formatType(lesson.getType()));
	            row.createCell(3).setCellValue(lesson.getLecturer());	            
	            row.createCell(4).setCellValue(""); 
	            row.createCell(5).setCellValue(formatSemester(lesson.getSemester()));
	            row.createCell(6).setCellValue("");
	            row.createCell(7).setCellValue(lesson.getDuration());           
	        }

	        // Auto-size columns for better readability
	        for (int i = 0; i < 8; i++) {
	            sheet.autoSizeColumn(i);
	        }

	        ByteArrayOutputStream out = new ByteArrayOutputStream();
	        workbook.write(out);

	        return out.toByteArray();

	    } catch (Exception e) {
	        throw new RuntimeException("Failed to export lessons", e);
	    }
	}

	// Sorting Helper Methods
	private int getSemesterPriority(Object semester) {
	    if (semester == null) return 99;
	    String semStr = semester.toString().toUpperCase();
	    if (semStr.equals("A")) return 1;
	    if (semStr.equals("B")) return 2;
	    return 99;
	}

	private int parseCluster(String cluster) {
	    if (cluster == null || cluster.trim().isEmpty()) return 999;
	    try {
	        return Integer.parseInt(cluster.trim());
	    } catch (NumberFormatException e) {
	        return 999;
	    }
	}

	private int compareIdsNumeric(String idA, String idB) {
	    try {
	        double numA = Double.parseDouble(idA);
	        double numB = Double.parseDouble(idB);
	        return Double.compare(numA, numB);
	    } catch (NumberFormatException e) {
	        return idA.compareTo(idB);
	    }
	}

	private int getTypePriority(Object type) {
	    if (type == null) return 99;
	    String t = type.toString().toUpperCase();
	    switch (t) {
	        case "LECTURE": return 1;
	        case "TUTORIAL": return 2;
	        case "LAB": 
	        case "PHYSICS_LAB": 
	        case "NETWORKING_LAB": return 3;
	        case "PBL": return 4;
	        case "PROJECT": return 5;
	        default: return 99;
	    }
	}
	
	
	
	
	
	private String formatSemester(Semester semester) {
	    switch (semester) {
	        case A:
	            return "סמסטר א";
	        case B:
	            return "סמסטר ב";
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
	            lesson.setLessonId(doc.getId());
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
	
	
	
	public void saveSummary(LessonUploadSummary summary) {
		this.cachedSummary = summary;
		
		Firestore db = FirestoreClient.getFirestore();
	    ObjectMapper mapper = new ObjectMapper();
	    
	    Map<String, Object> summaryMap = mapper.convertValue(summary, Map.class);
	    db.collection("system_data").document("lastLessonUploadSummary").set(summaryMap);
	}
	
	
	public LessonUploadSummary getLatestSummary() {
	    if (this.cachedSummary != null) {
	        return this.cachedSummary;
	    }
	    
	    Firestore db = FirestoreClient.getFirestore();
	    try {
	        var doc = db.collection("system_data").document("lastLessonUploadSummary").get().get();
	        if (doc.exists()) {
	            ObjectMapper mapper = new ObjectMapper();
	            this.cachedSummary = mapper.convertValue(doc.getData(), LessonUploadSummary.class);
	            return this.cachedSummary;
	        }
	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	    
	    return null; 
	}
	
	
	
		
}
