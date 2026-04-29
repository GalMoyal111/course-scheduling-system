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

            if (rows.hasNext()) rows.next(); 

            DataFormatter formatter = new DataFormatter();
            int rowIndex = 1;

            while (rows.hasNext()) {
                rowIndex++;
                Row currentRow = rows.next();
                if (currentRow == null) continue;

                // קריאת התאים כטקסט
                String name = formatter.formatCellValue(currentRow.getCell(0)).trim();
                String hardDayStr = formatter.formatCellValue(currentRow.getCell(1)).trim();
                String hardFrameStr = formatter.formatCellValue(currentRow.getCell(2)).trim();
                
                String softDayStr = "";
                String softFrameStr = "";

                if (currentRow.getLastCellNum() >= 4) {
                    softDayStr = formatter.formatCellValue(currentRow.getCell(3)).trim();
                }
                if (currentRow.getLastCellNum() >= 5) {
                    softFrameStr = formatter.formatCellValue(currentRow.getCell(4)).trim();
                }


                if (name.isEmpty() && hardDayStr.isEmpty() && hardFrameStr.isEmpty() && softDayStr.isEmpty() && softFrameStr.isEmpty()) {
                    continue;
                }

                summary.totalRows++;


                if (name.isEmpty()) {
                    summary.invalidSlots.add("Row " + rowIndex + ": Missing lecturer name. Row skipped.");
                    continue;
                }

                boolean hasHard = !hardDayStr.isEmpty() || !hardFrameStr.isEmpty();
                boolean hasSoft = !softDayStr.isEmpty() || !softFrameStr.isEmpty();


                if (hasHard && hasSoft) {
                    summary.invalidSlots.add("Row " + rowIndex + " (" + name + "): Invalid row. Cannot define both Hard and Soft constraints in the same row. Row skipped.");
                    continue;
                }


                if (hasHard && (hardDayStr.isEmpty() || hardFrameStr.isEmpty())) {
                    summary.invalidSlots.add("Row " + rowIndex + " (" + name + "): Partial Hard constraint (missing day or hour). Row skipped.");
                    continue;
                }
                if (hasSoft && (softDayStr.isEmpty() || softFrameStr.isEmpty())) {
                    summary.invalidSlots.add("Row " + rowIndex + " (" + name + "): Partial Soft constraint (missing day or hour). Row skipped.");
                    continue;
                }


                lecturerMap.putIfAbsent(name, new Lecturer(null, name, new ArrayList<>(), new ArrayList<>()));
                Lecturer currentLecturer = lecturerMap.get(name);


                if (hasHard) {
                    try {

                        int day = Integer.parseInt(hardDayStr);
                        int frame = Integer.parseInt(hardFrameStr);


                        if (day < 1 || day > 6 || frame < 1 || frame > 12) {
                            summary.invalidSlots.add("Row " + rowIndex + " (" + name + "): Out of bounds. Day must be 1-6 and Hour 1-12.");
                            continue;
                        }


                        boolean isDuplicateHard = currentLecturer.getUnavailableSlots().stream().anyMatch(s -> s.getDay() == day && s.getStartFrame() == frame);
                        boolean isContradictionSoft = currentLecturer.getNonPreferredSlots().stream().anyMatch(s -> s.getDay() == day && s.getStartFrame() == frame);

                        if (isDuplicateHard) {

                            continue;
                        } else if (isContradictionSoft) {
                            summary.invalidSlots.add("Row " + rowIndex + " (" + name + "): Contradiction! A Soft constraint was already defined for Day " + day + " Hour " + frame + ". Ignoring this Hard constraint.");
                        } else {
                            currentLecturer.getUnavailableSlots().add(new DomainValue(day, frame));
                        }

                    } catch (NumberFormatException e) {
                        summary.invalidSlots.add("Row " + rowIndex + " (" + name + "): Invalid format. Day and Hour must be valid numbers.");
                    }
                }


                if (hasSoft) {
                    try {

                        int day = Integer.parseInt(softDayStr);
                        int frame = Integer.parseInt(softFrameStr);


                        if (day < 1 || day > 6 || frame < 1 || frame > 12) {
                            summary.invalidSlots.add("Row " + rowIndex + " (" + name + "): Out of bounds. Day must be 1-6 and Hour 1-12.");
                            continue;
                        }


                        boolean isDuplicateSoft = currentLecturer.getNonPreferredSlots().stream().anyMatch(s -> s.getDay() == day && s.getStartFrame() == frame);
                        boolean isContradictionHard = currentLecturer.getUnavailableSlots().stream().anyMatch(s -> s.getDay() == day && s.getStartFrame() == frame);

                        if (isDuplicateSoft) {

                            continue;
                        } else if (isContradictionHard) {
                            summary.invalidSlots.add("Row " + rowIndex + " (" + name + "): Contradiction! A Hard constraint was already defined for Day " + day + " Hour " + frame + ". Ignoring this Soft constraint.");
                        } else {
                            currentLecturer.getNonPreferredSlots().add(new DomainValue(day, frame));
                        }

                    } catch (NumberFormatException e) {
                        summary.invalidSlots.add("Row " + rowIndex + " (" + name + "): Invalid format. Day and Hour must be valid numbers.");
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
            headerRow.createCell(0).setCellValue("Name");
            headerRow.createCell(1).setCellValue("Hard Block Day");
            headerRow.createCell(2).setCellValue("Hard Block Hour");
            headerRow.createCell(3).setCellValue("Prefer Not Day");
            headerRow.createCell(4).setCellValue("Prefer Not Hour");

            int rowIdx = 1;
            for (Lecturer lecturer : lecturers) {
                List<DomainValue> hardSlots = lecturer.getUnavailableSlots() != null ? lecturer.getUnavailableSlots() : new ArrayList<>();
                List<DomainValue> softSlots = lecturer.getNonPreferredSlots() != null ? lecturer.getNonPreferredSlots() : new ArrayList<>();

                if (hardSlots.isEmpty() && softSlots.isEmpty()) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(lecturer.getName());
                } else {

                    for (DomainValue hard : hardSlots) {
                        Row row = sheet.createRow(rowIdx++);
                        row.createCell(0).setCellValue(lecturer.getName());
                        row.createCell(1).setCellValue(hard.getDay());
                        row.createCell(2).setCellValue(hard.getStartFrame());
                    }

                    for (DomainValue soft : softSlots) {
                        Row row = sheet.createRow(rowIdx++);
                        row.createCell(0).setCellValue(lecturer.getName());
                        row.createCell(3).setCellValue(soft.getDay());
                        row.createCell(4).setCellValue(soft.getStartFrame());
                    }
                }
            }
            workbook.write(out);
            return out.toByteArray();
        }
    }
}
