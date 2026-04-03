package com.coursescheduling.server.algorithm;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.coursescheduling.server.algorithm.model.DomainValue;
import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.algorithm.preprocessing.DomainConstraintService;
import com.coursescheduling.server.algorithm.preprocessing.VariableBuilder;
import com.coursescheduling.server.algorithm.solver.RoomManager;
import com.coursescheduling.server.model.Classroom;
import com.coursescheduling.server.model.Semester;

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
    
    

    public void run(Semester semester) {
    	
    	

        System.out.println("🚀 Starting algorithm...");

        List<Variable> variables = variableBuilder.createVariables(semester);
        
        List<Classroom> rooms = getClassrooms();
        RoomManager roomManager = new RoomManager(rooms);
        
        
        List<DomainValue> globalSlots = getGlobalBlockedSlots();
        constraintService.applyGlobalConstraints(variables, globalSlots);     

        constraintService.applyLecturerConstraints(variables);
        
        constraintService.applyDurationConstraints(variables);

        for (Variable v : variables) {
            System.out.println(
                v.getCourseId() +
                " | " + v.getType() +
                " | domain size = " + v.getDomain().getValues().size()
            );
        }

        System.out.println("✅ Algorithm finished");
    }
}