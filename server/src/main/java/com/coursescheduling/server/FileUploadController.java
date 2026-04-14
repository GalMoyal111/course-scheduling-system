package com.coursescheduling.server;

import com.coursescheduling.server.model.Course;
import com.coursescheduling.server.model.Lesson;
import com.coursescheduling.server.model.Classroom;
import com.coursescheduling.server.service.ClassroomExcelService;
import com.coursescheduling.server.service.CoursesExcelService;
import com.coursescheduling.server.service.ExcelProcessingService;
import com.coursescheduling.server.service.LecturerExcelService;
import com.coursescheduling.server.service.LecturerService;
import com.coursescheduling.server.service.LessonService;
import com.coursescheduling.server.model.ClassroomDeleteRequest;
import com.coursescheduling.server.model.ClassroomUpdateRequest;
import com.coursescheduling.server.model.CourseDeleteRequest;
import com.coursescheduling.server.model.CourseUpdateRequest;
import com.coursescheduling.server.model.Lecturer;
import com.coursescheduling.server.model.ClusterCoursesList;
import com.coursescheduling.server.service.ClassroomService;
import com.coursescheduling.server.service.CourseService;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

// Controller to handle file uploads from the frontend. It receives the uploaded Excel file and delegates processing to the ExcelProcessingService.
@RestController
@RequestMapping("/api")
public class FileUploadController {
    
	@Autowired
    private ExcelProcessingService excelProcessingService;

    @Autowired
    private ClassroomExcelService classroomExcelService;

    @Autowired
    private CoursesExcelService coursesExcelService;

    @Autowired
    private CourseService courseService;
    
    @Autowired
    private ClassroomService classroomService;
    
    @Autowired
    private LessonService lessonService;
    
    @Autowired
    private LecturerService lecturerService;
    
    
    @Autowired
    private LecturerExcelService lecturerExcelService;
    
    
    // @Autowired
    // private ClusterCoursesList clusterCoursesList;
    

    // Constructor-based dependency injection of the ExcelProcessingService.
    public FileUploadController(ExcelProcessingService excelProcessingService) {
        this.excelProcessingService = excelProcessingService;
    }
    // Endpoint to handle POST requests for file uploads. It expects a multipart form-data request with a file parameter named "file".
    @PostMapping("/upload")
    public ExcelProcessingService.LessonUploadSummary uploadFile(@RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty!");
        }

