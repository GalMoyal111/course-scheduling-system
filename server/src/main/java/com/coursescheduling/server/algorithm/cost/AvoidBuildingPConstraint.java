package com.coursescheduling.server.algorithm.cost;

import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.algorithm.model.AssignedValue;
import java.util.Map;

public class AvoidBuildingPConstraint implements SoftConstraint {

    @Override
    public double calculatePenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment) {
        
    	if (variable.isVirtual()) {
            return 0.0; 
        }
    	
    	if (value.getRoom() != null && value.getRoom().getBuilding() != null) {
            if (value.getRoom().getBuilding().trim().equalsIgnoreCase("P")) {
                return 10.0; 
            }
        }
        return 0.0; 
    }

    @Override
    public String getName() {
        return "AvoidBuildingP"; 
    }

    @Override
    public double getMaxPenalty() {
        return 10.0; 
    }
}