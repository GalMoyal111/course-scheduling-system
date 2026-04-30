package com.coursescheduling.server.algorithm.solver;

import java.util.Map;
import java.util.Set;

import org.checkerframework.checker.units.qual.A;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.coursescheduling.server.algorithm.constraints.ElectiveCourseSequenceConstraint;
import com.coursescheduling.server.algorithm.constraints.ElectiveLectureLabSameRoomConstraint;
import com.coursescheduling.server.algorithm.constraints.LecturerConstraint;
import com.coursescheduling.server.algorithm.constraints.RoomConstraint;
import com.coursescheduling.server.algorithm.constraints.SplitLessonConstraint;
import com.coursescheduling.server.algorithm.constraints.ClusterOneSundayEveningConstraint;
import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.DomainValue;
import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.algorithm.preprocessing.DomainConstraintService;
import com.coursescheduling.server.model.Classroom;
import com.coursescheduling.server.model.LessonType;
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
	
	@Autowired
	private ElectiveCourseSequenceConstraint electiveCourseSequenceConstraint;

    @Autowired
    private ElectiveLectureLabSameRoomConstraint electiveLectureLabSameRoomConstraint;

    @Autowired
    private ClusterOneSundayEveningConstraint clusterOneSundayEveningConstraint;

    

    // Main method to solve the CSP
	public Map<Variable, AssignedValue> solve(List<Variable> variables, RoomManager roomManager, Map<String, Double> customWeights, Map<Variable, AssignedValue> initialAssignment) {
        
		Map<Variable, AssignedValue> assignment = new HashMap<>();
        
		if (initialAssignment != null && !initialAssignment.isEmpty()) {
            assignment.putAll(initialAssignment);
            
            for (Map.Entry<Variable, AssignedValue> entry : initialAssignment.entrySet()) {
                Variable var = entry.getKey();
                AssignedValue val = entry.getValue();
                
                for (int t = 0; t < var.getDuration(); t++) {
                    roomManager.bookRoom(val.getDay(), val.getStartFrame() + t, val.getRoom());
                }
            }
            System.out.println("🔒 Locked " + initialAssignment.size() + " manual assignments.");
        }
		
        Map<String, Double> finalWeights = (customWeights != null && !customWeights.isEmpty()) 
                ? customWeights 
                : SoftConstraintFactory.getDefaultUserWeights();
        
        
        SoftConstraintEvaluator currentEvaluator = new SoftConstraintEvaluator(SoftConstraintFactory.createSoftConstraints(), finalWeights);
        
        
        return backtrack(assignment, variables, roomManager, currentEvaluator);
    }
	


    // Backtracking search algorithm
    private Map<Variable, AssignedValue> backtrack(Map<Variable, AssignedValue> assignment, List<Variable> variables, RoomManager roomManager, SoftConstraintEvaluator evaluator) {
        
    	if (assignment.size() == variables.size()) {
            return new HashMap<>(assignment); // Return a copy of the solution
        }

        Variable var = selectUnassignedVariable(assignment, variables);
        
        List<AssignedValue> orderedValues = orderDomainValues(var, assignment,variables, roomManager, evaluator);
        
        for (AssignedValue assignedValue : orderedValues) {
            assignment.put(var, assignedValue);
            for (int t = 0; t < var.getDuration(); t++) 
                roomManager.bookRoom(assignedValue.getDay(), assignedValue.getStartFrame() + t, assignedValue.getRoom());
        	
            Map<Variable, List<DomainValue>> removedValues = forwardCheck(var, assignedValue, assignment, variables , roomManager);

            if (removedValues != null) {
                Map<Variable, AssignedValue> result = backtrack(assignment, variables, roomManager, evaluator);
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
    private List<AssignedValue> orderDomainValues(Variable var, Map<Variable, AssignedValue> assignment,List<Variable> variables, RoomManager roomManager, SoftConstraintEvaluator evaluator) {
        List<AssignedValue> orderedValues = new ArrayList<>();

        for (DomainValue value : var.getDomain().getValues()) {
            orderedValues.addAll(buildAssignedValues(var, value, assignment, variables, roomManager));
        }
        
        orderedValues.sort((av1, av2) -> {
        	double score1 = evaluator.calculateTotalPenalty(var, av1, assignment);
            double score2 = evaluator.calculateTotalPenalty(var, av2, assignment);
            return Double.compare(score1, score2); // Sort in ascending order of penalty (lower penalty first)
        });
        System.out.println("----- Ordered values for lesson " + var.getLessonId() + " -----");
        for (AssignedValue av : orderedValues) {
        	double score = evaluator.calculateTotalPenalty(var, av, assignment);
        
        	// System.out.println("day=" + av.getDay()+ ", frame=" + av.getStartFrame()+ ", room=" + av.getRoom().getClassroomName()+ ", capacity=" + av.getRoom().getCapacity()+ ", penalty=" + score);
        }
        // System.out.println("--------------------------------------------");
        return orderedValues;
    }


    
    
    // // Placeholder for consistency check: In a real implementation, this would check the constraints of the problem
    // private Classroom isConsistent(Variable var, DomainValue value, Map<Variable, AssignedValue> assignment , RoomManager roomManager) {
    	
    // 	int start1 = value.getStartFrame();
    //     int end1 = start1 + var.getDuration() - 1;
        
        
    //     for (Map.Entry<Variable, AssignedValue> entry : assignment.entrySet()) {
    //         Variable assignedVar = entry.getKey();
    //         AssignedValue assignedTime = entry.getValue();

    //         if (assignedVar.getLecturer().equals(var.getLecturer()) && assignedTime.getDay() == value.getDay()) {
                
    //             int start2 = assignedTime.getStartFrame();
    //             int end2 = start2 + assignedVar.getDuration() - 1; 
                
    //             if (Math.max(start1, start2) <= Math.min(end1, end2)) {
    //                 return null; 
    //             }
    //         }
    //     }
        
        
    //     if (splitLessonConstraint.isSplitPartAlreadyScheduledToday(var, value, assignment)) {
    //         // System.out.println("⚠️ Split lesson part for " + var.getCourseId() + " already scheduled today.");
    //         return null;
    //     }
        
        
    //     if (lecturerConstraint.isConsecutiveLimitExceeded(var, value, assignment)) {
    //         System.out.println("⚠️ Lecturer " + var.getLecturer() + " exceeded max consecutive hours. Skipping slot.");
    //         return null;
    //     }
        
    //     if (lecturerConstraint.isDailyLimitExceeded(var, value, assignment)) {
    //         System.out.println("⚠️ Lecturer " + var.getLecturer() + " exceeded total daily hours (8). Skipping slot.");
    //         return null;
    //     }
        
        

    //     Set<Classroom> availableRooms = new HashSet<>(roomManager.getAvailableRooms(value.getDay(), start1));
        
    //     availableRooms.removeIf(room -> !roomConstraint.isRoomSuitable(var, room));
        
    //     for (int t = 1; t < var.getDuration(); t++) {
    //         Set<Classroom> nextFrameRooms = roomManager.getAvailableRooms(value.getDay(), start1 + t);
    //         if (nextFrameRooms != null) {
    //             availableRooms.retainAll(nextFrameRooms); 
    //         } else {
    //             availableRooms.clear();
    //         }
    //     }
        
    //     if (!availableRooms.isEmpty()) {
    //         return availableRooms.iterator().next(); 
    //     }

    //     return null; 
    // }


    
    
    // Placeholder for forward checking: In a real implementation, this would prune the domains of unassigned variables based on the current assignment
 // Forward Checking ישיר ומהיר - שלב א: מניעת חפיפות מרצים
    private Map<Variable, List<DomainValue>> forwardCheck(Variable var, DomainValue value, Map<Variable, AssignedValue> assignment, List<Variable> variables, RoomManager roomManager) {
        Map<Variable, List<DomainValue>> removedValues = new HashMap<>();
        
        int currentAssignedStart = value.getStartFrame();
        int currentDuration = var.getDuration();
        int currentAssignedEnd = currentAssignedStart + var.getDuration() - 1;
        
        String currentSplitId = var.getSplitGroupId();

        for (Variable futureVar : variables) {
            if (!assignment.containsKey(futureVar)) {
                List<DomainValue> toRemove = new ArrayList<>();
                
                if (futureVar.getLecturer().equals(var.getLecturer())) {
                    for (DomainValue futureValue : futureVar.getDomain().getValues()) {
                        if (futureValue.getDay() == value.getDay()) {
                            int futureStart = futureValue.getStartFrame();
                            int futureEnd = futureStart + futureVar.getDuration() - 1;
                            
                            if (Math.max(currentAssignedStart, futureStart) <= Math.min(currentAssignedEnd, futureEnd)) {
                                toRemove.add(futureValue);
                            }
                        }
                    }
                }
                
                
                
                
                String futureSplitId = futureVar.getSplitGroupId();
                if (currentSplitId != null && !currentSplitId.isEmpty() && currentSplitId.equals(futureSplitId)) {
                    for (DomainValue futureValue : futureVar.getDomain().getValues()) {
                        if (futureValue.getDay() == value.getDay()) {
                            if (!toRemove.contains(futureValue)) {
                                toRemove.add(futureValue);
                            }
                        }
                    }
                }
                
                
                
                
                if (var.getCluster() >= 9 && futureVar.getCourseId().equals(var.getCourseId())) {
                    boolean isFutureLab = futureVar.getType() == LessonType.LAB || 
                                          futureVar.getType() == LessonType.PHYSICS_LAB || 
                                          futureVar.getType() == LessonType.NETWORKING_LAB;
                    
                    Integer allowedStartMin = null;
                    Integer allowedStartMax = null;

                    int nextFrameAfterCurrent = currentAssignedStart + currentDuration; 

                    if (var.getType() == LessonType.LECTURE && futureVar.getType() == LessonType.TUTORIAL) {
                        allowedStartMin = nextFrameAfterCurrent;
                        allowedStartMax = nextFrameAfterCurrent + 2; 
                    }

                    else if ((var.getType() == LessonType.LECTURE || var.getType() == LessonType.TUTORIAL) && isFutureLab) {
                        allowedStartMin = nextFrameAfterCurrent;
                        allowedStartMax = nextFrameAfterCurrent + 5; 
                    }


                    if (allowedStartMin != null && allowedStartMax != null) {
                        for (DomainValue futureValue : futureVar.getDomain().getValues()) {
                            if (futureValue.getDay() != value.getDay() || 
                                futureValue.getStartFrame() < allowedStartMin || 
                                futureValue.getStartFrame() > allowedStartMax) {
                                
                                if (!toRemove.contains(futureValue)) {
                                    toRemove.add(futureValue);
                                }
                            }
                        }
                    }
                }
                
                
                
                

                if (!toRemove.isEmpty()) {
                    removedValues.put(futureVar, toRemove);
                    futureVar.getDomain().getValues().removeAll(toRemove);
                    
                    if (futureVar.getDomain().getValues().isEmpty()) {
                        undoForwardCheck(removedValues); 
                        return null; 
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


    private boolean isTimeAssignmentConsistent(Variable var, DomainValue value, Map<Variable, AssignedValue> assignment) {
        int start1 = value.getStartFrame();
        int end1 = start1 + var.getDuration() - 1;

        if(!clusterOneSundayEveningConstraint.isValid(var, value)) {
            return false;
        }

        for (Map.Entry<Variable, AssignedValue> entry : assignment.entrySet()) {
            Variable assignedVar = entry.getKey();
            AssignedValue assignedTime = entry.getValue();

            if (assignedVar.getLecturer().equals(var.getLecturer())
                    && assignedTime.getDay() == value.getDay()) {

                int start2 = assignedTime.getStartFrame();
                int end2 = start2 + assignedVar.getDuration() - 1;

                if (Math.max(start1, start2) <= Math.min(end1, end2)) {
                    return false;
                }
            }
        }

        if (splitLessonConstraint.isSplitPartAlreadyScheduledToday(var, value, assignment)) {
            return false;
        }

        if (lecturerConstraint.isConsecutiveLimitExceeded(var, value, assignment)) {
            return false;
        }

        if (lecturerConstraint.isDailyLimitExceeded(var, value, assignment)) {
            return false;
        }
        
        if (!electiveCourseSequenceConstraint.isElectiveSequenceValid(var, value, assignment)) {
            return false;
        }

        return true;
    }

    private Set<Classroom> getAvailableSuitableRooms(Variable var, DomainValue value, List<Variable> variables, RoomManager roomManager) {
        int startFrame = value.getStartFrame();

        Set<Classroom> availableRooms =
                new HashSet<>(roomManager.getAvailableRooms(value.getDay(), startFrame));

        availableRooms.removeIf(room -> !roomConstraint.isRoomSuitable(var, room, variables));

        for (int t = 1; t < var.getDuration(); t++) {
            Set<Classroom> nextFrameRooms =
                    roomManager.getAvailableRooms(value.getDay(), startFrame + t);

            if (nextFrameRooms != null) {
                availableRooms.retainAll(nextFrameRooms);
            } else {
                availableRooms.clear();
            }
        }

        return availableRooms;
    }

    private List<AssignedValue> buildAssignedValues(Variable var, DomainValue value, Map<Variable, AssignedValue> assignment, List<Variable> variables, RoomManager roomManager) {
        List<AssignedValue> assignedValues = new ArrayList<>();

        if (!isTimeAssignmentConsistent(var, value, assignment)) {
            return assignedValues;
        }

        Set<Classroom> availableRooms = getAvailableSuitableRooms(var, value, variables, roomManager);

        for (Classroom room : availableRooms) {
            if(electiveLectureLabSameRoomConstraint.isValid(var, room, assignment, variables)) {
                assignedValues.add(new AssignedValue(value.getDay(), value.getStartFrame(), room));
            }
        }

        return assignedValues;
    }

    // private AssignedValue buildAssignedValue(Variable var, DomainValue value, Map<Variable, AssignedValue> assignment , RoomManager roomManager) {
    //         Classroom bookedRoom = isConsistent(var, value, assignment , roomManager);
    //         if (bookedRoom != null) {
    //             return new AssignedValue(value.getDay(), value.getStartFrame(), bookedRoom);
    //         }
    //         return null;
    // }

}
