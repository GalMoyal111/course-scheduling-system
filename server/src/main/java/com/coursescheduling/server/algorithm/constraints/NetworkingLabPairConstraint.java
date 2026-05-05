package com.coursescheduling.server.algorithm.constraints;

import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.DomainValue;
import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.model.LessonType; // בהנחה שזה ה-Enum שלך
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class NetworkingLabPairConstraint {

    private boolean isNetworkingLab(Variable var) {
        return (var.getCourseId().equals("61765") && var.getType() == LessonType.NETWORKING_LAB);
    }

    public boolean isValid(Variable var, DomainValue value, Map<Variable, AssignedValue> assignment) {
        
        if (!isNetworkingLab(var)) {
            return true; 
        }

        List<AssignedValue> assignedLabs = new ArrayList<>();

        for (Map.Entry<Variable, AssignedValue> entry : assignment.entrySet()) {
            Variable assignedVar = entry.getKey();
            if (isNetworkingLab(assignedVar) && assignedVar.getLecturer().equals(var.getLecturer())) {
                assignedLabs.add(entry.getValue());
            }
        }

        if (assignedLabs.size() % 2 == 0) {
            if (value.getStartFrame() % 2 == 0) {
                return false; 
            }
            return true;
        } 

        else {
            AssignedValue unpairedLab = findUnpairedLab(assignedLabs);
            
            if (unpairedLab == null) {
                return false; 
            }

            boolean isSameDay = value.getDay() == unpairedLab.getDay();
            boolean isNextFrame = value.getStartFrame() == (unpairedLab.getStartFrame() + 1);

            return isSameDay && isNextFrame;
        }
    }

    private AssignedValue findUnpairedLab(List<AssignedValue> labs) {
        for (AssignedValue lab : labs) {
            if (lab.getStartFrame() % 2 != 0) { 
                boolean hasSecondHalf = labs.stream().anyMatch(other -> 
                    other.getDay() == lab.getDay() && other.getStartFrame() == (lab.getStartFrame() + 1)
                );
                
                if (!hasSecondHalf) {
                    return lab;
                }
            }
        }
        return null;
    }
}