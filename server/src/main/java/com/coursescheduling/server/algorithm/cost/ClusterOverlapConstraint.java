package com.coursescheduling.server.algorithm.cost;

import com.coursescheduling.server.algorithm.cost.SoftConstraint;
import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.Variable;
import java.util.Map;


public class ClusterOverlapConstraint implements SoftConstraint {

    @Override
    public double calculatePenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment) {
        double totalPenalty = 0;

        int currentStart = value.getStartFrame();
        int currentEnd = currentStart + variable.getDuration() - 1;
        int currentDay = value.getDay();
        int currentCluster = variable.getCluster();

        for (Map.Entry<Variable, AssignedValue> entry : currentAssignment.entrySet()) {
            Variable assignedVar = entry.getKey();
            AssignedValue assignedVal = entry.getValue();

            if (assignedVar.getCluster() == currentCluster && assignedVal.getDay() == currentDay) {
                
                int assignedStart = assignedVal.getStartFrame();
                int assignedEnd = assignedStart + assignedVar.getDuration() - 1;

                if (Math.max(currentStart, assignedStart) <= Math.min(currentEnd, assignedEnd)) {
                    if (currentCluster >= 1 && currentCluster <= 8) {
                        totalPenalty += 100.0;
                    } else if (currentCluster >= 9 && currentCluster <= 14) {
                        totalPenalty += 40.0;
                    }
                }
            }
        }
        return totalPenalty;
    }

    @Override
    public String getName() {
        return "ClusterOverlap";
    }

    @Override
    public double getMaxPenalty() {
        return 100.0;
    }
}