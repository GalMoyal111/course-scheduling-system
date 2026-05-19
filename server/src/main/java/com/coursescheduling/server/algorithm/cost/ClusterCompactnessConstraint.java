package com.coursescheduling.server.algorithm.cost;

import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.Variable;
import java.util.Map;

public class ClusterCompactnessConstraint implements SoftConstraint {

    private static final String CONSTRAINT_NAME = "ClusterCompactness";
    private static final double PENALTY_PER_GAP_HOUR = 5.0; 

    @Override
    public double calculatePenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment) {
        double totalPenalty = 0.0;

        int currentStart = value.getStartFrame();
        int currentEnd = currentStart + variable.getDuration() - 1;
        int currentDay = value.getDay();
        int currentCluster = variable.getCluster();

        if (variable.getDuration() >= 2 && currentStart % 2 == 0) {
            totalPenalty += 2.0; 
        }

        for (Map.Entry<Variable, AssignedValue> entry : currentAssignment.entrySet()) {
            Variable assignedVar = entry.getKey();
            AssignedValue assignedVal = entry.getValue();

            if (assignedVar.getCluster() == currentCluster && assignedVal.getDay() == currentDay) {
                
                if (assignedVar.getCourseId().equals(variable.getCourseId())) {
                    continue;
                }

                int assignedStart = assignedVal.getStartFrame();
                int assignedEnd = assignedStart + assignedVar.getDuration() - 1;

                if (Math.max(currentStart, assignedStart) <= Math.min(currentEnd, assignedEnd)) {
                    continue;
                }

                int gap = 0;
                if (currentStart > assignedEnd) {
                    gap = currentStart - assignedEnd - 1;
                } else if (assignedStart > currentEnd) {
                    gap = assignedStart - currentEnd - 1;
                }

                if (gap > 0) {
                    totalPenalty += gap * PENALTY_PER_GAP_HOUR;
                }
            }
        }

        return totalPenalty;
    }

    @Override
    public String getName() {
        return CONSTRAINT_NAME;
    }

    @Override
    public double getMaxPenalty() {
        return 50.0; 
    }
}