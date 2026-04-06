package com.coursescheduling.server.algorithm.constraints;

import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.DomainValue;
import com.coursescheduling.server.algorithm.model.Variable;
import org.springframework.stereotype.Component;
import java.util.Map;


@Component
public class SplitLessonConstraint {

	public boolean isSplitPartAlreadyScheduledToday(Variable var, DomainValue value, Map<Variable, AssignedValue> assignment) {
        String currentSplitId = var.getSplitGroupId();

        if (currentSplitId == null || currentSplitId.isEmpty()) {
            return false;
        }

        for (Map.Entry<Variable, AssignedValue> entry : assignment.entrySet()) {
            Variable assignedVar = entry.getKey();
            AssignedValue assignedVal = entry.getValue();

            if (currentSplitId.equals(assignedVar.getSplitGroupId()) && 
                assignedVal.getDay() == value.getDay()) {
                return true;
            }
        }

        return false;
    }
	
}
