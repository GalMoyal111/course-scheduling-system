package com.coursescheduling.server.algorithm.cost;
import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.Variable;


import java.util.Map;

public class ElectiveCourseInTheSameClassroom implements SoftConstraint {

    @Override
    public double calculatePenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment) {
        if (variable.getCluster() < 9) {
            return 0.0; // No penalty for non-elective courses
        }

        for (Map.Entry<Variable, AssignedValue> entry : currentAssignment.entrySet()) {
            Variable otherVar = entry.getKey();
            AssignedValue otherVal = entry.getValue();

            if (otherVar.getCourseId().equals(variable.getCourseId()) && otherVar.getCluster() < 9) {
                if (!value.getRoom().equals(otherVal.getRoom())) {
                    return 1.0; // Penalty for elective course not in the same room as its lecture/tutorial
                }
            }
        }
        return 0.0; // No penalty if all related courses are in the same room
    }

    @Override
    public String getName() {
        return "electiveCourseInTheSameClassroom";
    }

    @Override
    public double getMaxPenalty() {
        return 1;
    }
    
}