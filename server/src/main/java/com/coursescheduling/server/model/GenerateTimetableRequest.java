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
    
    private List<String> virtualCourseIds;

    // Returns the hard course ids.
    public List<String> getHardCourseIds() {
		return hardCourseIds;
	}

	// Sets the hard course ids.
	public void setHardCourseIds(List<String> hardCourseIds) {
		this.hardCourseIds = hardCourseIds;
	}

	// Creates a GenerateTimetableRequest instance.
	public GenerateTimetableRequest() {
    }

    // Returns the semester.
    public Semester getSemester() {
        return semester;
    }

    // Sets the semester.
    public void setSemester(Semester semester) {
        this.semester = semester;
    }

    // Returns the soft constraint weights.
    public Map<String, Double> getSoftConstraintWeights() {
        return softConstraintWeights;
    }

    // Sets the soft constraint weights.
    public void setSoftConstraintWeights(Map<String, Double> softConstraintWeights) {
        this.softConstraintWeights = softConstraintWeights;
    }

	// Returns the manual assignments.
	public List<ManualAssignmentDTO> getManualAssignments() {
		return manualAssignments;
	}

	// Sets the manual assignments.
	public void setManualAssignments(List<ManualAssignmentDTO> manualAssignments) {
		this.manualAssignments = manualAssignments;
	}
	
	// Returns the required capacities.
	public Map<LessonType, Integer> getRequiredCapacities() {
        return requiredCapacities;
    }

    // Sets the required capacities.
    public void setRequiredCapacities(Map<LessonType, Integer> requiredCapacities) {
        this.requiredCapacities = requiredCapacities;
    }
    
    // Returns the elective capacity.
    public Integer getElectiveCapacity() {
        return electiveCapacity;
    }

    // Sets the elective capacity.
    public void setElectiveCapacity(Integer electiveCapacity) {
        this.electiveCapacity = electiveCapacity;
    }
    
    // Returns the english course ids.
    public List<String> getEnglishCourseIds() {
        return englishCourseIds;
    }

    // Sets the english course ids.
    public void setEnglishCourseIds(List<String> englishCourseIds) {
        this.englishCourseIds = englishCourseIds;
    }
    
    // Returns the virtual course ids.
    public List<String> getVirtualCourseIds() {
        return virtualCourseIds;
    }

    // Sets the virtual course ids.
    public void setVirtualCourseIds(List<String> virtualCourseIds) {
        this.virtualCourseIds = virtualCourseIds;
    }
    
}
