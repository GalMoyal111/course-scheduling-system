package com.coursescheduling.server;

import com.coursescheduling.server.model.Course;
import com.coursescheduling.server.model.Lesson;
import com.coursescheduling.server.model.Classroom;
import com.coursescheduling.server.service.ClassroomExcelService;
import com.coursescheduling.server.service.CoursesExcelService;
import com.coursescheduling.server.service.ExcelProcessingService;
import com.coursescheduling.server.service.LessonService;
import com.coursescheduling.server.model.ClassroomDeleteRequest;
import com.coursescheduling.server.model.ClassroomUpdateRequest;
import com.coursescheduling.server.model.CourseDeleteRequest;
import com.coursescheduling.server.model.CourseUpdateRequest;
import com.coursescheduling.server.model.ClusterCoursesList;
import com.coursescheduling.server.model.ClassroomDeleteRequest;
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
    
    // @Autowired
    // private ClusterCoursesList clusterCoursesList;
    

    // Constructor-based dependency injection of the ExcelProcessingService.
    public FileUploadController(ExcelProcessingService excelProcessingService) {
        this.excelProcessingService = excelProcessingService;
    }
    // Endpoint to handle POST requests for file uploads. It expects a multipart form-data request with a file parameter named "file".
    @PostMapping("/upload")
    public String uploadFile(@RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return "File is empty!";
        }

        excelProcessingService.process(file);

        return "File uploaded successfully!";
    }
    
    @PostMapping("/courses/upload")
    public String uploadCourses(@RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return "File is empty!";
        }

        System.out.println("Received courses file: " + file.getOriginalFilename());

        coursesExcelService.process(file);

        return "Courses uploaded successfully";
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
    
    @PostMapping("/addSingelLesson")
    public void addLesson(@RequestBody Lesson lesson) throws Exception {
        lessonService.addLesson(lesson);
    }
    
    @DeleteMapping("/deleteLessons")
    public void deleteLessons(@RequestBody List<Lesson> lessons) throws Exception {
        lessonService.deleteLessons(lessons);
    }
    
    //delete comment
    // @GetMapping("/getAllCoursesGrouped")
    // public List<ClusterCoursesList> getAllCoursesGrouped() {
    //     return clusterCoursesList.getAllCoursesGroupedByCluster();
    // }
    
}