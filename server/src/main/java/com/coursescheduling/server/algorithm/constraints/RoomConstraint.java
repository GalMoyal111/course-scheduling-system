package com.coursescheduling.server.algorithm.constraints;

import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.model.Classroom;
import com.coursescheduling.server.model.LessonType;
import com.coursescheduling.server.model.RoomType;
import org.springframework.stereotype.Component;

import java.util.List;


@Component
public class RoomConstraint {
	
	public boolean isRoomSuitable(Variable var, Classroom room, List<Variable> allVariables) {
		
		Variable labVar = findLabVariableForCourse(var.getCourseId(), allVariables);
		
        if(isElectiveCourse(var) && labVar != null && var.getType() == LessonType.LECTURE) {
        	RoomType requiredRoomType = getRoomTypeForLab(labVar.getType());
        	return room.getType() == requiredRoomType && room.getCapacity() >= labVar.getRequiredCapacity();
        }
        
        return isTypeMatch(var.getType(), room.getType()) && room.getCapacity() >= var.getRequiredCapacity();
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
	
    
    private boolean isElectiveCourse(Variable var) {
        return var.getCluster() >= 9;
    }
	
    private Variable findLabVariableForCourse(String courseId, List<Variable> allVariables) {
    	for (Variable v : allVariables) {
            if (v.getCourseId().equals(courseId) && (v.getType() == LessonType.LAB)) {
            	return v;
            }
        }
        return null; // No lab type found for this course
    }
	
	
    private RoomType getRoomTypeForLab(LessonType labType) {
        switch (labType) {
            case PHYSICS_LAB:
                return RoomType.PHYSICS_LAB;
            case NETWORKING_LAB:
                return RoomType.NETWORKING_LAB;
            case LAB:
                return RoomType.LAB;
            default:
                return null;
        }
    }

}
