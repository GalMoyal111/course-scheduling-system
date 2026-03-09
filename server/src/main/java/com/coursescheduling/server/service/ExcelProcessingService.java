package com.coursescheduling.server.service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
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
	
	private int splitGroupCounter = 1;
	
	public ExcelProcessingService(Firestore firestore) { 
		this.firestore = firestore; 
	}
	
	/*
	 
	 
	public void process(MultipartFile file) { 		
		List<Lesson> lessons = new ArrayList<>();
	    Map<String, Integer> courseIndexMap = new HashMap<>();
		try {
			
		    Workbook workbook = new XSSFWorkbook(file.getInputStream());
		    Sheet sheet = workbook.getSheetAt(0);
		     
		    
		    for (int i = 1; i <= sheet.getLastRowNum(); i++) {

		        Row row = sheet.getRow(i);

		        if (row == null) 
		            continue;

		        if (row.getCell(0) == null) 
		            continue;

		        String courseId = row.getCell(0).toString().trim();
		        if (courseId.isEmpty()) 
		            continue;
		       

		        String courseName = row.getCell(1).toString();
		        String typeText = row.getCell(2).toString();
		        LessonType type = parseType(typeText);
		        String lecturer = row.getCell(3).toString();

		        String semesterText = row.getCell(5).toString();
		        Semester semester = parseSemester(semesterText);


		        int duration = (int) row.getCell(7).getNumericCellValue();
		        if (duration > 3) {
		        	
		        }

		        Lesson lesson = new Lesson();

		        
		        lesson.setCourseId(courseId);	     
		        lesson.setCourseName(courseName);
		        lesson.setType(type);
		        lesson.setLecturer(lecturer);
		        lesson.setSemester(semester);
		        lesson.setDuration(duration);

		        lesson.setGroupId(0);
		        lesson.setCredits(0);
		        lesson.setSplitGroupId(0);

		        lessons.add(lesson);
		    }
		    
		    
		    for (int i = 1; i <= sheet.getLastRowNum(); i++) {

		        Row row = sheet.getRow(i);

		        if (row == null || row.getCell(0) == null)
		            continue;

		        addLessonFromRow(row, lessons);
		    }
		    
		    
		    lessons.sort((l1, l2) -> {
		    	int courseCompare = l1.getCourseId().compareTo(l2.getCourseId());
		        if (courseCompare != 0)
		            return courseCompare;

		        int semesterCompare = l1.getSemester().compareTo(l2.getSemester());
		        if (semesterCompare != 0)
		            return semesterCompare;

		        int typeCompare = Integer.compare(
		            getTypePriority(l1.getType()),
		            getTypePriority(l2.getType())
		        );

		        return typeCompare;
		    });
		    
		    
		    for (Lesson lesson : lessons) {
		        String key = lesson.getCourseId() + "-" + lesson.getSemester();
		        int index = courseIndexMap.getOrDefault(key, 0) + 1;
		        lesson.setIndex(index);
		        courseIndexMap.put(key, index);
		    }
		    
		    for (Lesson lesson : lessons) {
		    	System.out.println(
		    		    lesson.getCourseId() + " " +
		    		    lesson.getSemester() + " " +
		    		    lesson.getType() + " " +
		    		    lesson.getLecturer() + " index=" +
		    		    lesson.getIndex()
		    		);
		    }
		    System.out.println("Total lessons loaded: " + lessons.size());
		    

		} catch (Exception e) {
		    e.printStackTrace();
		}
		
		
		//process();
	}
	*/

	
	public void process(MultipartFile file) {

	    List<Lesson> lessons = new ArrayList<>();

	    try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
	        Sheet sheet = workbook.getSheetAt(0);
	        
	        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
	            Row row = sheet.getRow(i);

	            if (row == null)
	                continue;

	            addLessonFromRow(row, lessons);
	        }
	        sortLessons(lessons);
	        assignIndexes(lessons);
	        printLessons(lessons);

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
	    
	    throw new IllegalArgumentException("Unknown lesson type: " + typeText);
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
	
	// Return an ordering priority for types so sorting groups similar items.
	private int getTypePriority(LessonType type) {
	    switch (type) {
	        case LECTURE:
	            return 1;
	        case TUTORIAL:
	            return 2;
	        case LAB:
	            return 3;
	        case PBL:
	            return 4;
	        case PROJECT:
	            return 5;
	        default:
	            return 100;
	    }
	}
	
	// Convert a single sheet row into one or more Lesson objects.
	private void addLessonFromRow(Row row, List<Lesson> lessons) {

		if (row.getCell(0) == null)
		    return;

		if (row.getCell(0).getCellType() != org.apache.poi.ss.usermodel.CellType.NUMERIC)
		    return;

		String courseId = String.valueOf((int) row.getCell(0).getNumericCellValue());

	    String courseName = row.getCell(1).toString();
	    String typeText = row.getCell(2).toString();
	    LessonType type = parseType(typeText);
	    String lecturer = row.getCell(3).toString();

	    String semesterText = row.getCell(5).toString();
	    Semester semester = parseSemester(semesterText);

	    int duration = (int) row.getCell(7).getNumericCellValue();

	    if (duration == 4) {
	    	
	    	int splitGroupId = splitGroupCounter++;
	        Lesson lesson1 = createLesson(courseId, courseName, type, lecturer, semester, 2, splitGroupId);
	        Lesson lesson2 = createLesson(courseId, courseName, type, lecturer, semester, 2, splitGroupId);

	        lessons.add(lesson1);
	        lessons.add(lesson2);

	    } else {

	        Lesson lesson = createLesson(courseId, courseName, type, lecturer, semester, duration, 0);
	        lessons.add(lesson);
	    }
	}
	
	// Helper method to create a Lesson object with the given properties.
	private Lesson createLesson(String courseId, String courseName, LessonType type, String lecturer, Semester semester, int duration, int splitGroupId) {
		// Create and populate the Lesson object
		Lesson lesson = new Lesson();
		
		lesson.setCourseId(courseId);
		lesson.setCourseName(courseName);
		lesson.setType(type);
		lesson.setLecturer(lecturer);
		lesson.setSemester(semester);
		lesson.setDuration(duration);
		
		lesson.setGroupId(0);
		lesson.setCredits(0);
		
		if(splitGroupId != 0)
			lesson.setSplitGroupId(splitGroupId);
		
		else
			lesson.setSplitGroupId(0);
		
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

	        return Integer.compare(
	            getTypePriority(l1.getType()),
	            getTypePriority(l2.getType())
	        );
	    });
	}
	
	
	// Assign a sequential index per course+semester group.
	private void assignIndexes(List<Lesson> lessons) {

	    Map<String, Integer> courseIndexMap = new HashMap<>();

	    for (Lesson lesson : lessons) {
	        String key = lesson.getCourseId() + "-" + lesson.getSemester();
	        int index = courseIndexMap.getOrDefault(key, 0) + 1;
	        lesson.setIndex(index);
	        courseIndexMap.put(key, index);
	    }
	}
	
	
	// Debug: print brief info for each lesson to stdout.
	private void printLessons(List<Lesson> lessons) {
	    for (Lesson lesson : lessons) {
	        System.out.println(
	            lesson.getCourseId() + " " +
	            lesson.getSemester() + " " +
	            lesson.getType() + " " +
	            lesson.getLecturer() + " index=" +
	            lesson.getIndex()+ " " +
	            lesson.getDuration()+ " " +
	            lesson.getSplitGroupId()
	        );
	    }

	    System.out.println("Total lessons loaded: " + lessons.size());
	}
	
	
	
	/**
	 * Minimal test helper that writes a sample course document to Firestore.
	 * Kept for manual testing / demos.
	 */
	public void process() {
		try { 
			Map<String, Object> course = new HashMap<>();
			course.put("name", "Algorithms"); 
			course.put("lecturer", "Dr. Cohen"); 
			course.put("hours", 16);
			
			DocumentReference docRef = firestore
				.collection("courses")
				.document("course1");
			
			docRef.set(course);
			
			System.out.println("Course saved to Firestore!");
			
		}catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	
}