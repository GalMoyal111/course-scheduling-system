package com.coursescheduling.server.algorithm;

import java.util.ArrayList;
import java.util.List;
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
import com.coursescheduling.server.model.RoomType;
import com.coursescheduling.server.model.Semester;
import com.coursescheduling.server.service.ClassroomService;

import java.util.Map;


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
    

    
    private List<DomainValue> getGlobalBlockedSlots() {
	    return List.of(
	        new DomainValue(3, 5),
	        new DomainValue(3, 6)
	    );
	}
    

    // temp - TODO: replace with DB call
    private List<Classroom> getClassrooms() {
        return List.of(
            new Classroom("A", "101", 60, RoomType.NORMAL),
            new Classroom("A", "102", 40, RoomType.NORMAL),
            new Classroom("B", "201", 25, RoomType.LAB)
        );
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
    public List<ScheduledLessonDTO> run(Semester semester) {
    	
    	

        System.out.println("🚀 Starting algorithm...");


        // Step 1: Build variables from semester data
        List<Variable> variables = variableBuilder.createVariables(semester);
        

        // Step 2: Apply constraints to variables
        
        // temp for testing
        List<Classroom> rooms = getClassrooms();
        
        // from DB
        //List<Classroom> rooms = getRealClassroomsFromDB();
        
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

        // Step 3: Run the CSP solver
        System.out.println("⏳ Running CSP Solver...");
        Map<Variable, AssignedValue> solution = csp.solve(variables, roomManager);
        
        // Step 4: Convert solution to DTOs for client response
        List<ScheduledLessonDTO> results = new ArrayList<>();

        // If a solution is found, convert it to DTOs. Otherwise, return an empty list.
        if (solution != null) {
            for (Map.Entry<Variable, AssignedValue> entry : solution.entrySet()) {
                Variable var = entry.getKey();
                AssignedValue val = entry.getValue();
                
                ScheduledLessonDTO dto = new ScheduledLessonDTO(
                    var.getCourseId(),
                    var.getType().name(), 
                    var.getLecturer(),
                    val.getDay(),
                    val.getStartFrame(),
                    var.getDuration(),
                    val.getRoom()
                );
                results.add(dto);
            }
            System.out.println("✅ Solution Found and returning to client!");
        } else {
            System.out.println("❌ No solution could be found.");
        }

        return results;
    }
}