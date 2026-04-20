package com.coursescheduling.server.model;

import java.util.Map;

public class GenerateTimetableRequest {
    
    private Semester semester;
    private Map<String, Double> softConstraintWeights;

    public GenerateTimetableRequest() {
    }

    public Semester getSemester() {
        return semester;
    }

    public void setSemester(Semester semester) {
        this.semester = semester;
    }

    public Map<String, Double> getSoftConstraintWeights() {
        return softConstraintWeights;
    }

    public void setSoftConstraintWeights(Map<String, Double> softConstraintWeights) {
        this.softConstraintWeights = softConstraintWeights;
    }
}