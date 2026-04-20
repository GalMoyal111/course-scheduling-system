package com.coursescheduling.server.algorithm.cost;

import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.model.Classroom;
import com.coursescheduling.server.model.LessonType;

import java.util.Map;

public class RoomSizeEfficiencyConstraint implements SoftConstraint {

    @Override
    public double calculatePenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment) {
        Classroom assignedRoom = value.getRoom();
        if (assignedRoom == null) {
            return Double.MAX_VALUE; // Maximum penalty if no room is assigned
        }
        int roomCapacity = assignedRoom.getCapacity();
        int requiredCapacity = getRequiredCapacity(variable.getType());

        if (roomCapacity < requiredCapacity) {
            return Double.MAX_VALUE; // Maximum penalty for insufficient capacity
        }
        int difference = roomCapacity - requiredCapacity;
        if (difference <= 5) {
             return 0.0; // No penalty for perfect fit or very close fit
        } else if (difference <= 15) {
            return 1.0; // Small penalty for slightly larger room
        } else if (difference <= 30) {
            return 2.0; // Larger penalty for significantly larger room
        }
        return 3.0; // Maximum penalty for excessively large room
    }

    @Override
    public String getName() {
        return "RoomSizeEfficiency";    
    }

    // חשוב!!!!! כרגע יש שכפול קוד למטרות בדיקה
    private int getRequiredCapacity(LessonType type) {
        switch (type) {
            case LECTURE:
                return 60;
            case TUTORIAL:
                return 40;
            case LAB:
                return 20;
            case PHYSICS_LAB:
            	return 15;
            case NETWORKING_LAB:
            	return 12;
            default:
                return 0;
        }
    }

	@Override
	public double getMaxPenalty() {
		return 3;
	}
    
}
