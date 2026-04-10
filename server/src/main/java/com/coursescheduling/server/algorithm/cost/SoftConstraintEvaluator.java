package com.coursescheduling.server.algorithm.cost;

import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.algorithm.model.AssignedValue;

import java.util.Map;
import java.util.List;

public class SoftConstraintEvaluator {
    
    private final List<SoftConstraint> softConstraints;

    public SoftConstraintEvaluator(List<SoftConstraint> softConstraints) {
        this.softConstraints = softConstraints;
    }

    public double calculateTotalPenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment) {
        double totalPenalty = 0.0;
        for (SoftConstraint constraint : softConstraints) {
            totalPenalty += constraint.calculatePenalty(variable, value, currentAssignment);
        }
        return totalPenalty;
    }

}
