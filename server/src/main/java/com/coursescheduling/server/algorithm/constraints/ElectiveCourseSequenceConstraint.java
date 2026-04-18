package com.coursescheduling.server.algorithm.constraints;

import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.DomainValue;
import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.model.LessonType;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ElectiveCourseSequenceConstraint {


    public boolean isElectiveSequenceValid(Variable variable, DomainValue value, Map<Variable, AssignedValue> assignment) {
        
        if (variable.getCluster() < 9) {
            return true;
        }

        LessonType currentType = variable.getType();

        if (currentType == LessonType.LECTURE) {
            return true;
        }

        if (currentType == LessonType.TUTORIAL) {
            Variable matchingLecture = findVariableByCourseAndType(variable.getCourseId(), LessonType.LECTURE, assignment);
            
            if (matchingLecture != null) {
                AssignedValue lectureAssignment = assignment.get(matchingLecture);
                return isDirectlyAfter(lectureAssignment, matchingLecture.getDuration(), value);
            }
            return true; 
        }

        if (currentType == LessonType.LAB || currentType == LessonType.PHYSICS_LAB || currentType == LessonType.NETWORKING_LAB) {
            
            Variable matchingTutorial = findVariableByCourseAndType(variable.getCourseId(), LessonType.TUTORIAL, assignment);
            if (matchingTutorial != null) {
                AssignedValue tutorialAssignment = assignment.get(matchingTutorial);
                return isDirectlyAfter(tutorialAssignment, matchingTutorial.getDuration(), value);
            }
            
            Variable matchingLecture = findVariableByCourseAndType(variable.getCourseId(), LessonType.LECTURE, assignment);
            if (matchingLecture != null) {
                AssignedValue lectureAssignment = assignment.get(matchingLecture);
                return isDirectlyAfter(lectureAssignment, matchingLecture.getDuration(), value);
            }

            return true;
        }

        return true;
    }

    private Variable findVariableByCourseAndType(String courseId, LessonType type, Map<Variable, AssignedValue> assignment) {
        for (Variable var : assignment.keySet()) {
            if (var.getCourseId().equals(courseId) && var.getType() == type) {
                return var;
            }
        }
        return null;
    }

    private boolean isDirectlyAfter(AssignedValue previousAssignment, int previousDuration, DomainValue currentValue) {
        if (previousAssignment.getDay() != currentValue.getDay()) {
            return false;
        }
        
        int previousEndFrame = previousAssignment.getStartFrame() + previousDuration;
        return currentValue.getStartFrame() == previousEndFrame;
    }
}