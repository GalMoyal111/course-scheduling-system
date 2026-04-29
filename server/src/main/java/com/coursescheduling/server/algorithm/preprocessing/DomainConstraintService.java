package com.coursescheduling.server.algorithm.preprocessing;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.coursescheduling.server.algorithm.model.DomainValue;
import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.model.Classroom;
import com.coursescheduling.server.model.Lecturer;
import com.coursescheduling.server.model.LessonType;
import com.coursescheduling.server.model.RoomType;
import com.coursescheduling.server.service.LecturerService;

@Service
public class DomainConstraintService {
	
	@Autowired
    private LecturerService lecturerService;

	// This method applies lecturer-specific constraints and injects preferences
    public void applyLecturerConstraints(List<Variable> variables) {
        
        try {
            // 1. Fetch all lecturers ONCE from DB
            List<Lecturer> lecturers = lecturerService.getAllLecturers();
            
            // 2. Build a Map for O(1) quick lookup by Lecturer Name
            Map<String, Lecturer> lecturerMap = new HashMap<>();
            for (Lecturer l : lecturers) {
                if (l.getName() != null) {
                    lecturerMap.put(l.getName(), l);
                }
            }

            // 3. Iterate over all variables to apply constraints and inject preferences
            for (Variable v : variables) {
                Lecturer lecturer = lecturerMap.get(v.getLecturer());
                
                if (lecturer == null) continue;

                // Inject the non-preferred slots directly into the Variable for the CSP to use later
                if (lecturer.getNonPreferredSlots() != null) {
                    v.setNonPreferredSlots(lecturer.getNonPreferredSlots());
                }

                // Remove any domain values where the lesson's full duration overlaps with an unavailable slot
                List<DomainValue> unavailable = lecturer.getUnavailableSlots();
                
                if (unavailable != null && !unavailable.isEmpty()) {
                    List<DomainValue> values = v.getDomain().getValues();
                    values.removeIf(dv -> {
                        int lessonStart = dv.getStartFrame();
                        int lessonEnd = lessonStart + v.getDuration() - 1;

                        return unavailable.stream().anyMatch(slot ->
                            slot.getDay() == dv.getDay() &&
                            slot.getStartFrame() >= lessonStart && 
                            slot.getStartFrame() <= lessonEnd      
                        );
                    });
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error fetching lecturers for constraints: " + e.getMessage());
        }
    }

    

    
   
    
    // This method applies global constraints to the variables' domains, such as blocked time slots.
    public void applyGlobalConstraints(List<Variable> variables, List<DomainValue> blockedSlots) {

        for (Variable v : variables) {

            List<DomainValue> values = v.getDomain().getValues();

            values.removeIf(dv -> {
                int lessonStart = dv.getStartFrame();
                int lessonEnd = lessonStart + v.getDuration() - 1;

                return blockedSlots.stream().anyMatch(slot -> 
                    slot.getDay() == dv.getDay() &&
                    slot.getStartFrame() >= lessonStart &&
                    slot.getStartFrame() <= lessonEnd
                );
            });
            
            
        }
    }
    
    // This method applies duration constraints to the variables' domains, ensuring that the scheduled time slots can accommodate the lesson duration.
    public void applyDurationConstraints(List<Variable> variables) {

        for (Variable v : variables) {

            int duration = v.getDuration();

            List<DomainValue> values = v.getDomain().getValues();

            // Remove any domain values that cannot accommodate the lesson duration
            values.removeIf(dv -> {
                int day = dv.getDay();
                int start = dv.getStartFrame();

                int maxFrame = (day == 6) ? 4 : 12;

                return start + duration - 1 > maxFrame;
            });
        }
    }
    
  
    
}
