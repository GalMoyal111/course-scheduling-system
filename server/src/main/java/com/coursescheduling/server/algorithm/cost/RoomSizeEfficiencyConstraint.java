package com.coursescheduling.server.algorithm.cost;

import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.model.Classroom;
import com.coursescheduling.server.model.LessonType;

import java.util.Map;

public class RoomSizeEfficiencyConstraint implements SoftConstraint {

    @Override
    public double calculatePenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment) {
        // Assuming AssignedValue has a method getRoom() that returns the assigned room
        Classroom assignedRoom = value.getRoom();
        if (assignedRoom == null) {
            return 1.0; // Maximum penalty if no room is assigned
        }
        int roomCapacity = assignedRoom.getCapacity();
        int requiredCapacity = getRequiredCapacity(variable.getType());

        if (roomCapacity < requiredCapacity) {
            return 1.0; // Maximum penalty for insufficient capacity
        } else {
            return roomCapacity - requiredCapacity; // Penalty is the excess capacity (the smaller, the better)
        }
    }

    @Override
    public String getName() {
        return "Room Size Efficiency Constraint";
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
    
}
