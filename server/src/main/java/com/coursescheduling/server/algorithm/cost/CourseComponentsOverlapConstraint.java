package com.coursescheduling.server.algorithm.cost;

import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.model.LessonType;

import java.util.Map;

public class CourseComponentsOverlapConstraint implements SoftConstraint {

    private static final String CONSTRAINT_NAME = "CourseComponentsOverlap";

    @Override
    public String getName() {
        return CONSTRAINT_NAME;
    }

    @Override
    public double calculatePenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment) {
        double penalty = 0.0;

        int startA = value.getStartFrame();
        int endA = startA + variable.getDuration(); 
        int dayA = value.getDay();

        for (Map.Entry<Variable, AssignedValue> entry : currentAssignment.entrySet()) {
            Variable assignedVar = entry.getKey();
            AssignedValue assignedValue = entry.getValue();

            if (assignedVar.getCourseId().equals(variable.getCourseId())) {

                int startB = assignedValue.getStartFrame();
                int endB = startB + assignedVar.getDuration();
                int dayB = assignedValue.getDay();

                if (variable.getType().equals(assignedVar.getType()) && variable.getType().equals(LessonType.LECTURE)){
                    if (dayA == dayB) {
                        penalty += 20.0; 
                    }
                } 
                
                else if (variable.getType().equals(assignedVar.getType())){
                    if (dayA == dayB) {
                        penalty += 5.0; 
                    }
                } 
                
                else {
                    if (dayA == dayB) {
                        if (startA < endB && startB < endA) {
                            penalty += 20.0; 
                        }
                    }
                }
            }
        }

        return penalty;
    }

    @Override
    public double getMaxPenalty() {
        return 40.0; 
    }
}