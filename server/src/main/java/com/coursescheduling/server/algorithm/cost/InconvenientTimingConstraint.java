package com.coursescheduling.server.algorithm.cost;

import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.Variable;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class InconvenientTimingConstraint implements SoftConstraint {

    private static final String CONSTRAINT_NAME = "InconvenientTiming";

    
    @Override
    // Returns the name.
    public String getName() {
        return CONSTRAINT_NAME;
    }

    @Override
    // Calculates the penalty.
    public double calculatePenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment) {
        double penalty = 0.0;
        int day = value.getDay();
        int startFrame = value.getStartFrame();
        int endFrame = startFrame + variable.getDuration() - 1;

        boolean isEnglishCourse = variable.isEnglishCourse();
        
        if (day == 6 && !isEnglishCourse) {
            penalty += 15;
        }

        for (int frame = startFrame; frame <= endFrame; frame++) {
            if (frame == 12) {
                penalty += 5.0; 
            }
        }

        return penalty;
    }

    @Override
    // Returns the max penalty.
    public double getMaxPenalty() {

        return 15.0; 
    }
}
