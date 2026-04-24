package com.coursescheduling.server.controller;

import com.coursescheduling.server.model.GenerateTimetableRequest;
import com.coursescheduling.server.model.SaveTimetableRequest;
import com.coursescheduling.server.model.SavedTimetableMetadata;
import com.coursescheduling.server.model.Semester;
import com.coursescheduling.server.service.SavedTimetableService;
import com.coursescheduling.server.algorithm.TimetableAlgorithmService;
import com.coursescheduling.server.algorithm.model.ScheduledLessonDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;




@RestController
@RequestMapping("/api/timetable")
public class TimetableController {
	
	@Autowired
    private TimetableAlgorithmService algorithmService;
	
	@Autowired
    private SavedTimetableService savedTimetableService;

	@PostMapping("/generate")
    public List<ScheduledLessonDTO> generateTimetable(@RequestBody GenerateTimetableRequest request) {
        return algorithmService.run(request);
    }
	
	
	@PostMapping("/save")
    public SavedTimetableMetadata saveTimetable(@RequestBody SaveTimetableRequest request) throws Exception {
        return savedTimetableService.saveTimetable(request);
    }

    @GetMapping("/history")
    public List<SavedTimetableMetadata> getHistory() throws Exception {
        return savedTimetableService.getAllSavedMetadata();
    }

    @GetMapping("/history/{id}")
    public List<ScheduledLessonDTO> getSavedTimetable(@PathVariable String id) throws Exception {
        return savedTimetableService.getTimetableDataById(id);
    }

}
