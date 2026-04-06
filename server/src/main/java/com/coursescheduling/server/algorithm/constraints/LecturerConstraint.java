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
	private static final int MAX_DAILY_FRAMES = 8;


	/*
    Checks if assigning the given value to the variable would exceed the consecutive frame limit for the lecturer.
     */
	public boolean isConsecutiveLimitExceeded(Variable var, DomainValue value, Map<Variable, AssignedValue> assignment) {
        
        // Get the lecturer and day from the variable and value
		String lecturer = var.getLecturer();
        int day = value.getDay();
        
        // Create a set to track occupied frames for the lecturer on the given day
        Set<Integer> occupiedFrames = new HashSet<>();

        // Iterate through the current assignment to find all frames occupied by the lecturer on the same day
        for (Map.Entry<Variable, AssignedValue> entry : assignment.entrySet()) {
            
        	Variable assignedVar = entry.getKey();
            AssignedValue assignedVal = entry.getValue();

            // Check if the assigned variable belongs to the same lecturer and is on the same day
            if (assignedVar.getLecturer().equals(lecturer) && assignedVal.getDay() == day) {
                for (int t = 0; t < assignedVar.getDuration(); t++) {
                    occupiedFrames.add(assignedVal.getStartFrame() + t);
                }
            }
        }

        // Add the frames for the new assignment being considered
        for (int t = 0; t < var.getDuration(); t++) {
            occupiedFrames.add(value.getStartFrame() + t);
        }

        return hasExceededLimit(occupiedFrames);
    }


    /* 
    Helper method to check if the set of occupied frames exceeds the maximum allowed consecutive frames.
    */
    private boolean hasExceededLimit(Set<Integer> frames) {
        
    	if (frames.isEmpty()) return false;

        int maxConsecutive = 0;
        int currentConsecutive = 0;

        // Check for consecutive frames from 1 to 12 (assuming frames are numbered 1 to 12)
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
    
    
    /*
    Checks if assigning the given value to the variable would exceed the daily frame limit for the lecturer.
    */
    public boolean isDailyLimitExceeded(Variable var, DomainValue value, Map<Variable, AssignedValue> assignment) {
        String lecturer = var.getLecturer();
        int day = value.getDay();
        int totalFrames = 0;

        // Iterate through the current assignment to sum up the total frames assigned to the lecturer on the same day
        for (Map.Entry<Variable, AssignedValue> entry : assignment.entrySet()) {
            Variable assignedVar = entry.getKey();
            AssignedValue assignedVal = entry.getValue();

            if (assignedVar.getLecturer().equals(lecturer) && assignedVal.getDay() == day) {
                totalFrames += assignedVar.getDuration();
            }
        }

        // Add the frames for the new assignment being considered
        totalFrames += var.getDuration();

        return totalFrames > MAX_DAILY_FRAMES;
    }
    
    
    

}
