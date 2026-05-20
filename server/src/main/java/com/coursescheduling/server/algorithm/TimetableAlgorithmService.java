package com.coursescheduling.server.algorithm;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Comparator;
import java.util.HashMap;

import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.solver.CSP;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.coursescheduling.server.algorithm.model.DomainValue;
import com.coursescheduling.server.algorithm.model.ScheduledLessonDTO;
import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.algorithm.preprocessing.DomainConstraintService;
import com.coursescheduling.server.algorithm.preprocessing.VariableBuilder;
import com.coursescheduling.server.algorithm.solver.RoomManager;
import com.coursescheduling.server.model.Classroom;
import com.coursescheduling.server.model.Course;
import com.coursescheduling.server.model.GenerateTimetableRequest;
import com.coursescheduling.server.model.LessonType;
import com.coursescheduling.server.model.ManualAssignmentDTO;
import com.coursescheduling.server.model.RoomType;
import com.coursescheduling.server.model.Semester;
import com.coursescheduling.server.service.ClassroomService;
import com.coursescheduling.server.service.ClusterService;
import com.coursescheduling.server.service.CourseService;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.CancellationException;

/*
    * This service orchestrates the entire timetable generation process. It:
    * 1. Builds variables based on the semester data.
    * 2. Applies global and specific constraints to the variables.
    * 3. Invokes the CSP solver to find a valid timetable
*/
@Service
public class TimetableAlgorithmService {

    @Autowired
    private VariableBuilder variableBuilder;

    @Autowired
    private DomainConstraintService constraintService;
    
    @Autowired
    private CSP csp;
    
    @Autowired
    private ClassroomService classroomService;
    
    @Autowired
    private CourseService courseService;
    
    @Autowired
    private ClusterService clusterService;
    
    private final Random random = new Random();
    
    private List<DomainValue> getGlobalBlockedSlots() {
        try {
            List<Map<String, Integer>> blockedSlots = clusterService.getSystemAvailability();
            List<DomainValue> globalSlots = new ArrayList<>();
            
            for (Map<String, Integer> slot : blockedSlots) {
                if (slot.containsKey("day") && slot.containsKey("startFrame")) {
                    globalSlots.add(new DomainValue(slot.get("day"), slot.get("startFrame")));
                }
            }
            
            System.out.println("🔒 Applied " + globalSlots.size() + " global blocked slots from settings.");
            return globalSlots;
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching global blocked slots from Firestore: " + e.getMessage());
            return new ArrayList<>(); 
        }
    }
    
    
    private List<Classroom> getRealClassroomsFromDB() {
        try {
            return classroomService.getAllClassrooms();
        } catch (Exception e) {
            System.err.println("❌ Error fetching classrooms from Firestore: " + e.getMessage());
            return new ArrayList<>(); 
        }
    }
    
    
    
