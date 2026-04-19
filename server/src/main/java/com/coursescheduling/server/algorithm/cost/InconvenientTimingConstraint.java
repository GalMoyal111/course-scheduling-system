package com.coursescheduling.server.algorithm.cost;

import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.Variable;

import java.util.Map;

public class InconvenientTimingConstraint implements SoftConstraint {

    private static final String CONSTRAINT_NAME = "InconvenientTiming";

    @Override
    public String getName() {
        return CONSTRAINT_NAME;
    }

    @Override
    public double calculatePenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment) {
        double penalty = 0.0;
        int day = value.getDay();
        int startFrame = value.getStartFrame();
        int endFrame = startFrame + variable.getDuration() - 1;

        if (day == 6) {
            penalty += 15;
        }

        for (int frame = startFrame; frame <= endFrame; frame++) {
            if (frame == 12) {
                penalty += 15.0; 
            }
        }

        return penalty;
    }

    @Override
    public double getMaxPenalty() {

        return 15.0; 
    }
}