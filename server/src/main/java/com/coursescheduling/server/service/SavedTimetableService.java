package com.coursescheduling.server.service;

import com.coursescheduling.server.algorithm.model.ScheduledLessonDTO;
import com.coursescheduling.server.model.SaveTimetableRequest;
import com.coursescheduling.server.model.SavedTimetableMetadata;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteBatch;
import com.google.firebase.cloud.FirestoreClient;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class SavedTimetableService {


    @Autowired
    private ClusterService clusterService;

    private static final String MAIN_COLLECTION = "saved_timetables";
    private static final String SUB_COLLECTION = "schedule_data";
    
    private static final String[] DAYS = {"ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי"};
    private static final int START_HOUR = 8;
    private static final int END_HOUR = 21;

    private List<SavedTimetableMetadata> cachedMetadata = null;
    private long lastFetchTimeMetadata = 0;
    private static final long CACHE_DURATION = 60 * 60 * 1000;
    
    private final Map<String, List<ScheduledLessonDTO>> timetableDataCache = new ConcurrentHashMap<>();

    public SavedTimetableMetadata saveTimetable(SaveTimetableRequest request) throws Exception {
    	this.cachedMetadata = null;
    	Firestore db = FirestoreClient.getFirestore();
        
        String timetableId = UUID.randomUUID().toString();
        long currentTimestamp = System.currentTimeMillis();

        SavedTimetableMetadata metadata = new SavedTimetableMetadata(
                timetableId,
                request.getName(),
                request.getSemester(),
                currentTimestamp
        );

        WriteBatch batch = db.batch();

        DocumentReference mainDocRef = db.collection(MAIN_COLLECTION).document(timetableId);
        batch.set(mainDocRef, metadata);

        DocumentReference subDocRef = mainDocRef.collection(SUB_COLLECTION).document("full_array");
        
        ScheduleWrapper wrapper = new ScheduleWrapper(request.getSchedule());
        batch.set(subDocRef, wrapper);

        batch.commit().get();

        timetableDataCache.put(timetableId, request.getSchedule());
        return metadata; 
    }

    public void deleteTimetable(String timetableId) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        DocumentReference mainDocRef = db.collection(MAIN_COLLECTION).document(timetableId);
        DocumentReference subDocRef = mainDocRef.collection(SUB_COLLECTION).document("full_array");

        WriteBatch batch = db.batch();
        batch.delete(subDocRef);
        batch.delete(mainDocRef);
        batch.commit().get();

        // Invalidate caches
        this.cachedMetadata = null;
        this.timetableDataCache.remove(timetableId);
    }

    public SavedTimetableMetadata updateTimetableName(String timetableId, String newName) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        DocumentReference mainDocRef = db.collection(MAIN_COLLECTION).document(timetableId);

        Map<String, Object> update = new ConcurrentHashMap<>();
        update.put("name", newName);

        mainDocRef.update(update).get();

        // Update cached metadata if present
        if (this.cachedMetadata != null) {
            for (SavedTimetableMetadata m : this.cachedMetadata) {
                if (m.getId().equals(timetableId)) {
                    m.setName(newName);
                    break;
                }
            }
        }

        // Return updated metadata
        return mainDocRef.get().get().toObject(SavedTimetableMetadata.class);
    }

    public List<SavedTimetableMetadata> getAllSavedMetadata() throws Exception {
    	
    	if (cachedMetadata != null && (System.currentTimeMillis() - lastFetchTimeMetadata < CACHE_DURATION)) {
            System.out.println("Returning Saved Timetables Metadata from Server Cache");
            return cachedMetadata;
        }
    	
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<QuerySnapshot> future = db.collection(MAIN_COLLECTION).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        List<SavedTimetableMetadata> metadataList = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            SavedTimetableMetadata metadata = document.toObject(SavedTimetableMetadata.class);
            metadataList.add(metadata);
        }
        
        this.cachedMetadata = metadataList;
        this.lastFetchTimeMetadata = System.currentTimeMillis();

        return metadataList;
    }

    public List<ScheduledLessonDTO> getTimetableDataById(String timetableId) throws Exception {
       
    	if (timetableDataCache.containsKey(timetableId)) {
            System.out.println("Returning Timetable Data (" + timetableId + ") from Server Cache");
            return timetableDataCache.get(timetableId);
        }
    	
    	Firestore db = FirestoreClient.getFirestore();
        
        DocumentReference subDocRef = db.collection(MAIN_COLLECTION)
                                        .document(timetableId)
                                        .collection(SUB_COLLECTION)
                                        .document("full_array");
                                        
        ScheduleWrapper wrapper = subDocRef.get().get().toObject(ScheduleWrapper.class);
        
        if (wrapper != null && wrapper.getLessons() != null) {
        	timetableDataCache.put(timetableId, wrapper.getLessons());
            return wrapper.getLessons();
        }
        
        
        return new ArrayList<>(); 
    }

    
    
    public static class ScheduleWrapper {
        private List<ScheduledLessonDTO> lessons;

        public ScheduleWrapper() {} 

        public ScheduleWrapper(List<ScheduledLessonDTO> lessons) {
            this.lessons = lessons;
        }

        public List<ScheduledLessonDTO> getLessons() {
            return lessons;
        }

        public void setLessons(List<ScheduledLessonDTO> lessons) {
            this.lessons = lessons;
        }
    }


    public byte[] exportTimetableToExcel(List<ScheduledLessonDTO> schedule) throws Exception {
        
        Map<String, List<ScheduledLessonDTO>> sheetsMap = new TreeMap<>();

        for (ScheduledLessonDTO lesson : schedule) {
            int clusterNum = lesson.getCluster(); // מזהה האשכול/סמסטר
            String sheetName;

            if (clusterNum >= 1 && clusterNum <= 8) {
                sheetName = "סמסטר " + clusterNum;
            } else if (clusterNum >= 9) {
                sheetName = "אשכולות בחירה";
            } else {
                sheetName = "אחר";
            }

            sheetsMap.computeIfAbsent(sheetName, k -> new ArrayList<>()).add(lesson);
        }

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            // עיצובים בסיסיים
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle cellStyle = createBodyStyle(workbook);

            // --- שלב 2: יצירת הגיליונות בפועל לפי הסדר ---
            for (String sheetName : sheetsMap.keySet()) {
                Sheet sheet = workbook.createSheet(sheetName);
                sheet.setRightToLeft(true); // עברית

                // יצירת שורת כותרת (ימים)
                Row headerRow = sheet.createRow(0);
                headerRow.createCell(0).setCellValue("שעה / יום");
                headerRow.getCell(0).setCellStyle(headerStyle);
                for (int i = 0; i < DAYS.length; i++) {
                    Cell cell = headerRow.createCell(i + 1);
                    cell.setCellValue(DAYS[i]);
                    cell.setCellStyle(headerStyle);
                }

                for (int hour = START_HOUR; hour < END_HOUR; hour++) {
                    int rowIndex = hour - START_HOUR + 1;
                    Row row = sheet.createRow(rowIndex);
                    
                    String timeRange = String.format("%02d:00 - %02d:00", hour, hour + 1);
                    Cell timeCell = row.createCell(0);
                    timeCell.setCellValue(timeRange);
                    timeCell.setCellStyle(headerStyle);

                    for (int dayNum = 1; dayNum <= 6; dayNum++) { 
                        final int currentDay = dayNum;
                        final int currentHourFrame = hour - START_HOUR + 1;

                        List<ScheduledLessonDTO> lessonsInSlot = sheetsMap.get(sheetName).stream()
                        	    .filter(l -> {
                        	        int start = l.getStartFrame();
                        	        int end = start + (l.getDuration() - 1);

                        	        return l.getDay() == currentDay &&
                        	               currentHourFrame >= start &&
                        	               currentHourFrame <= end;
                        	    })
                        	    .collect(Collectors.toList());

                        if (!lessonsInSlot.isEmpty()) {
                            Cell contentCell = row.createCell(dayNum);
                            
                            // שימוש בלולאה פשוטה במקום Stream כדי למנוע שגיאות קומפילציה
                            List<String> lessonLines = new ArrayList<>();
                            
                            for (ScheduledLessonDTO l : lessonsInSlot) {
                                String cName = (l.getCourseName() != null) ? l.getCourseName() : "Unknown";
                                String lName = (l.getLecturer() != null) ? l.getLecturer() : "TBD";
                                
                                // גישה לפי ה-DTO שלך: getRoom() ואז getClassroomName()
                                String rName = "No Room";
                                if (l.getRoom() != null && l.getRoom().getClassroomName() != null) {
                                    rName = l.getRoom().getClassroomName();
                                }
                                
                                String lessonType = translateLessonType(l.getType());

                                lessonLines.add(
                                    cName +
                                    "\n" + lessonType +
                                    "\n" + lName +
                                    "\n" + rName
                                );
                            }
                            
                            // חיבור כל השיעורים שנמצאו למשבצת אחת עם קו מפריד
                            String finalValue = String.join("\n---\n", lessonLines);
                            
                            contentCell.setCellValue(finalValue);
                            contentCell.setCellStyle(cellStyle);
                        }
                    }
                }

                // הגדרת רוחב עמודות קבוע שיהיה נוח לקרוא
                for (int i = 0; i <= 6; i++) {
                    sheet.setColumnWidth(i, 22 * 256);
                }
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    // פונקציות עזר לעיצוב
    private CellStyle createHeaderStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }

    private CellStyle createBodyStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        style.setWrapText(true); // מאפשר ירידת שורה בתוך התא
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }
    
    private String translateLessonType(String type) {
        switch (type) {
            case "LECTURE":
                return "הרצאה";
            case "TUTORIAL":
                return "תרגיל";
            case "LAB":
                return "מעבדה";
            case "PHYSICS_LAB":
                return "מעבדת פיזיקה";
            case "NETWORKING_LAB":
                return "מעבדת תקשורת";
            case "PBL":
                return "PBL";
            default:
                return type;
        }
    }
}