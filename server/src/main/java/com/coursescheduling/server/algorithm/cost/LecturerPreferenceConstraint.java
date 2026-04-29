package com.coursescheduling.server.algorithm.cost;

import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.DomainValue;

import java.util.List;
import java.util.Map;

public class LecturerPreferenceConstraint implements SoftConstraint {

    @Override
    public double calculatePenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment) {
        List<DomainValue> nonPreferred = variable.getNonPreferredSlots();
        
        if (nonPreferred == null || nonPreferred.isEmpty()) {
            return 0.0;
        }

        int penalty = 0;
        int day = value.getDay();
        int startFrame = value.getStartFrame();
        int endFrame = startFrame + variable.getDuration() - 1;

        for (int frame = startFrame; frame <= endFrame; frame++) {
            int currentFrame = frame;
            
            boolean isNonPreferred = nonPreferred.stream()
                .anyMatch(slot -> slot.getDay() == day && slot.getStartFrame() == currentFrame);
            
            if (isNonPreferred) {
                penalty += 1;
            }
        }

        return (double) penalty;
    }

    @Override
    public double getMaxPenalty() {
        return 3.0;
    }

    @Override
    public String getName() {
        return "LecturerPreference";
    }
}