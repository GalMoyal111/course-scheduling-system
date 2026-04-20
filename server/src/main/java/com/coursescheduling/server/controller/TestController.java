package com.coursescheduling.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.coursescheduling.server.algorithm.TimetableAlgorithmService;
import com.coursescheduling.server.model.Semester;

@RestController
@RequestMapping("/test")
public class TestController {
	
	// to run go to - http://localhost:8080/test/run

    @Autowired
    private TimetableAlgorithmService algorithmService;

//    @GetMapping("/run")
//    public String run() {
//        algorithmService.run(Semester.A);
//        return "Algorithm executed";
//    }
}