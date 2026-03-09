package com.coursescheduling.server;

import com.coursescheduling.server.service.ExcelProcessingService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

// Controller to handle file uploads from the frontend. It receives the uploaded Excel file and delegates processing to the ExcelProcessingService.
@RestController
@RequestMapping("/api")
public class FileUploadController {
    // Inject the ExcelProcessingService to handle the logic of processing the uploaded Excel file.
    private final ExcelProcessingService excelProcessingService;

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
}