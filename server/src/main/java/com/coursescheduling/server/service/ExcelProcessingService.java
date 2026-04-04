package com.coursescheduling.server.service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.google.cloud.firestore.Firestore;
import com.coursescheduling.server.model.Course;
import com.coursescheduling.server.model.Lesson;
import com.coursescheduling.server.model.LessonType;
import com.coursescheduling.server.model.Semester;


@Service 
/**
 * Service responsible for reading an uploaded Excel file and converting rows
 * into Lesson objects. Provides small helpers to parse and normalize values.
 */
public class ExcelProcessingService {
	private final Firestore firestore;
	
	private final LessonService lessonService;
	private final CourseService courseService;
		
	public ExcelProcessingService(Firestore firestore, LessonService lessonService, CourseService courseService) {
	    this.firestore = firestore;
	    this.lessonService = lessonService;
	    this.courseService = courseService;
	}
	
	
	
	public void process(MultipartFile file) {
		
	    List<Lesson> lessons = new ArrayList<>();
	    
	    Map<String, Course> courseMap = new HashMap<>();

	    try {
	        List<Course> courses = courseService.getAllCourses();

	        for (Course c : courses) {
	            courseMap.put(c.getCourseId(), c);
	        }

	    } catch (Exception e) {
	        throw new RuntimeException("Failed to load courses", e);
	    }
	    
	    
	    try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
	        Sheet sheet = workbook.getSheetAt(0);
	        
	        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
	            Row row = sheet.getRow(i);

	            if (row == null)
	                continue;

	            addLessonFromRow(row, lessons, courseMap);
	        }
	        lessonService.saveLessons(lessons);
	        

	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	  
	}
	
	// Parse the lesson type text (in Hebrew/English) to the LessonType enum.
	private LessonType parseType(String typeText) {
	    if (typeText.contains("הרצאה")) 
	        return LessonType.LECTURE;
	    if (typeText.contains("תרגיל")) 
	        return LessonType.TUTORIAL;
	    if (typeText.contains("מעבדה")) 
	        return LessonType.LAB;
	    if (typeText.contains("PBL")) 
	        return LessonType.PBL;
	    if (typeText.contains("הנחיה")) 
	        return LessonType.PROJECT;
	    
	    return null;
	}
	
	
	// Parse the semester text into the Semester enum.
	private Semester parseSemester(String semesterText) {
	    if (semesterText.contains("א")) 
	        return Semester.A;
	    if (semesterText.contains("ב")) 
	        return Semester.B;
	    if (semesterText.contains("קיץ")) 
	        return Semester.SUMMER;
	    throw new IllegalArgumentException("Unknown semester: " + semesterText);
	}
	
	
	// Convert a single sheet row into one or more Lesson objects.
	private void addLessonFromRow(Row row, List<Lesson> lessons, Map<String, Course> courseMap) {

		if (row.getCell(0) == null)
		    return;

		if (row.getCell(0).getCellType() != org.apache.poi.ss.usermodel.CellType.NUMERIC)
		    return;

		String courseId = String.valueOf((int) row.getCell(0).getNumericCellValue());
		
		if (courseId.contains("/")) {
		    System.out.println("Skipping row: invalid courseId " + courseId);
		    return;
		}
		

		if (courseId == null || courseId.trim().isEmpty()) {
		    System.out.println("Skipping row: missing courseId");
		    return;
		}
		
	    String courseName = row.getCell(1).toString();
	    String typeText = row.getCell(2).toString();
	    LessonType type = parseType(typeText);
	     
	    if (type == LessonType.LAB) {
	        if (courseId.equals("61181")) {
	            type = LessonType.PHYSICS_LAB;
	        } else if (courseId.equals("61765")) {
	            type = LessonType.NETWORKING_LAB;
	        }
	    }
	    
	    if (type == null) {
	        System.out.println("Skipping row: unknown type " + typeText);
	        return;
	    }
	    
	    if (type != LessonType.LECTURE && type != LessonType.TUTORIAL && type != LessonType.LAB && type != LessonType.PHYSICS_LAB && type != LessonType.NETWORKING_LAB && type != LessonType.PBL && type != LessonType.PROJECT) {
	        System.out.println("Skipping row: unsupported type " + typeText);
	        return;
	    }
	    
	    
	    
	    String lecturer = row.getCell(3).toString();

	    String semesterText = row.getCell(5).toString();
	    Semester semester = parseSemester(semesterText);

	    int duration = (int) row.getCell(7).getNumericCellValue();
	    
	    if (lecturer == null || lecturer.trim().isEmpty()) {
	        System.out.println("Skipping row: missing lecturer for course " + courseId);
	        return;
	    }

	    if (duration <= 0) {
	        System.out.println("Skipping row: invalid duration for course " + courseId);
	        return;
	    }

	    if (duration == 4) {
	    	
	    	String splitGroupId = UUID.randomUUID().toString();
	        Lesson lesson1 = createLesson(courseId, courseName, type, lecturer, semester, 2, splitGroupId, courseMap);
	        Lesson lesson2 = createLesson(courseId, courseName, type, lecturer, semester, 2, splitGroupId , courseMap);

	        if (lesson1 != null) lessons.add(lesson1);
	        if (lesson2 != null) lessons.add(lesson2);

	    } else {

	        Lesson lesson = createLesson(courseId, courseName, type, lecturer, semester, duration, null , courseMap);
	        if (lesson != null) {
	            lessons.add(lesson);
	        }
	    }
	}
	
	// Helper method to create a Lesson object with the given properties.
	private Lesson createLesson(String courseId, String courseName, LessonType type, String lecturer, Semester semester, int duration, String splitGroupId, Map<String, Course> courseMap) {
		// Create and populate the Lesson object
		Lesson lesson = new Lesson();
		
		lesson.setLessonId(UUID.randomUUID().toString());
		lesson.setCourseId(courseId);
		lesson.setCourseName(courseName);
		lesson.setType(type);
		lesson.setLecturer(lecturer);
		lesson.setSemester(semester);
		lesson.setDuration(duration);
		
		Course course = courseMap.get(courseId);

		if (course == null) {
		    System.out.println("Skipping row: course not found in DB for courseId " + courseId);
		    return null;
		}

		lesson.setCluster(course.getCluster());
		lesson.setCredits(course.getCredits());
		
		lesson.setSplitGroupId(splitGroupId);
		
		return lesson;
		}
	
	// Sort lessons by courseId, semester and type priority.
	private void sortLessons(List<Lesson> lessons) {
	    lessons.sort((l1, l2) -> {

	        int courseCompare = l1.getCourseId().compareTo(l2.getCourseId());
	        if (courseCompare != 0)
	            return courseCompare;

	        int semesterCompare = l1.getSemester().compareTo(l2.getSemester());
	        if (semesterCompare != 0)
	            return semesterCompare;

	        return Integer.compare(l1.getType().getPriority(), l2.getType().getPriority());
	    });
	}
	

	
	
	
	
	
}