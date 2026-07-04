package com.coursescheduling.server.model;

public class ClassroomDeleteRequest {

	private String building;
    private String classroomName;

    public ClassroomDeleteRequest() {}

    // Returns the building.
    public String getBuilding() {
        return building;
    }

    // Sets the building.
    public void setBuilding(String building) {
        this.building = building;
    }

    // Returns the classroom name.
    public String getClassroomName() {
        return classroomName;
    }

    // Sets the classroom name.
    public void setClassroomName(String classroomName) {
        this.classroomName = classroomName;
    }
    
}
