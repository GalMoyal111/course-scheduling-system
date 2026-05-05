package com.coursescheduling.server.algorithm.cost;

import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.Variable;

import java.util.Map;

public class LoadBalancingConstraint implements SoftConstraint {

    private static final String CONSTRAINT_NAME = "LoadBalancing";
    
    private static final int MAX_CONCURRENT_LESSONS = 20;
    
    private static final double PENALTY_PER_EXTRA_LESSON = 5.0;

    @Override
    public String getName() {
        return CONSTRAINT_NAME;
    }

    @Override
    public double calculatePenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment) {
        double totalPenalty = 0.0;
        int day = value.getDay();
        int startFrame = value.getStartFrame();
        int endFrame = startFrame + variable.getDuration() - 1;

        for (int currentFrame = startFrame; currentFrame <= endFrame; currentFrame++) {
            
            int concurrentCount = 1; 

            for (Map.Entry<Variable, AssignedValue> entry : currentAssignment.entrySet()) {
                Variable assignedVar = entry.getKey();
                AssignedValue assignedVal = entry.getValue();

                if (assignedVal.getDay() == day) {
                    int assignedStart = assignedVal.getStartFrame();
                    int assignedEnd = assignedStart + assignedVar.getDuration() - 1;

                    if (currentFrame >= assignedStart && currentFrame <= assignedEnd) {
                        concurrentCount++;
                    }
                }
            }

            if (concurrentCount > MAX_CONCURRENT_LESSONS) {
                int extraLessons = concurrentCount - MAX_CONCURRENT_LESSONS;
                totalPenalty += extraLessons * PENALTY_PER_EXTRA_LESSON; 
            }
        }

        return totalPenalty;
    }

    @Override
    public double getMaxPenalty() {
        return 50.0; 
    }
}