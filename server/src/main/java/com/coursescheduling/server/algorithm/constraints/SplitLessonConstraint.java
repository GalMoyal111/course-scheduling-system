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
	
	

	public boolean isSplitPartAlreadyScheduledToday(Variable var, DomainValue value, Map<Variable, AssignedValue> assignment) {
	    String currentSplitId = var.getSplitGroupId();
	    boolean isEnglish = var.isEnglishCourse();

	    // 1. מחסום ה-ID המעודכן: עוצרים רק אם זה לא פיצול רגיל וגם לא אנגלית
	    if ((currentSplitId == null || currentSplitId.isEmpty()) && !isEnglish) {
	        return false;
	    }

	    for (Map.Entry<Variable, AssignedValue> entry : assignment.entrySet()) {
	        Variable assignedVar = entry.getKey();
	        AssignedValue assignedVal = entry.getValue();

	        // 2. זיהוי שותף: לפי splitGroupId זהה או לפי קורס אנגלית עם אותו ID
	        boolean isPartner = (currentSplitId != null && !currentSplitId.isEmpty() && currentSplitId.equals(assignedVar.getSplitGroupId())) ||
	                            (isEnglish && assignedVar.isEnglishCourse() && var.getCourseId().equals(assignedVar.getCourseId()));

	        if (isPartner) {
	            int dayA = value.getDay();
	            int dayB = assignedVal.getDay();

	            // --- חוק קורסי אנגלית ---
	            if (isEnglish) {
	                // אם לפחות אחד מהם ביום שישי
	                if (dayA == 6 || dayB == 6) {
	                    // הם חייבים להיות באותו יום (שניהם בשישי) וגם צמודים
	                    boolean consecutive = (dayA == dayB) && (
	                        (value.getStartFrame() == assignedVal.getStartFrame() + assignedVar.getDuration()) ||
	                        (value.getStartFrame() + var.getDuration() == assignedVal.getStartFrame())
	                    );
	                    
	                    if (!consecutive) return true; // קונפליקט! (או ימים שונים או לא צמודים)
	                } 
	                // אם שניהם בימי חול (1-5)
	                else if (dayA == dayB) {
	                    return true; // קונפליקט! (אנגלית בימי חול חייבת ימים נפרדים)
	                }
	            } 
	            
	            // --- חוק קורס מפוצל רגיל (לא אנגלית) ---
	            else {
	                if (dayA == dayB) return true; // קונפליקט! (חייבים ימים נפרדים)
	            }
	        }
	    }
	    return false;
	}
	
}
