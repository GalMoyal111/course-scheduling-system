package com.coursescheduling.server.algorithm.constraints;

import org.springframework.stereotype.Component;

import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.model.Classroom;
import com.coursescheduling.server.model.LessonType;

import java.util.Map;
import java.util.List;

@Component
public class ElectiveLectureLabSameRoomConstraint {

    public boolean isValid(Variable var, Classroom candidateRoom,Map<Variable, AssignedValue> assignment,List<Variable> allVariables){
        if(!isElectiveCourse(var)) {
            return true; 
        }

        LessonType labType = findLabTypeForCourse(var.getCourseId(), allVariables);
        if(labType == null) {
            return true; 
        }

        if(var.getType() != LessonType.LECTURE && !isLabType(var.getType())) {
            return true; 
        }

        Classroom existingRoom = findAssignedLectureRoomOrLabRoom(var.getCourseId(), assignment);
        if(existingRoom == null) {
            return true; 
        }

        return candidateRoom.equals(existingRoom);
    }

    private boolean isElectiveCourse(Variable var) {
        return var.getCluster() >= 9;
    }
    
    private boolean isLabType(LessonType type) {
        return type == LessonType.LAB || type == LessonType.PHYSICS_LAB || type == LessonType.NETWORKING_LAB;
    }

    private LessonType findLabTypeForCourse(String courseId, List<Variable> allVariables) {
        for (Variable variable : allVariables) {
            if (variable.getCourseId().equals(courseId) && isLabType(variable.getType())) {
                return variable.getType();
            }
        }
        return null; 
    }

    private Classroom findAssignedLectureRoomOrLabRoom(String courseId,Map<Variable, AssignedValue> assignment) {
        for(Map.Entry<Variable, AssignedValue> entry : assignment.entrySet()) {
            Variable assignedVar = entry.getKey();
            AssignedValue assignedValue = entry.getValue();
            
            if(assignedVar.getCourseId().equals(courseId) && 
               (assignedVar.getType() == LessonType.LECTURE || isLabType(assignedVar.getType()))) {
                return assignedValue.getRoom();
            }
        }
        return null;
    }

}
