package com.coursescheduling.server.service;

import com.coursescheduling.server.model.Classroom;
import com.coursescheduling.server.model.ClassroomDeleteRequest;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.SetOptions;
import com.google.cloud.firestore.WriteBatch;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import org.springframework.web.multipart.MultipartFile;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;

import java.io.ByteArrayOutputStream;

@Service
public class ClassroomExcelService {
	
	@Autowired
    private ClassroomService classroomService;

    public void process(MultipartFile file) {

    	try {

            List<Classroom> classrooms =
                    readClassroomsFromExcel(file.getInputStream());

            classroomService.saveClassroomsToFirebase(classrooms);

        } catch (Exception e) {
            throw new RuntimeException("Failed to process classrooms file", e);
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

	
	
	
	
}