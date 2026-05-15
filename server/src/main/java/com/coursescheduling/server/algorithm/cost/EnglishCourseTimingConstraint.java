package com.coursescheduling.server.algorithm.cost;

import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.algorithm.model.AssignedValue;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class EnglishCourseTimingConstraint implements SoftConstraint {


    @Override
    public double calculatePenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment) {
        
        if (!variable.isEnglishCourse()) {
            return 0.0;
        }

        int day = value.getDay();
        int start = value.getStartFrame();
        int end = start + variable.getDuration() - 1;

        if (day == 6) {
            if (start >= 1 && end <= 4) {
                return 0.0; 
            }
        } else if (day >= 1 && day <= 5) {
            if (start >= 7 && end <= 10) {
                return 0.0; 
                }
        }

        return getMaxPenalty(); 
    }

    @Override
    public String getName() {
        return "EnglishCourseTiming";
    }

    @Override
    public double getMaxPenalty() {
        return 50.0; 
    }
}