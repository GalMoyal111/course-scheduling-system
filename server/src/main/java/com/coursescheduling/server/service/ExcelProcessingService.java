package com.coursescheduling.server.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ExcelProcessingService {

	public void process(MultipartFile file) {
        System.out.println("Received file: " + file.getOriginalFilename());
    }
}
