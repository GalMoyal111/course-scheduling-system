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
import com.coursescheduling.server.model.ClassroomSizeSettings;
import com.coursescheduling.server.service.ClassroomSizeSettingsService;

import java.util.List;
import java.util.Map;

import org.checkerframework.checker.units.qual.A;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import com.coursescheduling.server.model.Cluster;
import com.coursescheduling.server.service.ClusterService;

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
    
    
    @Autowired
    private ClusterService clusterService;

    @Autowired
    private ClassroomSizeSettingsService classroomSizeSettingsService;
    
    
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
    public ClassroomExcelService.ClassroomUploadSummary uploadRooms(@RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
        	throw new RuntimeException("File is empty!");
        }

        System.out.println("Received rooms file: " + file.getOriginalFilename());

        return classroomExcelService.process(file);
    }
    
    
    
    @GetMapping("/rooms/export")
    // Exports the rooms.
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
    // Adds the room.
    public String addRoom(@RequestBody Classroom classroom) {

    	classroomService.saveSingleClassroom(classroom);

        return "Classroom added successfully";
    }

    @GetMapping("/courses/export")
    // Exports the courses.
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

    @PostMapping("/courses/add")
    // Adds the course.
    public ResponseEntity<?> addCourse(@RequestBody Course course) {
        try {
            courseService.saveSingleCourse(course);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(500)
                    .body("Failed to add course");
        }
    }

    @GetMapping("/getAllCourses")
    // Returns the all courses.
    public List<Course> getAllCourses() throws Exception {

        return courseService.getAllCourses();
    }

    @DeleteMapping("/deleteCourses")
    // Deletes the courses.
    public void deleteCourses(@RequestBody List<CourseDeleteRequest> courses) throws Exception {

        courseService.deleteCourses(courses);
    }

    @PostMapping("/courses/update")
    // Updates the course.
    public void updateCourse(@RequestBody CourseUpdateRequest request) throws Exception {

        courseService.updateCourse(request.getOldCourse(), request.getNewCourse());
    }
    
    
    @PostMapping("/classrooms/delete")
    // Deletes the classrooms.
    public void deleteClassrooms(@RequestBody List<ClassroomDeleteRequest> classrooms) throws Exception {

        classroomService.deleteClassrooms(classrooms);
    }
    
    
    
    @GetMapping("/getAllClassrooms")
    // Returns the all classrooms.
    public List<Classroom> getAllClassrooms() throws Exception {

        return classroomService.getAllClassrooms();
    }
    
    
    @PostMapping("/classrooms/update")
    // Updates the classroom.
    public void updateClassroom(@RequestBody ClassroomUpdateRequest request) throws Exception {
        classroomService.updateClassroom(
                request.getOldClassroom(),
                request.getNewClassroom()
        );
    }
    
    @GetMapping("/getAlllessons")
    // Returns the all lessons.
    public List<Lesson> getAllLessons() {
        return lessonService.getAllLessons();
    }
    
    @PostMapping("/addSingleLesson")
    // Adds the lesson.
    public List<Lesson> addLesson(@RequestBody Lesson lesson) throws Exception {
    	System.out.println("test");
        return lessonService.addLesson(lesson);
    }
    
    @DeleteMapping("/deleteLessons")
    // Deletes the lessons.
    public void deleteLessons(@RequestBody List<Lesson> lessons) throws Exception {
        lessonService.deleteLessons(lessons);
    }
    
    
    @GetMapping("/getAllCoursesGrouped")
    // Returns the all courses grouped.
    public List<ClusterCoursesList> getAllCoursesGrouped() {
        return lessonService.getAllCoursesGroupedByCluster();
    }
    
    
    @GetMapping("/lessons/export")
    // Exports the lessons.
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
    // Returns the all lecturers.
    public List<Lecturer> getAllLecturers() throws Exception {
        return lecturerService.getAllLecturers();
    }

    @PostMapping("/addSingleLecturer")
    // Adds the lecturer.
    public Lecturer addLecturer(@RequestBody Lecturer lecturer) throws Exception {
    	return lecturerService.addLecturer(lecturer);
    }

    @PostMapping("/updateLecturer")
    // Updates the lecturer.
    public String updateLecturer(@RequestBody Lecturer lecturer) throws Exception {
        lecturerService.updateLecturer(lecturer);
        return "Lecturer updated successfully";
    }

    @DeleteMapping("/deleteLecturers")
    // Deletes the lecturers.
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
    // Exports the lecturers.
    public ResponseEntity<byte[]> exportLecturers() {

        try {
            // Call the service that generates the lecturers Excel file.
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

    
    @GetMapping("/getAllClusters")
    // Returns the all clusters.
    public List<Cluster> getAllClusters() throws Exception {
        return clusterService.getAllClusters();
    }

    @PostMapping("/addSingleCluster")
    // Adds the cluster.
    public Cluster addCluster(@RequestBody Cluster cluster) throws Exception {
        return clusterService.addCluster(cluster);
    }

    @PostMapping("/updateCluster")
    // Updates the cluster.
    public String updateCluster(@RequestBody Cluster cluster) throws Exception {
        clusterService.updateCluster(cluster);
        return "Cluster updated successfully";
    }

    @DeleteMapping("/deleteClusters")
    // Deletes the clusters.
    public void deleteClusters(@RequestBody List<Cluster> clusters) throws Exception {
        clusterService.deleteClusters(clusters);
    }
    
    
    @GetMapping("/rooms/template")
    // Exports the rooms template.
    public ResponseEntity<byte[]> exportRoomsTemplate() {
        try {
            byte[] excelData = classroomExcelService.exportClassroomsTemplate();

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=classrooms_template.xlsx")
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(excelData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to export classrooms template", e);
        }
    }

    @GetMapping("/courses/template")
    // Exports the courses template.
    public ResponseEntity<byte[]> exportCoursesTemplate() {
        try {
            byte[] excelData = coursesExcelService.exportCoursesTemplate();

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=courses_template.xlsx")
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(excelData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to export courses template", e);
        }
    }

    @GetMapping("/lessons/template")
    // Exports the lessons template.
    public ResponseEntity<byte[]> exportLessonsTemplate() {
        try {
            byte[] excelData = excelProcessingService.exportLessonsTemplate();

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=lessons_template.xlsx")
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(excelData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to export lessons template", e);
        }
    }

    @GetMapping("/lecturers/template")
    // Exports the lecturers template.
    public ResponseEntity<byte[]> exportLecturersTemplate() {
        try {
            byte[] excelData = lecturerExcelService.exportLecturersTemplate();

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=lecturers_template.xlsx")
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(excelData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to export lecturers template", e);
        }
    }
    
    @GetMapping("/settings/availability")
    // Returns the system availability.
    public List<Map<String, Integer>> getSystemAvailability() throws Exception {
        return clusterService.getSystemAvailability();
    }

    @PostMapping("/settings/availability")
    // Updates the system availability.
    public String updateSystemAvailability(@RequestBody List<Map<String, Integer>> blockedSlots) throws Exception {
        clusterService.updateSystemAvailability(blockedSlots);
        return "System availability updated successfully";
    }

    @GetMapping("/settings/classroom-sizes")
    // Returns the classroom size settings.
    public ClassroomSizeSettings getClassroomSizeSettings() throws Exception {
        return classroomSizeSettingsService.getClassroomSizeSettings();
    }

    @PostMapping("/settings/classroom-sizes")
    // Updates the classroom size settings.
    public String updateClassroomSizeSettings(@RequestBody ClassroomSizeSettings settings) throws Exception {
        classroomSizeSettingsService.updateClassroomSizeSettings(settings);
        return "Classroom size settings updated successfully";
    }
    
    @GetMapping("/lessons/upload-summary")
	public ResponseEntity<ExcelProcessingService.LessonUploadSummary> getLatestUploadSummary() {
	    ExcelProcessingService.LessonUploadSummary summary = lessonService.getLatestSummary();
	    
	    if (summary == null) {
	        return ResponseEntity.noContent().build();
	    }
	    
	    return ResponseEntity.ok(summary);
	}
    
    @GetMapping("/lecturers/upload-summary")
    public ResponseEntity<LecturerExcelService.LecturerUploadSummary>
    getLatestLecturerUploadSummary() {

        LecturerExcelService.LecturerUploadSummary summary =
                lecturerService.getLatestSummary();

        if (summary == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(summary);
    }
    
    @GetMapping("/rooms/upload-summary")
    public ResponseEntity<ClassroomExcelService.ClassroomUploadSummary>
    getLatestRoomUploadSummary() {

        ClassroomExcelService.ClassroomUploadSummary summary =
                classroomService.getLatestSummary();

        if (summary == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(summary);
    }
    
    @GetMapping("/courses/upload-summary")
    public ResponseEntity<CoursesExcelService.CourseUploadSummary>
    getLatestCourseUploadSummary() {

        CoursesExcelService.CourseUploadSummary summary =
                courseService.getLatestSummary();

        if (summary == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(summary);
    }
    
    
    
}
