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
public class ExcelProcessingService {
	private final Firestore firestore;
	
	public ExcelProcessingService(Firestore firestore) { 
		this.firestore = firestore; 
	}
	
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
	
	
	private Semester parseSemester(String semesterText) {
	    if (semesterText.contains("א")) 
	        return Semester.A;
	    if (semesterText.contains("ב")) 
	        return Semester.B;
	    if (semesterText.contains("קיץ")) 
	        return Semester.SUMMER;
	    throw new IllegalArgumentException("Unknown semester: " + semesterText);
	}
	
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