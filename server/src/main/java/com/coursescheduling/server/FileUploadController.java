package com.coursescheduling.server;

import com.coursescheduling.server.service.ExcelProcessingService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class FileUploadController {

    private final ExcelProcessingService excelProcessingService;

    public FileUploadController(ExcelProcessingService excelProcessingService) {
        this.excelProcessingService = excelProcessingService;
    }

    @PostMapping("/upload")
    public String uploadFile(@RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return "File is empty!";
        }

        excelProcessingService.process(file);

        return "File uploaded successfully!";
    }
}