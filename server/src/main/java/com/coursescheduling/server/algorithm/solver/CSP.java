package com.coursescheduling.server.algorithm.solver;

import java.util.Map;
import java.util.Set;

import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.DomainValue;
import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.model.Classroom;
import java.util.HashSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;


public class CSP {

	private RoomManager roomManager;
	
	public CSP(RoomManager roomManager) {
        this.roomManager = roomManager;
    }
	
	
	
    // Main method to solve the CSP
    public Map<Variable, AssignedValue> solve(List<Variable> variables) {
    	Map<Variable, AssignedValue> assignment = new HashMap<>();
        return backtrack(assignment, variables);
    }


    // Backtracking search algorithm
    private Map<Variable, AssignedValue> backtrack(Map<Variable, AssignedValue> assignment, List<Variable> variables) {
        
    	if (assignment.size() == variables.size()) {
            return new HashMap<>(assignment); // Return a copy of the solution
        }

        Variable var = selectUnassignedVariable(assignment, variables);
        List<DomainValue> orderedValues = orderDomainValues(var, assignment);
        
        for (DomainValue value : orderedValues) {
        	
        	Classroom bookedRoom = isConsistent(var, value, assignment);
        	
            if (bookedRoom != null) {
            	
            	AssignedValue assignedValue = new AssignedValue(value.getDay(), value.getStartFrame(), bookedRoom);
            	assignment.put(var, assignedValue);
                
            	for (int t = 0; t < var.getDuration(); t++) 
                    roomManager.bookRoom(value.getDay(), value.getStartFrame() + t, bookedRoom);
                
                
                Map<Variable, DomainValue> removedValues = forwardCheck(var, value, assignment, variables);
                
                if(removedValues != null) {
                	
                    Map<Variable, AssignedValue> result = backtrack(assignment, variables);
                    
                    if (result != null) {
                        return result; // Solution found
                    }
                }
                undoForwardCheck(removedValues, variables);
                
                for (int t = 0; t < var.getDuration(); t++) 
                    roomManager.releaseRoom(value.getDay(), value.getStartFrame() + t, bookedRoom);
                
                
                assignment.remove(var); // Backtrack
                
            }
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
    private List<DomainValue> orderDomainValues(Variable var, Map<Variable, AssignedValue> assignment) {
        return new ArrayList<>(var.getDomain().getValues());
    }


    
    
    // Placeholder for consistency check: In a real implementation, this would check the constraints of the problem
    private Classroom isConsistent(Variable var, DomainValue value, Map<Variable, AssignedValue> assignment) {
    	
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

        Set<Classroom> availableRooms = new HashSet<>(roomManager.getAvailableRooms(value.getDay(), start1));
        
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
    private Map<Variable, DomainValue> forwardCheck(Variable var, DomainValue value, Map<Variable, AssignedValue> assignment, List<Variable> variables) {
        // Implement forward checking to prune the domains of unassigned variables
        return new HashMap<>(); // Placeholder: Return an empty map of removed values
    }

    
    

    // Placeholder for undoing forward checking: In a real implementation, this would restore the domains of variables after backtracking
    private void undoForwardCheck(Map<Variable, DomainValue> removedValues, List<Variable> variables) {
        // Implement logic to restore the domains of variables after backtracking
    }


    

}
