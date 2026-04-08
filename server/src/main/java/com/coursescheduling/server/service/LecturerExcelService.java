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

	public void process(MultipartFile file) {
	    try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
	        Sheet sheet = workbook.getSheetAt(0);
	        Iterator<Row> rows = sheet.iterator();

	        Map<String, Lecturer> lecturerMap = new HashMap<>();

	        if (rows.hasNext()) rows.next();

	        DataFormatter formatter = new DataFormatter();

	        while (rows.hasNext()) {
	            Row currentRow = rows.next();
	            
	            if (currentRow == null) continue;

	            String name = formatter.formatCellValue(currentRow.getCell(0)).trim();
	            String dayStr = formatter.formatCellValue(currentRow.getCell(1)).trim();
	            String startFrameStr = formatter.formatCellValue(currentRow.getCell(2)).trim();
	           

	            if (name.isEmpty() || startFrameStr.isEmpty() || dayStr.isEmpty()) {
	                continue;
	            }

	            try {
	                int startFrame = Integer.parseInt(startFrameStr);
	                int day = Integer.parseInt(dayStr);

	                // מוסיפים למפה
	                lecturerMap.putIfAbsent(name, new Lecturer(null, name, new ArrayList<>()));
	                lecturerMap.get(name).getUnavailableSlots().add(new DomainValue(day, startFrame));
	                
	            } catch (NumberFormatException e) {
	                System.out.println("Skipping invalid row for lecturer '" + name + "': Expected numbers for day/frame but got text.");
	            }
	        }

	        List<Lecturer> lecturersToSave = new ArrayList<>(lecturerMap.values());
	        if (!lecturersToSave.isEmpty()) {
	            lecturerService.saveLecturersBatch(lecturersToSave);
	        }

	    } catch (Exception e) {
	        throw new RuntimeException("fail to store excel data: " + e.getMessage(), e);
	    }
	}

    public byte[] exportLecturersToExcel() throws Exception {
        List<Lecturer> lecturers = lecturerService.getAllLecturers();
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Lecturers Availability");

            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("hour");
            headerRow.createCell(1).setCellValue("day");
            headerRow.createCell(2).setCellValue("name");

            int rowIdx = 1;
            for (Lecturer lecturer : lecturers) {
                for (DomainValue slot : lecturer.getUnavailableSlots()) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(slot.getStartFrame());
                    row.createCell(1).setCellValue(slot.getDay());
                    row.createCell(2).setCellValue(lecturer.getName());
                }
                if (lecturer.getUnavailableSlots().isEmpty()) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(2).setCellValue(lecturer.getName());
                }
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
