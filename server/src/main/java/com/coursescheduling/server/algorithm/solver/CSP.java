package com.coursescheduling.server.algorithm.solver;

import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.coursescheduling.server.algorithm.constraints.LecturerConstraint;
import com.coursescheduling.server.algorithm.constraints.RoomConstraint;
import com.coursescheduling.server.algorithm.constraints.SplitLessonConstraint;
import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.DomainValue;
import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.algorithm.preprocessing.DomainConstraintService;
import com.coursescheduling.server.model.Classroom;
import com.coursescheduling.server.algorithm.cost.SoftConstraintEvaluator;
import com.coursescheduling.server.algorithm.cost.SoftConstraintFactory;
import java.util.HashSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Component
public class CSP {
	
	@Autowired
    private RoomConstraint roomConstraint;
	
	@Autowired
    private DomainConstraintService constraintService;
	
	@Autowired
    private LecturerConstraint lecturerConstraint;
	
	@Autowired
    private SplitLessonConstraint splitLessonConstraint;

    private final SoftConstraintEvaluator softConstraintEvaluator;
	
	
	public CSP() {
        this.softConstraintEvaluator = new SoftConstraintEvaluator(SoftConstraintFactory.createSoftConstraints());
    }

    // Main method to solve the CSP
	public Map<Variable, AssignedValue> solve(List<Variable> variables, RoomManager roomManager) {
        Map<Variable, AssignedValue> assignment = new HashMap<>();
        return backtrack(assignment, variables, roomManager);
    }
	


    // Backtracking search algorithm
    private Map<Variable, AssignedValue> backtrack(Map<Variable, AssignedValue> assignment, List<Variable> variables, RoomManager roomManager) {
        
    	if (assignment.size() == variables.size()) {
            return new HashMap<>(assignment); // Return a copy of the solution
        }

        Variable var = selectUnassignedVariable(assignment, variables);
        List<AssignedValue> orderedValues = orderDomainValues(var, assignment, roomManager);
        
        for (AssignedValue assignedValue : orderedValues) {
            assignment.put(var, assignedValue);
            for (int t = 0; t < var.getDuration(); t++) 
                roomManager.bookRoom(assignedValue.getDay(), assignedValue.getStartFrame() + t, assignedValue.getRoom());
        	
            Map<Variable, List<DomainValue>> removedValues = forwardCheck(var, assignedValue, assignment, variables , roomManager);

            if (removedValues != null) {
                Map<Variable, AssignedValue> result = backtrack(assignment, variables, roomManager);
                if (result != null) {
                    return result; // Solution found
                }
            }
            
            undoForwardCheck(removedValues);

            for (int t = 0; t < var.getDuration(); t++){
                roomManager.releaseRoom(assignedValue.getDay(), assignedValue.getStartFrame() + t, assignedValue.getRoom());
            }
            assignment.remove(var); // Backtrack
        }
        return null; // No solution found
    }

    // Heuristic: Select the first unassigned variable (can be improved with more sophisticated heuristics)
    private Variable selectUnassignedVariable(Map<Variable, AssignedValue> assignment, List<Variable> variables) {
        
    	for (Variable var : variables) {
            if (!assignment.containsKey(var)) {
                return var; // Return the first unassigned variable
            }
        }
        return null; // All variables are assigned
    }

    
    
    // Heuristic: Return the domain values in their original order (can be improved with more sophisticated heuristics)
    private List<AssignedValue> orderDomainValues(Variable var, Map<Variable, AssignedValue> assignment, RoomManager roomManager) {
        List<AssignedValue> orderedValues = new ArrayList<>();

        for (DomainValue value : var.getDomain().getValues()) {
            AssignedValue av = buildAssignedValue(var, value, assignment, roomManager);
            if (av != null) {
                orderedValues.add(av);
            }
        }
        
        orderedValues.sort((av1, av2) -> {
            double score1 = softConstraintEvaluator.calculateTotalPenalty(var, av1, assignment);
            double score2 = softConstraintEvaluator.calculateTotalPenalty(var, av2, assignment);
            return Double.compare(score1, score2); // Sort in ascending order of penalty (lower penalty first)
        });
        return orderedValues;
    }


    
    
