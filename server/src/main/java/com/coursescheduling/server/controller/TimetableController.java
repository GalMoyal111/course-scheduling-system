package com.coursescheduling.server.controller;

import com.coursescheduling.server.model.GenerateTimetableRequest;
import com.coursescheduling.server.model.SaveTimetableRequest;
import com.coursescheduling.server.model.SavedTimetableMetadata;
import com.coursescheduling.server.service.SavedTimetableService;
import com.coursescheduling.server.algorithm.TimetableAlgorithmService;
import com.coursescheduling.server.algorithm.model.ScheduledLessonDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;




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

    @DeleteMapping("/history/{id}")
    public void deleteSavedTimetable(@PathVariable String id) throws Exception {
        savedTimetableService.deleteTimetable(id);
    }

    @PostMapping("/history/{id}/rename")
    public SavedTimetableMetadata renameSavedTimetable(@PathVariable String id, @RequestBody Map<String, String> body) throws Exception {
        String newName = body.getOrDefault("name", "");
        return savedTimetableService.updateTimetableName(id, newName);
    }

    @PostMapping("/history/{id}/remove-lesson")
    public SavedTimetableMetadata removeLessonFromSavedTimetable(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) throws Exception {
        String lessonId = body.get("lessonId");

        if (lessonId == null || lessonId.isBlank()) {
            throw new IllegalArgumentException("lessonId is required");
        }

        return savedTimetableService.removeLessonFromTimetable(id, lessonId);
    }
    
    
    @PostMapping("/export/current")
    public ResponseEntity<byte[]> exportCurrent(@RequestBody List<ScheduledLessonDTO> schedule) {
        try {
            byte[] excelContent = savedTimetableService.exportTimetableToExcel(schedule);
            return createExcelResponse(excelContent, "generated_schedule.xlsx");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/history/{id}/export")
    public ResponseEntity<byte[]> exportSaved(@PathVariable String id) {
        try {
            List<ScheduledLessonDTO> schedule = savedTimetableService.getTimetableDataById(id);
            
            if (schedule == null || schedule.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] excelContent = savedTimetableService.exportTimetableToExcel(schedule);
            return createExcelResponse(excelContent, "saved_schedule_" + id + ".xlsx");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    private ResponseEntity<byte[]> createExcelResponse(byte[] content, String fileName) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", fileName);
        return new ResponseEntity<>(content, headers, HttpStatus.OK);
    }
    
    

}
