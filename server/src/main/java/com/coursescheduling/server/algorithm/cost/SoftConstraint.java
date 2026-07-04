package com.coursescheduling.server.algorithm.cost;

import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.algorithm.model.AssignedValue;

import java.util.Map;

public interface SoftConstraint {

    // Calculates the penalty for assigning this value with the current assignment.
    double calculatePenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment);

    // Returns the soft constraint name.
    String getName();

    
    double getMaxPenalty();
}
