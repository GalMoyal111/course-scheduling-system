package com.coursescheduling.server.algorithm.cost;

import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.Variable;

import java.util.Map;

public class LecturerCompactScheduleConstraint implements SoftConstraint {

    // --- Weights (Penalties) ---
    private static final double NEW_DAY_PENALTY = 15.0; 
    private static final double QUADRATIC_LOAD_MULTIPLIER = 1.0; 
    private static final double GAP_PENALTY_PER_FRAME = 1.0; 
    private static final double FATIGUE_PENALTY_THRESHOLD = 5; 
    private static final double EXTREME_FATIGUE_PENALTY = 2.0; 
    private static final double EVEN_FRAME_START_PENALTY = 1.0;

    @Override
    public double calculatePenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment) {
        String lecturer = variable.getLecturer();
        
        // 1. If there is no lecturer, no penalty applies.
        if (lecturer == null || lecturer.isEmpty()) {
            return 0.0;
        }

        int targetDay = value.getDay();
        int newStart = value.getStartFrame();
        int newEnd = newStart + variable.getDuration() - 1;
        int duration = variable.getDuration();

        boolean teachesOnAnyDay = false;
        boolean teachesOnTargetDay = false;
        int existingHoursOnTargetDay = 0;
        
        int minGap = Integer.MAX_VALUE;
        int adjacentBeforeEnd = -1;

        // 2. Gather information about the lecturer's current schedule
        for (Map.Entry<Variable, AssignedValue> entry : currentAssignment.entrySet()) {
            Variable assignedVar = entry.getKey();
            AssignedValue assignedVal = entry.getValue();

            if (lecturer.equals(assignedVar.getLecturer())) {
                teachesOnAnyDay = true;
                
                if (assignedVal.getDay() == targetDay) {
                    teachesOnTargetDay = true;
                    existingHoursOnTargetDay += assignedVar.getDuration();
                    
                    int existingStart = assignedVal.getStartFrame();
                    int existingEnd = existingStart + assignedVar.getDuration() - 1;

                    // Calculate gaps to find the closest lesson
                    int gap;
                    if (newEnd < existingStart) {
                        gap = existingStart - newEnd - 1;
                    } else if (existingEnd < newStart) {
                        gap = newStart - existingEnd - 1;
                        if (gap == 0) {
                             adjacentBeforeEnd = existingEnd; // Found a lesson right before this one
                        }
                    } else {
                        gap = 0; 
                    }

                    if (gap < minGap) {
                        minGap = gap;
                    }
                }
            }
        }

        double penalty = 0.0;

        // 3. New Day Penalty
        if (teachesOnAnyDay && !teachesOnTargetDay) {
            penalty += NEW_DAY_PENALTY;
        }

        // 4. Quadratic Load Balancing Penalty (Applies regardless of whether it's a new day or not)
        int totalHoursIfAssigned = existingHoursOnTargetDay + duration;
        penalty += (Math.pow(totalHoursIfAssigned, 2) * QUADRATIC_LOAD_MULTIPLIER);

        // 5. Gap, Fatigue, and Block Alignment Penalties (Only if already teaching on this day)
        if (teachesOnTargetDay) {
            
            // Prefer starting on odd frames (1, 3, 5...) to maintain 2-hour blocks
            if (newStart % 2 == 0) {
                 penalty += EVEN_FRAME_START_PENALTY;
            }

            if (minGap == 0) {
                // If appending to an existing sequence (0 gap)
                int sequenceLength = duration;
                int currentCheckEnd = adjacentBeforeEnd;
                
                // Track back to find total sequence length
                while (currentCheckEnd != -1) {
                    boolean foundPrevious = false;
                    for (Map.Entry<Variable, AssignedValue> entry : currentAssignment.entrySet()) {
                         if (lecturer.equals(entry.getKey().getLecturer()) && 
                             entry.getValue().getDay() == targetDay &&
                             entry.getValue().getStartFrame() + entry.getKey().getDuration() - 1 == currentCheckEnd) {
                             
                             sequenceLength += entry.getKey().getDuration();
                             currentCheckEnd = entry.getValue().getStartFrame() - 1;
                             foundPrevious = true;
                             break;
                         }
                    }
                    if (!foundPrevious) break;
                }
                
                if (sequenceLength > FATIGUE_PENALTY_THRESHOLD) {
                    penalty += EXTREME_FATIGUE_PENALTY;
                }
                
            } else if (minGap > 0 && minGap != Integer.MAX_VALUE) {
                // General penalty for having a gap
                penalty += (minGap * GAP_PENALTY_PER_FRAME);
            }
        }

        return penalty;
    }

    @Override
    public String getName() {
        return "lecturerCompactSchedule";
    }
}