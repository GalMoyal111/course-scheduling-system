package com.coursescheduling.server;

import com.coursescheduling.server.model.Classroom;
import com.coursescheduling.server.service.ClassroomExcelService;
import com.coursescheduling.server.service.ExcelProcessingService;

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

        classroomExcelService.saveSingleClassroom(classroom);

        return "Classroom added successfully";
    }
    
    
}