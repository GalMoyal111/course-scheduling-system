package com.coursescheduling.server.algorithm.cost;

import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.Variable;

import java.util.Map;

public class ElectiveEveningPreferredConstraint implements SoftConstraint {

    private static final String CONSTRAINT_NAME = "ElectiveEveningPreferred";

    @Override
    public String getName() {
        return CONSTRAINT_NAME;
    }

    @Override
    public double calculatePenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment) {
        double penalty = 0.0;
        int cluster = variable.getCluster();

        if (cluster >= 9 && cluster <= 14) {
            
            int startFrame = value.getStartFrame();
            int endFrame = startFrame + variable.getDuration() - 1; 

            for (int frame = startFrame; frame <= endFrame; frame++) {
                if (frame < 8 ) {
                    penalty += 10.0; 
                }
            }
        }

        return penalty;
    }

    @Override
    public double getMaxPenalty() {
        return 30.0; 
    }
}
