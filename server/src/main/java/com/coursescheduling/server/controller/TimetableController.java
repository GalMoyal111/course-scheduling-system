package com.coursescheduling.server.controller;

import com.coursescheduling.server.model.Semester;
import com.coursescheduling.server.algorithm.TimetableAlgorithmService;
import com.coursescheduling.server.algorithm.model.ScheduledLessonDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;




@RestController
@RequestMapping("/api/timetable")
public class TimetableController {
	
	@Autowired
    private TimetableAlgorithmService algorithmService;

    @GetMapping("/generate")
    public List<ScheduledLessonDTO> generateTimetable() {
        return algorithmService.run(Semester.A);
    }
	

}