    // Main method to run the algorithm
    public List<ScheduledLessonDTO> run(GenerateTimetableRequest request) {
  	
    	if (csp != null) {
            csp.resetCancelFlag(); 
    	}
    	
    	Semester semester = request.getSemester();
    	Map<String, Double> userWeights = request.getSoftConstraintWeights();
    	List<String> englishCourseIds= request.getEnglishCourseIds();
    	if(englishCourseIds == null) englishCourseIds = new ArrayList<>();
    	
    	List<String> virtualCourseIds = request.getVirtualCourseIds();
    	
    	Map<LessonType, Integer> capacities = request.getRequiredCapacities();
    	for (Map.Entry<LessonType, Integer> entry : capacities.entrySet()) {
    	    System.out.println("Key: " + entry.getKey() + ", Value: " + entry.getValue());
    	}
    	
        List<String> hardCourseIds = request.getHardCourseIds();
        
        Integer electiveCapacity = request.getElectiveCapacity();
        System.out.println("electiveCapacity:" + electiveCapacity);
        System.out.println("🚀 Starting algorithm...");


        // Step 1: Build variables from semester data
        List<Variable> variables = variableBuilder.createVariables(semester, capacities, hardCourseIds, englishCourseIds,virtualCourseIds, electiveCapacity);
        
     
        // Step 2: Apply constraints to variables
        

        // from DB
        List<Classroom> rooms = getRealClassroomsFromDB();
        
        if (rooms.isEmpty()) {
            System.out.println("❌ No classrooms found. Algorithm cannot run.");
            return new ArrayList<>();
        }
        
        RoomManager roomManager = new RoomManager(rooms);
        
        // Global constraints (e.g., blocked time slots)
        List<DomainValue> globalSlots = getGlobalBlockedSlots();
        constraintService.applyGlobalConstraints(variables, globalSlots);     

        
        constraintService.applyLecturerConstraints(variables);
        
        constraintService.applyDurationConstraints(variables);
        
        
        // Additional constraints can be applied here (e.g., course-specific, room-specific)
        
        sortVariablesForCSP(variables);
        
        System.out.println("📋 Variables Order After Sorting:");
        System.out.printf("%-10s | %-20s | %-10s | %-15s | %-10s%n", "Cluster", "Course ID", "Credits", "Type", "Lecturer");
        System.out.println("-".repeat(75));
        for (Variable v : variables) {
            System.out.printf("%-10d | %-20s | %-10.1f | %-15s | %-10s%n",
                    v.getCluster(),
                    v.getCourseId(),
                    v.getCredits(),
                    v.getType(),
                    v.getLecturer() != null ? v.getLecturer() : "TBD");
        }
        System.out.println("-".repeat(75));
     
        
        Map<Variable, AssignedValue> initialAssignment = new HashMap<>();
        List<ManualAssignmentDTO> manualAssignments = request.getManualAssignments();
        
        if (manualAssignments != null && !manualAssignments.isEmpty()) {
            for (ManualAssignmentDTO manualDTO : manualAssignments) {
                Variable matchingVar = variables.stream()
                        .filter(v -> v.getLessonId().equals(manualDTO.getLessonId()))
                        .findFirst()
                        .orElse(null);

                Classroom matchingRoom = rooms.stream()
                        .filter(r -> r.getClassroomName().equals(manualDTO.getClassroomName()))
                        .findFirst()
                        .orElse(null);

                if (matchingVar != null && matchingRoom != null) {
                    AssignedValue assignedValue = new AssignedValue(manualDTO.getDay(), manualDTO.getStartFrame(), matchingRoom);
                    initialAssignment.put(matchingVar, assignedValue);
                    
                    DomainValue chosenDomainValue = new DomainValue(manualDTO.getDay(), manualDTO.getStartFrame());
                    matchingVar.getDomain().getValues().clear();
                    matchingVar.getDomain().getValues().add(chosenDomainValue);
                    
                    System.out.println("📌 Applied Manual Assignment: " + matchingVar.getCourseId() + " to Room: " + matchingRoom.getClassroomName() + " on Day " + manualDTO.getDay());
                } else {
                    System.out.println("⚠️ Warning: Could not map manual assignment for lessonId: " + manualDTO.getLessonId());

                }
            }
        }
        
        for (Variable v : variables) {
            if (v.getDomain().getValues().isEmpty()) {
                System.out.println("❌ Variable has empty domain: " + v.getCourseId());

                throw new RuntimeException(
                    "No suitable schedule found. One or more lessons have no available time slots due to constraints."
                );
            }
        }
        
        for (Variable v : variables) {
            String lecturer = v.getLecturer();
            if (lecturer == null) continue;
            
            int totalHoursNeeded = variables.stream()
                    .filter(var -> lecturer.equals(var.getLecturer()))
                    .mapToInt(Variable::getDuration)
                    .sum();
                    
            long totalAvailableSlots = v.getDomain().getValues().size(); 

            if (totalHoursNeeded > totalAvailableSlots) {
                System.out.println("Lecturer Overload: " + lecturer + " needs " + totalHoursNeeded + " hours but only has " + totalAvailableSlots + " available slots.");
                throw new RuntimeException("Lecturer " + lecturer + " has more hours assigned than their total availability. Please check their unavailable slots.");
            }
        }
        
        

        // Step 3: Run the CSP solver
        
        
        if (csp.isCancelled()) {
            System.out.println("Algorithm Service: Cancelled during preprocessing! Aborting.");
            return new ArrayList<>(); 
        }
        System.out.println("⏳ Running CSP Solver...");
        
        try {
        	Map<Variable, AssignedValue> solution = csp.solve(variables, roomManager, userWeights, initialAssignment);
        	
        	if (solution == null) {
                System.out.println("No solution could be found.");
                throw new RuntimeException("No suitable schedule found. This usually happens when manual assignments or lecturer constraints create a conflict. If you've placed manual assignments, consider removing them and trying again.");
        	}
        	
            // Step 4: Convert solution to DTOs for client response
            List<ScheduledLessonDTO> results = new ArrayList<>();

            for (Map.Entry<Variable, AssignedValue> entry : solution.entrySet()) {
                Variable var = entry.getKey();
                AssignedValue val = entry.getValue();
                
                String courseName = "";
                Course courseObj = courseService.getCourseById(var.getCourseId());
                if (courseObj != null && courseObj.getCourseName() != null) {
                    courseName = courseObj.getCourseName();
                }
                
                ScheduledLessonDTO dto = new ScheduledLessonDTO(
                    var.getCourseId(),
                    courseName,          
                    var.getType().name(), 
                    var.getLecturer(),
                    val.getDay(),
                    val.getStartFrame(),
                    var.getDuration(),
                    val.getRoom(),
                    var.getCluster(), 
                    var.getLessonId()
                );
                results.add(dto);
            }
            System.out.println("Solution Found and returning to client!");

            return results;
        	
        } catch (CancellationException e) {
            System.out.println("CSP Solver stopped due to user cancellation.");
        	throw new RuntimeException("CANCELLED_BY_USER");
		}
        
        
        
    }
    
    
    public void sortVariablesForCSP(List<Variable> variables) {
        variables.sort(
            Comparator.comparingInt(Variable::getCluster)
            
            .thenComparingDouble(v -> -v.getCredits())
            
            .thenComparing(Variable::getCourseId)
            
            .thenComparingInt(v -> v.getType().getPriority())
        );
        
        int start = 0;

        while (start < variables.size()) {

            int end = start + 1;

            while (end < variables.size()
                    && variables.get(start).getCourseId().equals(variables.get(end).getCourseId())
                    && variables.get(start).getType() == variables.get(end).getType()) {

                end++;
            }

            if (end - start > 1) {
                Collections.shuffle(variables.subList(start, end), random);
            }

            start = end;
        }
    }
    
    
    public void cancelAlgorithm() {
        if (csp != null) {
            csp.cancel();
            System.out.println("Cancel signal sent to CSP!");
        }
    }
    
    
}