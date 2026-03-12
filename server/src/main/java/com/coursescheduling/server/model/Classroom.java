package com.coursescheduling.server.model;

public class Classroom {

	private String building;
    private String classroomName;
    private int capacity;
    private String type;

    public Classroom() {}

    public Classroom(String building, String classroomName, int capacity, String type) {
        this.building = building;
        this.classroomName = classroomName;
        this.capacity = capacity;
        this.type = type;
    }

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

	public int getCapacity() {
		return capacity;
	}

	public void setCapacity(int capacity) {
		this.capacity = capacity;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

}