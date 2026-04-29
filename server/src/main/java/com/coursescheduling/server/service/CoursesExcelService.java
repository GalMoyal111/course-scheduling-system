package com.coursescheduling.server.service;

import com.coursescheduling.server.model.Cluster;
import com.coursescheduling.server.model.Course;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.web.multipart.MultipartFile;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import java.io.ByteArrayOutputStream;
import java.util.concurrent.ExecutionException;

@Service
public class CoursesExcelService {

    @Autowired
    private CourseService courseService;
    
    @Autowired
    private ClusterService clusterService;

    private static final String COURSE_ID_PATTERN = "^\\d{5,6}$";

    public static class InvalidCourse {
        private final String courseId;
        private final String courseName;
        private final String reason;

        public InvalidCourse(String courseId, String courseName, String reason) {
            this.courseId = courseId;
            this.courseName = courseName;
            this.reason = reason;
        }

        public String getCourseId() {
            return courseId;
        }

        public String getCourseName() {
            return courseName;
        }
        
        public String getReason() {
            return reason;
        }
    }

    public static class AdjustedCourse {
        private final String courseId;
        private final String courseName;
        private final List<String> removedPrerequisites;

        public AdjustedCourse(String courseId, String courseName, List<String> removedPrerequisites) {
            this.courseId = courseId;
            this.courseName = courseName;
            this.removedPrerequisites = removedPrerequisites;
        }

        public String getCourseId() {
            return courseId;
        }

        public String getCourseName() {
            return courseName;
        }

        public List<String> getRemovedPrerequisites() {
            return removedPrerequisites;
        }
    }

    public static class CourseUploadSummary {
        
        private final int savedCount;
        private final List<InvalidCourse> invalidCourses;
        private final List<AdjustedCourse> adjustedCourses;

        public CourseUploadSummary(int savedCount, List<InvalidCourse> invalidCourses, List<AdjustedCourse> adjustedCourses) {
            this.savedCount = savedCount;
            this.invalidCourses = invalidCourses;
            this.adjustedCourses = adjustedCourses;
        }

        public int getSavedCount() {
            return savedCount;
        }

        public List<InvalidCourse> getInvalidCourses() {
            return invalidCourses;
        }

        public List<AdjustedCourse> getAdjustedCourses() {
            return adjustedCourses;
        }
    }

    public CourseUploadSummary process(MultipartFile file) {
        try {
            List<Course> courses = readCoursesFromExcel(file.getInputStream());
            CourseUploadSummary summary = validateAndSaveCourses(courses);
            System.out.println("Finished processing courses Excel file");
            return summary;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to process courses file");
        }
    }