    // Placeholder for consistency check: In a real implementation, this would check the constraints of the problem
    private Classroom isConsistent(Variable var, DomainValue value, Map<Variable, AssignedValue> assignment , RoomManager roomManager) {
    	
    	int start1 = value.getStartFrame();
        int end1 = start1 + var.getDuration() - 1;
        
        
        for (Map.Entry<Variable, AssignedValue> entry : assignment.entrySet()) {
            Variable assignedVar = entry.getKey();
            AssignedValue assignedTime = entry.getValue();

            if (assignedVar.getLecturer().equals(var.getLecturer()) && assignedTime.getDay() == value.getDay()) {
                
                int start2 = assignedTime.getStartFrame();
                int end2 = start2 + assignedVar.getDuration() - 1; 
                
                if (Math.max(start1, start2) <= Math.min(end1, end2)) {
                    return null; 
                }
            }
        }
        
        
        if (splitLessonConstraint.isSplitPartAlreadyScheduledToday(var, value, assignment)) {
            // System.out.println("⚠️ Split lesson part for " + var.getCourseId() + " already scheduled today.");
            return null;
        }
        
        
        if (lecturerConstraint.isConsecutiveLimitExceeded(var, value, assignment)) {
            System.out.println("⚠️ Lecturer " + var.getLecturer() + " exceeded max consecutive hours. Skipping slot.");
            return null;
        }
        
        if (lecturerConstraint.isDailyLimitExceeded(var, value, assignment)) {
            System.out.println("⚠️ Lecturer " + var.getLecturer() + " exceeded total daily hours (8). Skipping slot.");
            return null;
        }
        
        

        Set<Classroom> availableRooms = new HashSet<>(roomManager.getAvailableRooms(value.getDay(), start1));
        
        availableRooms.removeIf(room -> !roomConstraint.isRoomSuitable(var, room));
        
        for (int t = 1; t < var.getDuration(); t++) {
            Set<Classroom> nextFrameRooms = roomManager.getAvailableRooms(value.getDay(), start1 + t);
            if (nextFrameRooms != null) {
                availableRooms.retainAll(nextFrameRooms); 
            } else {
                availableRooms.clear();
            }
        }
        
        if (!availableRooms.isEmpty()) {
            return availableRooms.iterator().next(); 
        }

        return null; 
    }


    
    
    // Placeholder for forward checking: In a real implementation, this would prune the domains of unassigned variables based on the current assignment
    private Map<Variable, List<DomainValue>> forwardCheck(Variable var, DomainValue value, Map<Variable, AssignedValue> assignment, List<Variable> variables ,RoomManager roomManager ) {
        Map<Variable, List<DomainValue>> removedValues = new HashMap<>();
        
        for (Variable futureVar : variables) {
            if (!assignment.containsKey(futureVar)) {
                List<DomainValue> toRemove = new ArrayList<>();
                for (DomainValue futureValue : new ArrayList<>(futureVar.getDomain().getValues())) {
                    if (isConsistent(futureVar, futureValue, assignment, roomManager) == null) {
                        toRemove.add(futureValue);
                    }
                }
                if (!toRemove.isEmpty()) {
                    removedValues.put(futureVar, toRemove);
                    futureVar.getDomain().getValues().removeAll(toRemove);
                    
                    if (futureVar.getDomain().getValues().isEmpty()) {
                        undoForwardCheck(removedValues); // Restore domains before backtracking
                        return null; // Failure: Domain wiped out
                    }
                }
            }
        }
        return removedValues;
    }

    
    

    // Placeholder for undoing forward checking: In a real implementation, this would restore the domains of variables after backtracking
    private void undoForwardCheck(Map<Variable, List<DomainValue>> removedValues) {
        if (removedValues != null) {
            for (Map.Entry<Variable, List<DomainValue>> entry : removedValues.entrySet()) {
                Variable var = entry.getKey();
                List<DomainValue> valuesToRestore = entry.getValue();
                var.getDomain().getValues().addAll(valuesToRestore);
            }
        }
    }


    private AssignedValue buildAssignedValue(Variable var, DomainValue value, Map<Variable, AssignedValue> assignment , RoomManager roomManager) {
            Classroom bookedRoom = isConsistent(var, value, assignment , roomManager);
            if (bookedRoom != null) {
                return new AssignedValue(value.getDay(), value.getStartFrame(), bookedRoom);
            }
            return null;
    }

}
