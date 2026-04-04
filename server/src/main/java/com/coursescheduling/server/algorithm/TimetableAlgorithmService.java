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
import com.coursescheduling.server.model.Semester;
import java.util.Map;

@Service
public class TimetableAlgorithmService {

    @Autowired
    private VariableBuilder variableBuilder;

    @Autowired
    private DomainConstraintService constraintService;
    
    private List<DomainValue> getGlobalBlockedSlots() {
	    return List.of(
	        new DomainValue(3, 5),
	        new DomainValue(3, 6)
	    );
	}
    
    private List<Classroom> getClassrooms() {
        return List.of(
            new Classroom("A", "101", 60, "LECTURE"),
            new Classroom("A", "102", 40, "TUTORIAL"),
            new Classroom("B", "201", 25, "LAB")
        );
    }
    
    

    public List<ScheduledLessonDTO> run(Semester semester) {
    	
    	

        System.out.println("🚀 Starting algorithm...");

        List<Variable> variables = variableBuilder.createVariables(semester);
        
        List<Classroom> rooms = getClassrooms();
        RoomManager roomManager = new RoomManager(rooms);
        
        
        List<DomainValue> globalSlots = getGlobalBlockedSlots();
        constraintService.applyGlobalConstraints(variables, globalSlots);     

        constraintService.applyLecturerConstraints(variables);
        
        constraintService.applyDurationConstraints(variables);
        
        
        // CSP run
        
        System.out.println("⏳ Running CSP Solver...");
        CSP csp = new CSP(roomManager);
        Map<Variable, AssignedValue> solution = csp.solve(variables);
        
        
        List<ScheduledLessonDTO> results = new ArrayList<>();

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