    public List<Course> readCoursesFromExcel(InputStream inputStream) {
        List<Course> courses = new ArrayList<>();
        DataFormatter formatter = new DataFormatter();

        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row, formatter)) continue;

                String courseCode = formatter.formatCellValue(row.getCell(0)).trim();
                String courseName = formatter.formatCellValue(row.getCell(1)).trim();
                String prerequisiteCourseNumber = formatter.formatCellValue(row.getCell(2)).trim();

                int lectureHours = parseIntCell(row.getCell(3), formatter);
                int tutorialHours = parseIntCell(row.getCell(4), formatter);
                int labHours = parseIntCell(row.getCell(5), formatter);
                int projectHours = parseIntCell(row.getCell(6), formatter);
                
                float credits = 0;
                String creditStr = formatter.formatCellValue(row.getCell(7)).trim();
                if (!creditStr.isEmpty()) {
                    credits = Float.parseFloat(creditStr);
                }

                String clusterName = formatter.formatCellValue(row.getCell(8)).trim();

                Course course = new Course(
                        0,
                        courseCode,
                        courseName,
                        prerequisiteCourseNumber,
                        lectureHours,
                        tutorialHours,
                        labHours,
                        projectHours,
                        credits,
                        clusterName
                );

                courses.add(course);
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to read courses from Excel file");
        }

        return courses;
    }

    private boolean isRowEmpty(Row row, DataFormatter formatter) {
        for (int cellIndex = 0; cellIndex <= 8; cellIndex++) {
            String cellValue = formatter.formatCellValue(row.getCell(cellIndex)).trim();
            if (!cellValue.isEmpty()) {
                return false;
            }
        }
        return true;
    }

    private int parseIntCell(Cell cell, DataFormatter formatter) {
        if (cell == null) return 0;

        String value = formatter.formatCellValue(cell).trim();
        if (value.isEmpty()) return 0;

        try {
            return (int) Double.parseDouble(value);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid numeric value in Excel cell: " + value);
        }
    }

    private List<String> parsePrerequisiteIds(String prerequisiteText) {
        List<String> ids = new ArrayList<>();

        if (prerequisiteText == null || prerequisiteText.trim().isEmpty()) {
            return ids;
        }

        String[] parts = prerequisiteText.split(",");

        for (String part : parts) {
            String trimmed = part.trim();
            if (!trimmed.isEmpty()) {
                ids.add(trimmed);
            }
        }

        return ids;
    }

    private String buildPrerequisiteText(List<String> prerequisiteIds) {
        return String.join(", ", prerequisiteIds);
    }

    // Invalid course ID -> do not save the course.
    // Invalid/non-existing prerequisite -> remove it, save the course, and report it in the summary.
    public CourseUploadSummary validateAndSaveCourses(List<Course> courses) throws Exception {
        // רשימה אחת מסודרת שתכיל רק את השגיאות ותישלח לפרונט
        List<InvalidCourse> invalidCourseDetails = new ArrayList<>();
        List<Course> validCourses = new ArrayList<>();
        Set<String> validCourseIds = new HashSet<>();

        Map<String, Integer> validClustersMap = new HashMap<>();
        
        try {
            List<Cluster> clustersInDb = clusterService.getAllClusters();
            for (Cluster c : clustersInDb) {
                if (c.getName() != null) {
                    validClustersMap.put(c.getName().trim(), c.getNumber());
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch valid clusters for validation");
        }
        
        for (Course course : courses) {
            String courseId = course.getCourseId() == null ? "" : course.getCourseId().trim();
            String clusterName = course.getClusterName() == null ? "" : course.getClusterName().trim();

            if (!courseId.matches(COURSE_ID_PATTERN)) {
                invalidCourseDetails.add(new InvalidCourse(courseId, course.getCourseName(), "Invalid course code"));
                
            } else if (clusterName.isEmpty() || !validClustersMap.containsKey(clusterName)) {
                invalidCourseDetails.add(new InvalidCourse(courseId, course.getCourseName(), "Cluster name does not exist: " + clusterName));
            
            } else {
                course.setCourseId(courseId);
                course.setCluster(validClustersMap.get(clusterName));
                validCourses.add(course);
                validCourseIds.add(courseId);
            }
        }

        List<AdjustedCourse> adjustedCourses = new ArrayList<>();

        for (Course course : validCourses) {
            List<String> prerequisiteIds = parsePrerequisiteIds(course.getPrerequisiteCourseNumber());
            List<String> validPrerequisites = new ArrayList<>();
            List<String> removedPrerequisites = new ArrayList<>();

            for (String prerequisiteId : prerequisiteIds) {
                if (prerequisiteId.matches(COURSE_ID_PATTERN) && validCourseIds.contains(prerequisiteId)) {
                    validPrerequisites.add(prerequisiteId);
                } else {
                    removedPrerequisites.add(prerequisiteId);
                }
            }

            course.setPrerequisiteCourseNumber(buildPrerequisiteText(validPrerequisites));

            if (!removedPrerequisites.isEmpty()) {
                adjustedCourses.add(new AdjustedCourse(
                        course.getCourseId(),
                        course.getCourseName() == null ? "" : course.getCourseName(),
                        removedPrerequisites
                ));
            }
        }

        courseService.saveCourseToFirebase(validCourses);

        // הדפסה ללוג (שרת) של השגיאות
        if (!invalidCourseDetails.isEmpty()) {
            System.out.println("Invalid courses found:");
            for (InvalidCourse invalidCourse : invalidCourseDetails) {
                System.out.println("- " + invalidCourse.getCourseId() + ": " + invalidCourse.getCourseName() + " (Reason: " + invalidCourse.getReason() + ")");
            }
        }

        if (!adjustedCourses.isEmpty()) {
            System.out.println("Courses saved after removing invalid/non-existing prerequisites:");
            for (AdjustedCourse adjustedCourse : adjustedCourses) {
                System.out.println("- " + adjustedCourse.getCourseId() + ": " + adjustedCourse.getCourseName()
                        + " | removed prerequisites: " + adjustedCourse.getRemovedPrerequisites());
            }
        }

        return new CourseUploadSummary(validCourses.size(), invalidCourseDetails, adjustedCourses);
    }

    public byte[] exportCoursesToExcel() {
        Firestore db = FirestoreClient.getFirestore();

        try {
            List<QueryDocumentSnapshot> documents =
                    db.collection("courses").get().get().getDocuments();

            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Courses");

            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Course Code");
            header.createCell(1).setCellValue("Course Name");
            header.createCell(2).setCellValue("Prerequisites / Conditions");
            header.createCell(3).setCellValue("Lecture Hours");
            header.createCell(4).setCellValue("Tutorial Hours");
            header.createCell(5).setCellValue("Lab Hours");
            header.createCell(6).setCellValue("Project Hours");
            header.createCell(7).setCellValue("Credits");
            header.createCell(8).setCellValue("Cluster Name");

            int rowIndex = 1;

            for (QueryDocumentSnapshot doc : documents) {
                Map<String, Object> data = doc.getData();

                Row row = sheet.createRow(rowIndex++);

                row.createCell(0).setCellValue(doc.getId());
                row.createCell(1).setCellValue(asString(data.get("courseName")));
                row.createCell(2).setCellValue(asString(data.get("prerequisiteCourseNumber")));
                row.createCell(3).setCellValue(asDouble(data.get("lectureHours")));
                row.createCell(4).setCellValue(asDouble(data.get("tutorialHours")));
                row.createCell(5).setCellValue(asDouble(data.get("labHours")));
                row.createCell(6).setCellValue(asDouble(data.get("projectHours")));
                row.createCell(7).setCellValue(asDouble(data.get("credits")));
                row.createCell(8).setCellValue(asString(data.get("clusterName")));
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            workbook.close();

            return out.toByteArray();
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Failed to export courses", e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to export courses", e);
        }
    }

    private String asString(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private double asDouble(Object value) {
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }

        if (value == null) {
            return 0;
        }

        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}