package com.coursescheduling.server.model;

import java.util.List;
import java.util.Map;

public class GenerateTimetableRequest {
    
    private Semester semester;
    private Map<String, Double> softConstraintWeights;
    private List<ManualAssignmentDTO> manualAssignments;
    private List<String> hardCourseIds;

    public List<String> getHardCourseIds() {
		return hardCourseIds;
	}

	public void setHardCourseIds(List<String> hardCourseIds) {
		this.hardCourseIds = hardCourseIds;
	}

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

	public List<ManualAssignmentDTO> getManualAssignments() {
		return manualAssignments;
	}

	public void setManualAssignments(List<ManualAssignmentDTO> manualAssignments) {
		this.manualAssignments = manualAssignments;
	}
}