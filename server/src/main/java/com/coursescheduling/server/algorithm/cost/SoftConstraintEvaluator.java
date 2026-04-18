package com.coursescheduling.server.algorithm.cost;

import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.algorithm.model.AssignedValue;

import java.util.Map;
import java.util.List;
import java.util.HashMap;

public class SoftConstraintEvaluator {
    
    private final List<SoftConstraint> softConstraints;
    private final Map<String, Double> userWeights;

    public SoftConstraintEvaluator(List<SoftConstraint> softConstraints, Map<String, Double> userWeights) {
        this.softConstraints = softConstraints;
        this.userWeights = userWeights != null ? userWeights : new HashMap<>();
    }

    public double calculateTotalPenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment) {
        double totalPenalty = 0.0;
        
        for (SoftConstraint constraint : softConstraints) {
        	String constraintName = constraint.getName();
        	
        	double userWeight = userWeights.getOrDefault(constraintName, 5.0);
        	
        	if (userWeight <= 0.0) {
                continue;
            }
        	
        	double rawPenalty = constraint.calculatePenalty(variable, value, currentAssignment);
        	double maxPenalty = constraint.getMaxPenalty();
        	
        	double normalizedPenalty = 0.0;
            if (maxPenalty > 0) {
                normalizedPenalty = (rawPenalty / maxPenalty) * 10.0;
            }
            
            normalizedPenalty = Math.min(normalizedPenalty, 10.0);
            
            
            double finalPenalty = normalizedPenalty * userWeight;
            totalPenalty += finalPenalty;          
        }
        return totalPenalty;
        
    }

    
    
}
