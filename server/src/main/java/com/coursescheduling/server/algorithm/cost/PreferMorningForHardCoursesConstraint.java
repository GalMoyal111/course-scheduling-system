package com.coursescheduling.server.algorithm.cost;

import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.algorithm.model.AssignedValue;

import java.util.Map;

public class PreferMorningForHardCoursesConstraint implements SoftConstraint {

    @Override
    public double calculatePenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment) {
        if (variable.getIsHardCourse() == null || !variable.getIsHardCourse()) {
            return 0.0; // No penalty for non-hard courses
        }
        int startFrame = value.getStartFrame();
        if (startFrame <= 3) {
            return 0.0; // No penalty for morning slots (frames 1-3)
        } else if (startFrame <= 6) {
            return 1.0; // Small penalty for mid-day slots (frames 4-6)
        } else if (startFrame <= 9) {
            return 2.0; // Larger penalty for afternoon slots (frames 7-9)
        }
        return 3.0; // Maximum penalty for late afternoon/evening slots (frames 10-12)
    }

    @Override
    public String getName() {
        return "preferMorningForHardCourses";    
    }
    
}
