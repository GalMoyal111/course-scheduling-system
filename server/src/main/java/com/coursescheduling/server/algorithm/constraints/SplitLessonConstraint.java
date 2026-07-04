package com.coursescheduling.server.algorithm.constraints;

import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.DomainValue;
import com.coursescheduling.server.algorithm.model.Variable;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Map;


@Component
public class SplitLessonConstraint {
	
	

	// Checks whether split part already scheduled today.
	public boolean isSplitPartAlreadyScheduledToday(Variable var, DomainValue value, Map<Variable, AssignedValue> assignment) {
	    String currentSplitId = var.getSplitGroupId();
	    boolean isEnglish = var.isEnglishCourse();

	    // 1. Updated ID guard: stop only when this is neither a regular split nor an English course.
	    if ((currentSplitId == null || currentSplitId.isEmpty()) && !isEnglish) {
	        return false;
	    }

	    for (Map.Entry<Variable, AssignedValue> entry : assignment.entrySet()) {
	        Variable assignedVar = entry.getKey();
	        AssignedValue assignedVal = entry.getValue();

	        // 2. Partner detection: same splitGroupId, or an English course with the same ID.
	        boolean isPartner = (currentSplitId != null && !currentSplitId.isEmpty() && currentSplitId.equals(assignedVar.getSplitGroupId())) ||
	                            (isEnglish && assignedVar.isEnglishCourse() && var.getCourseId().equals(assignedVar.getCourseId()));

	        if (isPartner) {
	            int dayA = value.getDay();
	            int dayB = assignedVal.getDay();

	            // --- English course rule ---
	            if (isEnglish) {
	                // If at least one part is on Friday.
	                if (dayA == 6 || dayB == 6) {
	                    // They must be on the same day (both Friday) and consecutive.
	                    boolean consecutive = (dayA == dayB) && (
	                        (value.getStartFrame() == assignedVal.getStartFrame() + assignedVar.getDuration()) ||
	                        (value.getStartFrame() + var.getDuration() == assignedVal.getStartFrame())
	                    );
	                    
	                    if (!consecutive) return true; // Conflict: different days or non-consecutive slots.
	                } 
	                // If both are on weekdays (1-5).
	                else if (dayA == dayB) {
	                    return true; // Conflict: weekday English sessions must be on separate days.
	                }
	            } 
	            
	            // --- Regular split-course rule (not English) ---
	            else {
	                if (dayA == dayB) return true; // Conflict: parts must be on separate days.
	            }
	        }
	    }
	    return false;
	}
	
}
