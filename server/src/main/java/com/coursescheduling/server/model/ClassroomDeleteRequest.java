package com.coursescheduling.server.model;

public class ClassroomDeleteRequest {

	private String building;
    private String classroomName;

    public ClassroomDeleteRequest() {}

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public String getClassroomName() {
        return classroomName;
    }

    public void setClassroomName(String classroomName) {
        this.classroomName = classroomName;
    }
    
}
