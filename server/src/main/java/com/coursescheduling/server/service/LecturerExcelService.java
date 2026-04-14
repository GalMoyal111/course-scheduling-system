package com.coursescheduling.server.service;

import com.coursescheduling.server.algorithm.model.DomainValue;
import com.coursescheduling.server.model.Lecturer;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.*;


@Service
public class LecturerExcelService {

	@Autowired
    private LecturerService lecturerService;
	
	public static class LecturerUploadSummary {
	    public int totalRows = 0;
	    public int savedLecturers = 0;
	    public List<String> invalidSlots = new ArrayList<>();
	    
	    public int getTotalRows() { return totalRows; }
	    public void setTotalRows(int totalRows) { this.totalRows = totalRows; }
	    public int getSavedLecturers() { return savedLecturers; }
	    public void setSavedLecturers(int savedLecturers) { this.savedLecturers = savedLecturers; }
	    public List<String> getInvalidSlots() { return invalidSlots; }
	    public void setInvalidSlots(List<String> invalidSlots) { this.invalidSlots = invalidSlots; }
	}

	

	public LecturerUploadSummary process(MultipartFile file) {
		
		LecturerUploadSummary summary = new LecturerUploadSummary();
		
	    try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
	        Sheet sheet = workbook.getSheetAt(0);
	        Iterator<Row> rows = sheet.iterator();
	        Map<String, Lecturer> lecturerMap = new HashMap<>();

	        if (rows.hasNext()) rows.next(); // Skip header

	        DataFormatter formatter = new DataFormatter();
	        int rowIndex = 1;
	        
	        while (rows.hasNext()) {
	        	rowIndex++;
	            Row currentRow = rows.next();
	            if (currentRow == null) continue;
	            
	            summary.totalRows++;

	            String name = formatter.formatCellValue(currentRow.getCell(0)).trim();
	            String dayStr = formatter.formatCellValue(currentRow.getCell(1)).trim();
	            String startFrameStr = formatter.formatCellValue(currentRow.getCell(2)).trim();

	            if (name.isEmpty()) {
	            	summary.invalidSlots.add("Row " + rowIndex + ": Lecturer's name missing");
	                continue;
	            }
	            
	            lecturerMap.putIfAbsent(name, new Lecturer(null, name, new ArrayList<>()));
	            
	            
	            if (!dayStr.isEmpty() && !startFrameStr.isEmpty()) {
	                try {
	                    int startFrame = Integer.parseInt(startFrameStr);
	                    int day = Integer.parseInt(dayStr);
	                    lecturerMap.get(name).getUnavailableSlots().add(new DomainValue(day, startFrame));
	                } catch (NumberFormatException e) {
	                	summary.invalidSlots.add("Row " + rowIndex + " (" + name + "): Invalid day/time format");
	                }
	            }
	        }

	        List<Lecturer> lecturersToSave = new ArrayList<>(lecturerMap.values());
	        summary.savedLecturers = lecturersToSave.size();
	        
	        
	        if (!lecturersToSave.isEmpty()) {
	            lecturerService.deleteAllLecturers();          
	            lecturerService.saveLecturersBatch(lecturersToSave);
	        }
	        
	        return summary;

	    } catch (Exception e) {
	        throw new RuntimeException("fail to store excel data: " + e.getMessage(), e);
	    }
	}
	
	

    public byte[] exportLecturersToExcel() throws Exception {
        List<Lecturer> lecturers = lecturerService.getAllLecturers();
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Lecturers Availability");

            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("name");
            headerRow.createCell(1).setCellValue("day");           
            headerRow.createCell(2).setCellValue("hour");
            

            int rowIdx = 1;
            for (Lecturer lecturer : lecturers) {
            	if (!lecturer.getUnavailableSlots().isEmpty()) {
            		for (DomainValue slot : lecturer.getUnavailableSlots()) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(lecturer.getName());
                    row.createCell(1).setCellValue(slot.getDay());
                    row.createCell(2).setCellValue(slot.getStartFrame());
            		}
            	}
        		else {
        			Row row = sheet.createRow(rowIdx++);
        			row.createCell(0).setCellValue(lecturer.getName());
            	}
                
            }
            workbook.write(out);
            return out.toByteArray();
        }
    }
}
