package com.coursescheduling.server.algorithm.cost;

import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.algorithm.model.AssignedValue;

import java.util.Map;

public interface SoftConstraint {

    //function to calculate how much penalty is incurred if the variable is assigned this value, given the current assignment of other variables
    double calculatePenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment);

    //function to get the name of the soft constraint for identification purposes
    String getName();

    
    double getMaxPenalty();
}
