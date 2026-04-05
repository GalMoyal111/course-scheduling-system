package com.coursescheduling.server.algorithm.constraints;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.DomainValue;
import com.coursescheduling.server.algorithm.model.Variable;

@Component
public class LecturerConstraint {
	private static final int MAX_CONSECUTIVE_FRAMES = 6;
	
	public boolean isConsecutiveLimitExceeded(Variable var, DomainValue value, Map<Variable, AssignedValue> assignment) {
        
		String lecturer = var.getLecturer();
        int day = value.getDay();
        
        Set<Integer> occupiedFrames = new HashSet<>();

        for (Map.Entry<Variable, AssignedValue> entry : assignment.entrySet()) {
            
        	Variable assignedVar = entry.getKey();
            AssignedValue assignedVal = entry.getValue();

            if (assignedVar.getLecturer().equals(lecturer) && assignedVal.getDay() == day) {
                for (int t = 0; t < assignedVar.getDuration(); t++) {
                    occupiedFrames.add(assignedVal.getStartFrame() + t);
                }
            }
        }

        for (int t = 0; t < var.getDuration(); t++) {
            occupiedFrames.add(value.getStartFrame() + t);
        }

        return hasExceededLimit(occupiedFrames);
    }

    private boolean hasExceededLimit(Set<Integer> frames) {
        
    	if (frames.isEmpty()) return false;

        int maxConsecutive = 0;
        int currentConsecutive = 0;

        for (int i = 1; i <= 12; i++) { 
            if (frames.contains(i)) {
                currentConsecutive++;
                maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
            } else {
                currentConsecutive = 0;
            }
        }

        return maxConsecutive > MAX_CONSECUTIVE_FRAMES;
    }
    
    
    

}
