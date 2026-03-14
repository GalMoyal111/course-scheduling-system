package com.coursescheduling.server.service;

import com.coursescheduling.server.model.Course;
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


// import org.springframework.web.multipart.MultipartFile;

@Service
public class CoursesExcelService {


    public void process(MultipartFile file) {
        // Implement logic to process the courses Excel file, read data, and save it to the database
        try {
            InputStream inputStream = file.getInputStream();
            List<Course> courses = readCoursesFromExcel(inputStream);
            saveCoursesToDatabase(courses);
            System.out.println("Finished processing courses Excel file");

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
            if (row == null) continue;

            String semesterNumber = formatter.formatCellValue(row.getCell(0)).trim();
            String courseCode = formatter.formatCellValue(row.getCell(1)).trim();
            String courseName = formatter.formatCellValue(row.getCell(2)).trim();
            String prerequisiteCourseNumberOrConditions = formatter.formatCellValue(row.getCell(3)).trim();

            int lectureHours = parseIntCell(row.getCell(4), formatter);
            int tutorialHours = parseIntCell(row.getCell(5), formatter);
            int labHours = parseIntCell(row.getCell(6), formatter);
            int projectHours = parseIntCell(row.getCell(7), formatter);
            int credits = parseIntCell(row.getCell(8), formatter);

            String notes = formatter.formatCellValue(row.getCell(9)).trim();

            Course course = new Course(
                    semesterNumber,
                    courseCode,
                    courseName,
                    prerequisiteCourseNumberOrConditions,
                    lectureHours,
                    tutorialHours,
                    labHours,
                    projectHours,
                    credits,
                    notes
            );

            courses.add(course);
        }
    } catch (Exception e) {
        e.printStackTrace();
        throw new RuntimeException("Failed to read courses from Excel file");
    }

    return courses;
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

    // public List<Course> readCoursesFromExcel(InputStream inputStream) {
    //     List<Course> courses = new ArrayList<>();
    //     try (Workbook workbook = new XSSFWorkbook(inputStream)) {
    //         Sheet sheet = workbook.getSheetAt(0);

    //         for (int i = 1; i <= sheet.getLastRowNum(); i++) {
    //             Row row = sheet.getRow(i);
    //             if (row == null) continue;

    //             String semesterNumber = String.valueOf((int) row.getCell(0).getNumericCellValue());
    //             String courseCode = row.getCell(1).getStringCellValue();
    //             String courseName = row.getCell(2).getStringCellValue();
    //             String prerequisiteCourseNumberOrConditions = row.getCell(3).getStringCellValue();
    //             int lectureHours = (int) row.getCell(4).getNumericCellValue();
    //             int tutorialHours = (int) row.getCell(5).getNumericCellValue();
    //             int labHours = (int) row.getCell(6).getNumericCellValue();
    //             int projectHours = (int) row.getCell(7).getNumericCellValue();
    //             int credits = (int) row.getCell(8).getNumericCellValue();
    //             String notes = row.getCell(9).getStringCellValue();

    //             Course course = new Course(semesterNumber, courseCode, courseName, prerequisiteCourseNumberOrConditions,
    //                     lectureHours, tutorialHours, labHours, projectHours, credits, notes);

    //             courses.add(course);
    //         }
    //     } catch (Exception e) {
    //         e.printStackTrace();
    //         throw new RuntimeException("Failed to read courses from Excel file");
    //     }

    //     return courses;
    // }

    public void saveCoursesToDatabase(List<Course> courses) {
        // Implement logic to save the list of courses to the database (e.g., Firestore)
        Firestore db = FirestoreClient.getFirestore();
        for (Course course : courses) {
            Map<String, Object> data = new HashMap<>();
            data.put("courseName", course.getCourseName());
            data.put("prerequisiteCourseNumberOrConditions", course.getPrerequisiteCourseNumberOrConditions());
            data.put("lectureHours", course.getLectureHours());
            data.put("tutorialHours", course.getTutorialHours());
            data.put("labHours", course.getLabHours());
            data.put("projectHours", course.getProjectHours());
            data.put("credits", course.getCredits());
            data.put("notes", course.getNotes());

            // db.collection("courses").document(course.getCourseCode()).set(data, SetOptions.merge());
            db.collection("courses").document(course.getSemesterNumber()).set(Map.of(course.getCourseCode(), data), SetOptions.merge());
        }
    }

    public byte[] exportCoursesToExcel() {
        // Implement logic to export courses from the database to an Excel file and return it as a byte array
        return null; // Placeholder return statement
    }

    public void printCourses(List<Course> courses) {
        // Implement logic to print the list of courses for debugging purposes
        for (Course course : courses) {
            System.out.println("Course Code: " + course.getCourseCode());
            System.out.println("Course Name: " + course.getCourseName());
            System.out.println("Prerequisites: " + course.getPrerequisiteCourseNumberOrConditions());
            System.out.println("Lecture Hours: " + course.getLectureHours());
            System.out.println("Tutorial Hours: " + course.getTutorialHours());
            System.out.println("Lab Hours: " + course.getLabHours());
            System.out.println("Project Hours: " + course.getProjectHours());
            System.out.println("Credits: " + course.getCredits());
            System.out.println("Notes: " + course.getNotes());
            System.out.println("-----------------------------------");
        }

    }

    public void saveSingleCourseToDatabase(Course course) {
        // Implement logic to save a single course to the database
    }
}
