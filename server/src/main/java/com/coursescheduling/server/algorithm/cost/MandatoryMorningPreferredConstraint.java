package com.coursescheduling.server.algorithm.cost;

import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.Variable;

import java.util.Map;

public class MandatoryMorningPreferredConstraint implements SoftConstraint {

    private static final String CONSTRAINT_NAME = "MandatoryMorningPreferred";

    @Override
    // Returns the name.
    public String getName() {
        return CONSTRAINT_NAME;
    }

    @Override
    // Calculates the penalty.
    public double calculatePenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment) {
        double penalty = 0.0;
        int cluster = variable.getCluster();

        if (cluster >= 1 && cluster <= 8) {
            
            int startFrame = value.getStartFrame();
            int endFrame = startFrame + variable.getDuration() - 1; 

            for (int frame = startFrame; frame <= endFrame; frame++) {
                if (frame >= 7 && frame <= 12) {
                    penalty += 10.0; 
                }
            }
        }

        return penalty;
    }

    @Override
    // Returns the max penalty.
    public double getMaxPenalty() {
        return 30.0; 
    }
}
