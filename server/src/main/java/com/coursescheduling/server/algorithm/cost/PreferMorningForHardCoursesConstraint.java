package com.coursescheduling.server.algorithm.cost;

import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.algorithm.model.AssignedValue;

import java.util.Map;

import org.checkerframework.checker.units.qual.s;

public class PreferMorningForHardCoursesConstraint implements SoftConstraint {

    @Override
    // Calculates the penalty.
    public double calculatePenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment) {
        if (variable.getIsHardCourse() == null || !variable.getIsHardCourse()) {
            return 0.0; // No penalty for non-hard courses
        }
        int startFrame = value.getStartFrame();
        if (startFrame <= 3) 
            return 0.0; // No penalty for morning slots (frames 1-3)
        else {
            return startFrame; 
        }
    }

    @Override
    // Returns the name.
    public String getName() {
        return "PreferMorningForHardCourses";    
    }

	@Override
	// Returns the max penalty.
	public double getMaxPenalty() {
		return 5;
	}
    
}
