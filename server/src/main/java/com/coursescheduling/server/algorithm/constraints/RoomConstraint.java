package com.coursescheduling.server.algorithm.constraints;

import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.model.Classroom;
import com.coursescheduling.server.model.LessonType;
import com.coursescheduling.server.model.RoomType;
import org.springframework.stereotype.Component;


@Component
public class RoomConstraint {
	
	public boolean isRoomSuitable(Variable var, Classroom room) {
        return isTypeMatch(var.getType(), room.getType()) &&  isCapacityEnough(var.getType(), room.getCapacity());
    }
	
	// returns true if the room type matches the lesson type requirements
	private boolean isTypeMatch(LessonType lessonType, RoomType roomType) {
        if (roomType == null) return false;

        switch (lessonType) {
            case PHYSICS_LAB:
                return roomType == RoomType.PHYSICS_LAB;
            case NETWORKING_LAB:
                return roomType == RoomType.NETWORKING_LAB;
            case LAB:
                return roomType == RoomType.LAB;
            case LECTURE:
            case TUTORIAL:
            default:
                return roomType == RoomType.NORMAL;
        }
    }
	
	// returns true if the room capacity is sufficient for the lesson type
	private boolean isCapacityEnough(LessonType type, int roomCapacity) {
        return roomCapacity >= getRequiredCapacity(type);
    }


    // returns the required capacity for a given lesson type
    private int getRequiredCapacity(LessonType type) {
        switch (type) {
            case LECTURE:
                return 60;
            case TUTORIAL:
                return 40;
            case LAB:
            case PHYSICS_LAB:
            case NETWORKING_LAB:
                return 20;
            default:
                return 0;
        }
    }
    
    
    
	
	
	
	
	

}
