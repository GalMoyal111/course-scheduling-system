package com.coursescheduling.server.algorithm;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.algorithm.preprocessing.DomainConstraintService;
import com.coursescheduling.server.algorithm.preprocessing.VariableBuilder;
import com.coursescheduling.server.model.Semester;

@Service
public class TimetableAlgorithmService {

    @Autowired
    private VariableBuilder variableBuilder;

    @Autowired
    private DomainConstraintService constraintService;

    public void run(Semester semester) {

        System.out.println("🚀 Starting algorithm...");

        List<Variable> variables = variableBuilder.createVariables(semester);

        constraintService.applyLecturerConstraints(variables);

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