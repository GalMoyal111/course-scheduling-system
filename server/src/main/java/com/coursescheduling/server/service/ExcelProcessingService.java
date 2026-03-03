package com.coursescheduling.server.service;
import java.util.HashMap; 
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;

@Service 
public class ExcelProcessingService {
	public void process(MultipartFile file) { 
		System.out.println("Received file: " + file.getOriginalFilename());
		process();
	}
	
	
	private final Firestore firestore;
	
	public ExcelProcessingService(Firestore firestore) { 
		this.firestore = firestore; 
	}
	
	public void process() {
		try { 
			Map<String, Object> course = new HashMap<>();
			course.put("name", "Algorithms"); 
			course.put("lecturer", "Dr. Cohen"); 
			course.put("hours", 16);
			
			DocumentReference docRef = firestore
				.collection("courses")
				.document("course1");
			
			docRef.set(course);
			
			System.out.println("Course saved to Firestore!");
			
		}catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	
}