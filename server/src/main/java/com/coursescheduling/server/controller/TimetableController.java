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
    // Handles the generate timetable logic.
    public List<ScheduledLessonDTO> generateTimetable(@RequestBody GenerateTimetableRequest request) {
        return algorithmService.run(request);
    }
	
	
	@PostMapping("/save")
    // Saves the timetable.
    public SavedTimetableMetadata saveTimetable(@RequestBody SaveTimetableRequest request) throws Exception {
        return savedTimetableService.saveTimetable(request);
    }

    @GetMapping("/history")
    // Returns the history.
    public List<SavedTimetableMetadata> getHistory() throws Exception {
        return savedTimetableService.getAllSavedMetadata();
    }

    @GetMapping("/history/{id}")
    // Returns the saved timetable.
    public List<ScheduledLessonDTO> getSavedTimetable(@PathVariable String id) throws Exception {
        return savedTimetableService.getTimetableDataById(id);
    }

    @DeleteMapping("/history/{id}")
    // Deletes the saved timetable.
    public void deleteSavedTimetable(@PathVariable String id) throws Exception {
        savedTimetableService.deleteTimetable(id);
    }

    @PostMapping("/history/{id}/rename")
    // Handles the rename saved timetable logic.
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
    // Exports the current.
    public ResponseEntity<byte[]> exportCurrent(@RequestBody List<ScheduledLessonDTO> schedule) {
        try {
            byte[] excelContent = savedTimetableService.exportTimetableToExcel(schedule);
            return createExcelResponse(excelContent, "generated_schedule.xlsx");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/history/{id}/export")
    // Exports the saved.
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


    // Creates the excel response.
    private ResponseEntity<byte[]> createExcelResponse(byte[] content, String fileName) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", fileName);
        return new ResponseEntity<>(content, headers, HttpStatus.OK);
    }
    
    @PostMapping("/cancel")
	// Cancels the generation action.
	public ResponseEntity<String> cancelGeneration() {
	    algorithmService.cancelAlgorithm();
	    return ResponseEntity.ok("Algorithm cancelled successfully");
	}
    

}
