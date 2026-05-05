package com.coursescheduling.server.service;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.google.cloud.firestore.Firestore;
import com.coursescheduling.server.model.Course;
import com.coursescheduling.server.model.Lecturer;
import com.coursescheduling.server.model.Lesson;
import com.coursescheduling.server.model.LessonType;
import com.coursescheduling.server.model.Semester;


@Service 
/**
 * Service responsible for reading an uploaded Excel file and converting rows
 * into Lesson objects. Provides small helpers to parse and normalize values.
 */
public class ExcelProcessingService {
	private final Firestore firestore;
	
	private final LessonService lessonService;
	private final CourseService courseService;
	private final LecturerService lecturerService;
		
	public ExcelProcessingService(Firestore firestore, LessonService lessonService, CourseService courseService, LecturerService lecturerService) {
	    this.firestore = firestore;
	    this.lessonService = lessonService;
	    this.courseService = courseService;
	    this.lecturerService = lecturerService;
	}
	
	
	public static class ValidationIssue {
	    public String identifier;
	    public List<Integer> rows = new ArrayList<>(); 

	    public ValidationIssue(String identifier, int row) {
	        this.identifier = identifier;
	        this.rows.add(row);
	    }
	}

	public static class LessonUploadSummary {
	    public int savedCount = 0;
	    public List<ValidationIssue> missingCourses = new ArrayList<>();
	    public List<ValidationIssue> missingLecturers = new ArrayList<>();
	    public List<ValidationIssue> invalidTypes = new ArrayList<>();
	    public List<ValidationIssue> invalidSemesters = new ArrayList<>();
	    public List<ValidationIssue> invalidDurations = new ArrayList<>();
	    public int totalRows = 0;
	}
	
	
	public LessonUploadSummary process(MultipartFile file) {
	    LessonUploadSummary summary = new LessonUploadSummary();
	    Set<String> existingLecturers = new HashSet<>();
	    
	    try {
	        lecturerService.getAllLecturers().forEach(l -> existingLecturers.add(l.getName().trim()));
	        List<Course> courses = courseService.getAllCourses();
	        Map<String, Course> courseMap = new HashMap<>();
	        for (Course c : courses) courseMap.put(c.getCourseId(), c);

	        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
	            Sheet sheet = workbook.getSheetAt(0);
	            summary.totalRows = sheet.getLastRowNum();
	            List<Lesson> lessons = new ArrayList<>();

	            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
	                Row row = sheet.getRow(i);
	                if (row == null || isRowEmpty(row)) continue;

	                int currentRowNum = i + 1;
	                String courseId = getCourseIdFromCell(row.getCell(0));
	                if (courseId == null || courseId.trim().isEmpty()) {
	                    addValidationIssue(summary.missingCourses, "[Missing Course ID]", currentRowNum);
	                    continue;
	                }
	                
	                if (!courseMap.containsKey(courseId)) {
	                    addValidationIssue(summary.missingCourses, courseId, currentRowNum);
	                    continue;
	                }
	                
	                
	                String lecturerName = getSafeCellString(row, 3);
	                if (lecturerName.isEmpty()) {
	                    addValidationIssue(summary.missingLecturers, "[Missing Lecturer Name]", currentRowNum);
	                    continue;
	                }
	                if (!existingLecturers.contains(lecturerName)) {
	                    addValidationIssue(summary.missingLecturers, lecturerName, currentRowNum);
	                    continue;
	                }
	                
	                
	                String typeText = getSafeCellString(row, 2);
	                if (typeText.isEmpty()) {
	                    addValidationIssue(summary.invalidTypes, "[Missing Lesson Type]", currentRowNum);
	                    continue;
	                }
	                LessonType type = parseType(typeText);
	                if (type == null) {
	                    addValidationIssue(summary.invalidTypes, typeText, currentRowNum);
	                    continue;
	                }
	                
	                String semesterText = getSafeCellString(row, 5);
	                if (semesterText.isEmpty()) {
	                    addValidationIssue(summary.invalidSemesters, "[Missing Semester]", currentRowNum);
	                    continue;
	                }
	                Semester semester;
	                try {
	                    semester = parseSemester(semesterText);
	                } catch (Exception e) {
	                    addValidationIssue(summary.invalidSemesters, semesterText, currentRowNum);
	                    continue;
	                }
       

	                int duration;
	                try {
	                    org.apache.poi.ss.usermodel.Cell durationCell = row.getCell(7);
	                    if (durationCell == null || durationCell.getCellType() == org.apache.poi.ss.usermodel.CellType.BLANK) {
	                        addValidationIssue(summary.invalidDurations, "[Missing Duration]", currentRowNum);
	                        continue;
	                    }
	                    
	                    if (durationCell.getCellType() == org.apache.poi.ss.usermodel.CellType.NUMERIC) {
	                        double numericValue = durationCell.getNumericCellValue();
	                        if (numericValue != 1.0 && numericValue != 2.0 && numericValue != 3.0 && numericValue != 4.0) {
	                            throw new Exception(); 
	                        }
	                        duration = (int) numericValue;
	                    } else {
	                        duration = Integer.parseInt(durationCell.toString().trim());
	                        if (duration != 1 && duration != 2 && duration != 3 && duration != 4) {
	                            throw new Exception();
	                        }
	                    }
	                } catch (Exception e) {
	                    String cellVal = row.getCell(7) != null ? row.getCell(7).toString().trim() : "";
	                    addValidationIssue(summary.invalidDurations, cellVal, currentRowNum);
	                    continue;
	                }

	                addLessonToList(courseId, row.getCell(1).toString(), type, lecturerName, semester, duration, lessons, courseMap);
	                summary.savedCount++;
	            }

	            if (!lessons.isEmpty()) {
	                lessonService.saveLessons(lessons);
	            }
	        }
	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	    return summary;
	}
	
	
	
	private String getSafeCellString(Row row, int cellIndex) {
	    org.apache.poi.ss.usermodel.Cell cell = row.getCell(cellIndex);
	    if (cell == null || cell.getCellType() == org.apache.poi.ss.usermodel.CellType.BLANK) {
	        return "";
	    }
	    return cell.toString().trim();
	}
	
	
	
	
	
	private void addLessonToList(String courseId, String courseName, LessonType type, String lecturer, Semester semester, int duration, List<Lesson> lessons, Map<String, Course> courseMap) {
	    
	    if (type == LessonType.LAB) {
	        if (courseId.equals("61181")) type = LessonType.PHYSICS_LAB;
	        else if (courseId.equals("61765")) type = LessonType.NETWORKING_LAB;
	    }

	    if (duration >= 4) {
	        String splitGroupId = UUID.randomUUID().toString();
	        int halfDuration = duration / 2;
	        
	        Lesson lesson1 = createLesson(courseId, courseName, type, lecturer, semester, halfDuration, splitGroupId, courseMap);
	        Lesson lesson2 = createLesson(courseId, courseName, type, lecturer, semester, halfDuration, splitGroupId, courseMap);
	        
	        if (lesson1 != null) lessons.add(lesson1);
	        if (lesson2 != null) lessons.add(lesson2);
	    } else {
	        Lesson lesson = createLesson(courseId, courseName, type, lecturer, semester, duration, null, courseMap);
	        if (lesson != null) lessons.add(lesson);
	    }
	}

	private Lesson createLesson(String courseId, String courseName, LessonType type, String lecturer, Semester semester, int duration, String splitGroupId, Map<String, Course> courseMap) {
	    Lesson lesson = new Lesson();
	    lesson.setLessonId(UUID.randomUUID().toString());
	    lesson.setCourseId(courseId);
	    lesson.setCourseName(courseName);
	    lesson.setType(type);
	    lesson.setLecturer(lecturer);
	    lesson.setSemester(semester);
	    lesson.setDuration(duration);
	    lesson.setSplitGroupId(splitGroupId);

	    Course course = courseMap.get(courseId);
	    if (course != null) {
	        lesson.setCluster(course.getCluster());
	        lesson.setCredits(course.getCredits());
	    }
	    return lesson;
	}
	
	
	
	
	private String getCourseIdFromCell(org.apache.poi.ss.usermodel.Cell cell) {
	    if (cell == null) return "";
	    if (cell.getCellType() == org.apache.poi.ss.usermodel.CellType.NUMERIC) {
	        return String.valueOf((int) cell.getNumericCellValue());
	    }
	    return cell.toString().trim();
	}

	private boolean isRowEmpty(Row row) {
	    if (row == null) return true;
	    org.apache.poi.ss.usermodel.Cell cell = row.getCell(0);
	    return cell == null || cell.getCellType() == org.apache.poi.ss.usermodel.CellType.BLANK;
	}
	
	
	
	
	// Parse the lesson type text (in Hebrew/English) to the LessonType enum.
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
	    
	    return null;
	}
	
	private void addValidationIssue(List<ValidationIssue> issues, String identifier, int row) {
	    ValidationIssue existing = issues.stream().filter(i -> i.identifier.equals(identifier)).findFirst().orElse(null);

	    if (existing != null) {
	        existing.rows.add(row); 
	    } else {
	        issues.add(new ValidationIssue(identifier, row)); 
	    }
	}
	
	
	
	
	// Parse the semester text into the Semester enum.
	private Semester parseSemester(String semesterText) {
	    if (semesterText.contains("א")) 
	        return Semester.A;
	    if (semesterText.contains("ב")) 
	        return Semester.B;
	    throw new IllegalArgumentException("Unknown semester: " + semesterText);
	}
	
	
	
	public byte[] exportLessonsTemplate() throws Exception {
	    Workbook workbook = new XSSFWorkbook();
	    Sheet sheet = workbook.createSheet("Lessons");

	    Row header = sheet.createRow(0);
	    header.createCell(0).setCellValue("מס' קורס");
	    header.createCell(1).setCellValue("שם הקורס");
	    header.createCell(2).setCellValue("סוג");
	    header.createCell(3).setCellValue("מרצה");
	    header.createCell(4).setCellValue("סגל / ממח / עמית");
	    header.createCell(5).setCellValue("סמסטר");
	    header.createCell(6).setCellValue("מחלקה");
	    header.createCell(7).setCellValue("שע'");
	    header.createCell(8).setCellValue("מרצה");
	    header.createCell(9).setCellValue("הערות");
	    header.createCell(10).setCellValue("תאריך עדכון");
	    

	    ByteArrayOutputStream out = new ByteArrayOutputStream();
	    workbook.write(out);
	    workbook.close();

	    return out.toByteArray();
	}
	
	
	
	/*
	// Convert a single sheet row into one or more Lesson objects.
	private void addLessonFromRow(Row row, List<Lesson> lessons, Map<String, Course> courseMap) {

		String courseId = getCourseIdFromCell(row.getCell(0));
		
		if (courseId == null || courseId.trim().isEmpty()) {
	        System.out.println("DEBUG: Skipping row - empty courseId");
	        return;
	    }

		
		if (courseId.contains("/")) {
		    System.out.println("Skipping row: invalid courseId " + courseId);
		    return;
		}
		

		if (courseId == null || courseId.trim().isEmpty()) {
		    System.out.println("Skipping row: missing courseId");
		    return;
		}
		
	    String courseName = row.getCell(1).toString();
	    String typeText = row.getCell(2).toString();
	    LessonType type = parseType(typeText);
	     
	    if (type == LessonType.LAB) {
	        if (courseId.equals("61181")) {
	            type = LessonType.PHYSICS_LAB;
	        } else if (courseId.equals("61765")) {
	            type = LessonType.NETWORKING_LAB;
	        }
	    }
	    
	    if (type == null) {
	        System.out.println("Skipping row: unknown type " + typeText);
	        return;
	    }
	    
	    if (type != LessonType.LECTURE && type != LessonType.TUTORIAL && type != LessonType.LAB && type != LessonType.PHYSICS_LAB && type != LessonType.NETWORKING_LAB && type != LessonType.PBL && type != LessonType.PROJECT) {
	        System.out.println("Skipping row: unsupported type " + typeText);
	        return;
	    }
	    
	    
	    
	    String lecturer = row.getCell(3).toString();

	    String semesterText = row.getCell(5).toString();
	    Semester semester = parseSemester(semesterText);

	    int duration = (int) row.getCell(7).getNumericCellValue();
	    
	    if (lecturer == null || lecturer.trim().isEmpty()) {
	        System.out.println("Skipping row: missing lecturer for course " + courseId);
	        return;
	    }

	    if (duration <= 0) {
	        System.out.println("Skipping row: invalid duration for course " + courseId);
	        return;
	    }

	    if (duration == 4) {
	    	
	    	String splitGroupId = UUID.randomUUID().toString();
	        Lesson lesson1 = createLesson(courseId, courseName, type, lecturer, semester, 2, splitGroupId, courseMap);
	        Lesson lesson2 = createLesson(courseId, courseName, type, lecturer, semester, 2, splitGroupId , courseMap);

	        if (lesson1 != null) lessons.add(lesson1);
	        if (lesson2 != null) lessons.add(lesson2);

	    } else {

	        Lesson lesson = createLesson(courseId, courseName, type, lecturer, semester, duration, null , courseMap);
	        if (lesson != null) {
	            lessons.add(lesson);
	        }
	    }
	}
	

	
	// Sort lessons by courseId, semester and type priority.
	private void sortLessons(List<Lesson> lessons) {
	    lessons.sort((l1, l2) -> {

	        int courseCompare = l1.getCourseId().compareTo(l2.getCourseId());
	        if (courseCompare != 0)
	            return courseCompare;

	        int semesterCompare = l1.getSemester().compareTo(l2.getSemester());
	        if (semesterCompare != 0)
	            return semesterCompare;

	        return Integer.compare(l1.getType().getPriority(), l2.getType().getPriority());
	    });
	}
	
*/
	
	
	
	
	
}