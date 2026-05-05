package com.coursescheduling.server.service;

import com.coursescheduling.server.model.Classroom;
import com.coursescheduling.server.model.RoomType;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import org.springframework.web.multipart.MultipartFile;
import com.google.cloud.firestore.QueryDocumentSnapshot;

import java.io.ByteArrayOutputStream;

@Service
public class ClassroomExcelService {
	
	@Autowired
    private ClassroomService classroomService;

	
	public static class ClassroomUploadSummary {
	    public int totalRows = 0;
	    public int savedClassrooms = 0;
	    public List<String> invalidRows = new ArrayList<>();
	    public List<String> warningRows = new ArrayList<>();
	    
	    public int getTotalRows() { return totalRows; }
	    public int getSavedClassrooms() { return savedClassrooms; }
	    public List<String> getInvalidRows() { return invalidRows; }
	    public List<String> getWarningRows() { return warningRows; }
	}
	
	
	public ClassroomUploadSummary process(MultipartFile file) {
		ClassroomUploadSummary summary = new ClassroomUploadSummary();
		// java.util.Set<String> seenClassrooms = new java.util.HashSet<>();
		Set<String> seenClassrooms = new HashSet<>();

	    try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
	        Sheet sheet = workbook.getSheetAt(0);
	        List<Classroom> classrooms = new ArrayList<>();

	        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
	            Row row = sheet.getRow(i);
	            if (row == null) continue;
	            
	            summary.totalRows++;

	            try {
	                String building = row.getCell(0) != null ? row.getCell(0).getStringCellValue().trim() : "";
	                String classroomName = row.getCell(1) != null ? row.getCell(1).getStringCellValue().trim() : "";
	                String rowLabel = "Row " + (i + 1) + " (Building: " + safeValue(building) + ", Classroom: " + safeValue(classroomName) + ")";

	                if (building.isEmpty() || classroomName.isEmpty()) {
	                    summary.invalidRows.add(rowLabel + ": Missing building name or classroom name");
	                    continue;
	                }

	                String classPrefix = extractBuildingPrefix(classroomName);
	                if (classPrefix == null || !classPrefix.equalsIgnoreCase(building)) {
	                    summary.invalidRows.add(
	                        rowLabel + ": Building does not match classroom name prefix"
	                    );
	                    continue;
	                }

	                int capacity = 0;
	                if (row.getCell(2) != null) {
	                    capacity = (int) row.getCell(2).getNumericCellValue();
	                } else {
	                	summary.invalidRows.add(rowLabel + ": Lack of capacity");
	                	continue;
	                }

	                Cell typeCell = row.getCell(3);
	                String typeStr = (typeCell != null) ? typeCell.getStringCellValue() : "NORMAL";
	                RoomType type = parseRoomType(typeStr);

	                String classroomKey = (building + "||" + classroomName).toLowerCase();
	                if (seenClassrooms.contains(classroomKey)) {
	                    summary.warningRows.add(
	                        rowLabel + ": Duplicate classroom found in the uploaded file. Only the first occurrence was saved."
	                    );
	                    continue;
	                }
	                seenClassrooms.add(classroomKey);

	                Classroom classroom = new Classroom(building, classroomName, capacity, type);
	                classrooms.add(classroom);
	                
	            } catch (Exception e) {
	                summary.invalidRows.add("Row " + (i + 1) + ": Invalid data format (building/classroom/capacity could not be read)");
	            }
	        }

	        summary.savedClassrooms = classrooms.size();

	        if (!classrooms.isEmpty()) {
	            classroomService.saveClassroomsToFirebase(classrooms);
	        }

	        return summary;
	        
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
	        
	        String typeStr = (typeCell != null) ? typeCell.getStringCellValue() : "NORMAL";
	        
	        RoomType type = parseRoomType(typeStr);
	        
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

	            Map<String, Object> data = (Map<String, Object>) classrooms.get(classroomName);

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

	private RoomType parseRoomType(String text) {
		
	    if (text == null) return RoomType.NORMAL;
	    String normalized = text.trim().toUpperCase();
	    
	    try {
	        return RoomType.valueOf(normalized);
	    } catch (IllegalArgumentException e) {
	        
	        if (normalized.contains("PBL")) return RoomType.PBL;
	        
	        return RoomType.NORMAL; 
	    }
	}

	private String extractBuildingPrefix(String classroomName) {
	    if (classroomName == null) return null;

	    String trimmed = classroomName.trim();
	    if (trimmed.isEmpty()) return null;
		Matcher matcher = Pattern.compile("^([^0-9]+)(?=\\d)").matcher(trimmed);
		

	    // java.util.regex.Matcher matcher = java.util.regex.Pattern
	    //     .compile("^([^0-9]+)(?=\\d)")
	    //     .matcher(trimmed);

	    if (!matcher.find()) return null;

	    return matcher.group(1).trim();
	}

	private String safeValue(String value) {
	    return (value == null || value.isBlank()) ? "<empty>" : value;
	}
	
	
	public byte[] exportClassroomsTemplate() throws Exception {

	    Workbook workbook = new XSSFWorkbook();
	    Sheet sheet = workbook.createSheet("Classrooms");

	    Row header = sheet.createRow(0);
	    header.createCell(0).setCellValue("Building");
	    header.createCell(1).setCellValue("Classroom");
	    header.createCell(2).setCellValue("Capacity");
	    header.createCell(3).setCellValue("Type");

	    ByteArrayOutputStream out = new ByteArrayOutputStream();
	    workbook.write(out);
	    workbook.close();

	    return out.toByteArray();
	}
	
	
}