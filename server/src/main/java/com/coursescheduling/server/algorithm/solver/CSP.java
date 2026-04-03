package com.coursescheduling.server.algorithm.solver;

import java.util.Map;

import com.coursescheduling.server.algorithm.model.DomainValue;
import com.coursescheduling.server.algorithm.model.Variable;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;


public class CSP {

    // Main method to solve the CSP
    public Map<Variable, DomainValue> solve(List<Variable> variables) {
        Map<Variable, DomainValue> assignment = new HashMap<>();
        return backtrack(assignment, variables);
    }


    // Backtracking search algorithm
    private Map<Variable, DomainValue> backtrack(Map<Variable, DomainValue> assignment, List<Variable> variables) {
        if (assignment.size() == variables.size()) {
            return new HashMap<>(assignment); // Return a copy of the solution
        }

        Variable var = selectUnassignedVariable(assignment, variables);
        List<DomainValue> orderedValues = orderDomainValues(var, assignment);
        for (DomainValue value : orderedValues) {
            if (isConsistent(var, value, assignment)) {
                assignment.put(var, value);
                Map<Variable, DomainValue> removedValues = forwardCheck(var, value, assignment, variables);
                if(removedValues != null) {
                    Map<Variable, DomainValue> result = backtrack(assignment, variables);
                    if (result != null) {
                        return result; // Solution found
                    }
                }
                undoForwardCheck(removedValues, variables);
                assignment.remove(var); // Backtrack
                
            }
        }
        return null; // No solution found
    }

    // Heuristic: Select the first unassigned variable (can be improved with more sophisticated heuristics)
    private Variable selectUnassignedVariable(Map<Variable, DomainValue> assignment, List<Variable> variables) {
        for (Variable var : variables) {
            if (!assignment.containsKey(var)) {
                return var; // Return the first unassigned variable
            }
        }
        return null; // All variables are assigned
    }

    // Heuristic: Return the domain values in their original order (can be improved with more sophisticated heuristics)
    private List<DomainValue> orderDomainValues(Variable var, Map<Variable, DomainValue> assignment) {
        return new ArrayList<>(var.getDomain().getValues());
    }


    // Placeholder for consistency check: In a real implementation, this would check the constraints of the problem
    private boolean isConsistent(Variable var, DomainValue value, Map<Variable, DomainValue> assignment) {
        // Implement consistency checks based on the problem constraints
        return true; // Placeholder: Assume all assignments are consistent
    }


    // Placeholder for forward checking: In a real implementation, this would prune the domains of unassigned variables based on the current assignment
    private Map<Variable, DomainValue> forwardCheck(Variable var, DomainValue value, Map<Variable, DomainValue> assignment, List<Variable> variables) {
        // Implement forward checking to prune the domains of unassigned variables
        return new HashMap<>(); // Placeholder: Return an empty map of removed values
    }


    // Placeholder for undoing forward checking: In a real implementation, this would restore the domains of variables after backtracking
    private void undoForwardCheck(Map<Variable, DomainValue> removedValues, List<Variable> variables) {
        // Implement logic to restore the domains of variables after backtracking
    }


    

}