        return excelProcessingService.process(file);
    }
    
    @PostMapping("/courses/upload")
    public CoursesExcelService.CourseUploadSummary uploadCourses(@RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty!");
        }

        System.out.println("Received courses file: " + file.getOriginalFilename());

        return coursesExcelService.process(file);
    }
    
    @PostMapping("/rooms/upload")
    public String uploadRooms(@RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return "File is empty!";
        }

        System.out.println("Received rooms file: " + file.getOriginalFilename());

        classroomExcelService.process(file);

        return "Rooms uploaded successfully";
    }
    
    
    
    @GetMapping("/rooms/export")
    public ResponseEntity<byte[]> exportRooms() {

        try {

            byte[] excelData = classroomExcelService.exportClassroomsToExcel();

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=classrooms.xlsx")
                    .header("Content-Type",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(excelData);

        } catch (Exception e) {
            throw new RuntimeException("Failed to export classrooms", e);
        }
    }
    
    
    @PostMapping("/rooms")
    public String addRoom(@RequestBody Classroom classroom) {

    	classroomService.saveSingleClassroom(classroom);

        return "Classroom added successfully";
    }

    @GetMapping("/courses/export")
    public ResponseEntity<byte[]> exportCourses() {

        try {

            byte[] excelData = coursesExcelService.exportCoursesToExcel();

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=courses.xlsx")
                    .header("Content-Type",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(excelData);

        } catch (Exception e) {
            throw new RuntimeException("Failed to export courses", e);
        }
    }

    @PostMapping("/courses")
    public String addCourse(@RequestBody Course course) {

        courseService.saveSingleCourse(course);

        return "Course added successfully";
    }

    @GetMapping("/getAllCourses")
    public List<Course> getAllCourses() throws Exception {

        return courseService.getAllCourses();
    }

    @DeleteMapping("/deleteCourses")
    public void deleteCourses(@RequestBody List<CourseDeleteRequest> courses) throws Exception {

        courseService.deleteCourses(courses);
    }

    @PostMapping("/courses/update")
    public void updateCourse(@RequestBody CourseUpdateRequest request) throws Exception {

        courseService.updateCourse(request.getOldCourse(), request.getNewCourse());
    }
    
    
    @PostMapping("/classrooms/delete")
    public void deleteClassrooms(@RequestBody List<ClassroomDeleteRequest> classrooms) throws Exception {

        classroomService.deleteClassrooms(classrooms);
    }
    
    
    
    @GetMapping("/getAllClassrooms")
    public List<Classroom> getAllClassrooms() throws Exception {

        return classroomService.getAllClassrooms();
    }
    
    
    @PostMapping("/classrooms/update")
    public void updateClassroom(@RequestBody ClassroomUpdateRequest request) throws Exception {
        classroomService.updateClassroom(
                request.getOldClassroom(),
                request.getNewClassroom()
        );
    }
    
    @GetMapping("/getAlllessons")
    public List<Lesson> getAllLessons() {
        return lessonService.getAllLessons();
    }
    
    @PostMapping("/addSingleLesson")
    public void addLesson(@RequestBody Lesson lesson) throws Exception {
    	System.out.println("test");
        lessonService.addLesson(lesson);
    }
    
    @DeleteMapping("/deleteLessons")
    public void deleteLessons(@RequestBody List<Lesson> lessons) throws Exception {
        lessonService.deleteLessons(lessons);
    }
    
    
    @GetMapping("/getAllCoursesGrouped")
    public List<ClusterCoursesList> getAllCoursesGrouped() {
        return lessonService.getAllCoursesGroupedByCluster();
    }
    
    
    @GetMapping("/lessons/export")
    public ResponseEntity<byte[]> exportLessons() {

        try {

            byte[] excelData = lessonService.exportLessonsToExcel();

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=lessons.xlsx")
                    .header("Content-Type",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(excelData);

        } catch (Exception e) {
            throw new RuntimeException("Failed to export lessons", e);
        }
    }
    
    @GetMapping("/getAllLecturers")
    public List<Lecturer> getAllLecturers() throws Exception {
        return lecturerService.getAllLecturers();
    }

    @PostMapping("/addSingleLecturer")
    public Lecturer addLecturer(@RequestBody Lecturer lecturer) throws Exception {
    	return lecturerService.addLecturer(lecturer);
    }

    @PostMapping("/updateLecturer")
    public String updateLecturer(@RequestBody Lecturer lecturer) throws Exception {
        lecturerService.updateLecturer(lecturer);
        return "Lecturer updated successfully";
    }

    @DeleteMapping("/deleteLecturers")
    public void deleteLecturers(@RequestBody List<Lecturer> lecturers) throws Exception {
        lecturerService.deleteLecturers(lecturers);
    }
    
    
    @PostMapping("/lecturers/upload")
    public LecturerExcelService.LecturerUploadSummary uploadLecturers(@RequestParam("file") MultipartFile file) {
    	if (file.isEmpty()) {
            throw new RuntimeException("File is empty!");
        }
        System.out.println("Received lecturers file: " + file.getOriginalFilename());
        return lecturerExcelService.process(file);      
    }

    @GetMapping("/lecturers/export")
    public ResponseEntity<byte[]> exportLecturers() {

        try {
            // כאן קוראים לסרוויס שיודע לייצר את קובץ האקסל של המרצים
            byte[] excelData = lecturerExcelService.exportLecturersToExcel();

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=lecturers.xlsx")
                    .header("Content-Type",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(excelData);

        } catch (Exception e) {
            throw new RuntimeException("Failed to export lecturers", e);
        }
    }

    
}