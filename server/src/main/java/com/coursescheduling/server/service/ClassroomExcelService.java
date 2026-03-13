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
import com.google.cloud.firestore.QueryDocumentSnapshot;
import java.io.ByteArrayOutputStream;

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
	
	
	public byte[] exportClassroomsToExcel() throws Exception {

	    Firestore db = FirestoreClient.getFirestore();

	    List<QueryDocumentSnapshot> documents =
	            db.collection("classrooms").get().get().getDocuments();

	    Workbook workbook = new XSSFWorkbook();
	    Sheet sheet = workbook.createSheet("Classrooms");

	    Row header = sheet.createRow(0);
	    header.createCell(0).setCellValue("Building");
	    header.createCell(1).setCellValue("Classroom");
	    header.createCell(2).setCellValue("Capacity");
	    header.createCell(3).setCellValue("Type");

	    int rowIndex = 1;

	    for (QueryDocumentSnapshot doc : documents) {

	        String building = doc.getId();
	        Map<String, Object> classrooms = doc.getData();

	        for (String classroomName : classrooms.keySet()) {

	            Map<String, Object> data =
	                    (Map<String, Object>) classrooms.get(classroomName);

	            Row row = sheet.createRow(rowIndex++);

	            row.createCell(0).setCellValue(building);
	            row.createCell(1).setCellValue(classroomName);
	            row.createCell(2).setCellValue((Long) data.get("capacity"));
	            row.createCell(3).setCellValue((String) data.get("type"));
	        }
	    }

	    ByteArrayOutputStream out = new ByteArrayOutputStream();
	    workbook.write(out);
	    workbook.close();

	    return out.toByteArray();
	}
	
	
	
	public void saveSingleClassroom(Classroom classroom) {

	    Firestore db = FirestoreClient.getFirestore();

	    Map<String, Object> data = new HashMap<>();
	    data.put("capacity", classroom.getCapacity());
	    data.put("type", classroom.getType());

	    db.collection("classrooms")
	      .document(classroom.getBuilding())
	      .set(Map.of(classroom.getClassroomName(), data), SetOptions.merge());
	}
	
	
	
	
	
	
	
}