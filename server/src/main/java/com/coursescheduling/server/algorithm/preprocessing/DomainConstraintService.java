package com.coursescheduling.server.algorithm.preprocessing;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.coursescheduling.server.algorithm.model.DomainValue;
import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.model.Classroom;
import com.coursescheduling.server.model.LessonType;
import com.coursescheduling.server.model.RoomType;

@Service
public class DomainConstraintService {

    // This method applies lecturer-specific constraints to the variables' domains.
    public void applyLecturerConstraints(List<Variable> variables) {
        Map<String, List<DomainValue>> constraints = getLecturerConstraints();

        for (Variable v : variables) {

            List<DomainValue> unavailable = constraints.get(v.getLecturer());

            if (unavailable == null)
                continue;

            List<DomainValue> values = v.getDomain().getValues();

            // Remove any domain values where the lesson's full duration overlaps with an unavailable slot
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

    
    // This method defines constraints for specific lecturers
    private Map<String, List<DomainValue>> getLecturerConstraints() {
        Map<String, List<DomainValue>> map = new HashMap<>();

        // Example constraints for lecturers (these should be based on real data)
        map.put("משה", List.of(
                new DomainValue(1, 3),
                new DomainValue(2, 5)
        ));
        
        map.put("איתי", List.of(
                new DomainValue(1, 9)

        ));

        return map;
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
