package com.coursescheduling.server.service;

import com.coursescheduling.server.model.Classroom;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.SetOptions;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.database.DatabaseReference;
import org.springframework.stereotype.Service;
import com.google.firebase.database.FirebaseDatabase;

import java.io.FileInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ClassroomExcelService {
	
	public void process(MultipartFile file) {

	    try {

	        InputStream inputStream = file.getInputStream();

	        List<Classroom> classrooms = readClassroomsFromExcel(inputStream);

	        saveClassroomsToFirebase(classrooms);

	        System.out.println("Finished uploading classrooms to Firebase");

	    } catch (Exception e) {
	        e.printStackTrace();
	        throw new RuntimeException("Failed to process classrooms file");
	    }
	}
	

	public List<Classroom> readClassroomsFromExcel(InputStream inputStream) throws Exception {

	    List<Classroom> classrooms = new ArrayList<>();

	    Workbook workbook = new XSSFWorkbook(inputStream);
	    Sheet sheet = workbook.getSheetAt(0);

	    for (int i = 1; i <= sheet.getLastRowNum(); i++) {

	        Row row = sheet.getRow(i);
	        if (row == null) continue;

	        String building = row.getCell(0).getStringCellValue();
	        String classroomName = row.getCell(1).getStringCellValue();
	        int capacity = (int) row.getCell(2).getNumericCellValue();
	        Cell typeCell = row.getCell(3);

	        String type = "normal";
	        if (typeCell != null) {
	            type = typeCell.getStringCellValue();
	        }

	        Classroom classroom = new Classroom(building, classroomName, capacity, type);

	        classrooms.add(classroom);
	    }

	    workbook.close();

	    return classrooms;
	}
	
	
	
	public void saveClassroomsToFirebase(List<Classroom> classrooms) {

		Firestore db = FirestoreClient.getFirestore();

	    for (Classroom classroom : classrooms) {

	        Map<String, Object> data = new HashMap<>();
	        data.put("capacity", classroom.getCapacity());
	        data.put("type", classroom.getType());

	        db.collection("classrooms")
	        .document(classroom.getBuilding())
	        .set(Map.of(classroom.getClassroomName(), data), SetOptions.merge());
	    }
	}
	
	
	// temp method for testing the service, will be removed later
	public void testLocalFile() throws Exception {

		InputStream inputStream = new FileInputStream("C:\\Users\\galmo\\Desktop\\Classroom List.xlsx");

	    List<Classroom> classrooms = readClassroomsFromExcel(inputStream);

	    saveClassroomsToFirebase(classrooms);

	    System.out.println("Finished uploading classrooms to Firebase");
	}
	
	
	
	
}