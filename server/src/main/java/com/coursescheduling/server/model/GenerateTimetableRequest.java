package com.coursescheduling.server.model;

import java.util.List;
import java.util.Map;

public class GenerateTimetableRequest {
    
    private Semester semester;
    private Map<String, Double> softConstraintWeights;
    private List<ManualAssignmentDTO> manualAssignments;
    private List<String> hardCourseIds;
    private Map<LessonType, Integer> requiredCapacities;
    private Integer electiveCapacity;
    private List<String> englishCourseIds;

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
	
	public Map<LessonType, Integer> getRequiredCapacities() {
        return requiredCapacities;
    }

    public void setRequiredCapacities(Map<LessonType, Integer> requiredCapacities) {
        this.requiredCapacities = requiredCapacities;
    }
    
    public Integer getElectiveCapacity() {
        return electiveCapacity;
    }

    public void setElectiveCapacity(Integer electiveCapacity) {
        this.electiveCapacity = electiveCapacity;
    }
    
    public List<String> getEnglishCourseIds() {
        return englishCourseIds;
    }

    public void setEnglishCourseIds(List<String> englishCourseIds) {
        this.englishCourseIds = englishCourseIds;
    }
    
}