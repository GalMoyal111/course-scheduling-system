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


@Service 
public class ExcelProcessingService {
	private final Firestore firestore;
	
	public ExcelProcessingService(Firestore firestore) { 
		this.firestore = firestore; 
	}
	
	public void process(MultipartFile file) { 		
		List<Lesson> lessons = new ArrayList<>();
		try {
			
		    Workbook workbook = new XSSFWorkbook(file.getInputStream());
		    Sheet sheet = workbook.getSheetAt(0);
		     
		    for (int i = 1; i <= sheet.getLastRowNum(); i++) {

		        Row row = sheet.getRow(i);

		        if (row == null) {
		            continue;
		        }

		        if (row.getCell(0) == null) {
		            continue;
		        }

		        String courseId = row.getCell(0).toString().trim();

		        if (courseId.isEmpty()) {
		            continue;
		        }

		        String courseName = row.getCell(1).toString();
		        String type = row.getCell(2).toString();
		        String lecturer = row.getCell(3).toString();

		        String semesterText = row.getCell(5).toString();
		        int semester = semesterText.contains("א") ? 1 : 2;

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
		    System.out.println("Total lessons loaded: " + lessons.size());
		    

		} catch (Exception e) {
		    e.printStackTrace();
		}
		
		
		
		//process();
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