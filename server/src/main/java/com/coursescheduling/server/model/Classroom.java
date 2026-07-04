package com.coursescheduling.server.model;

public class Classroom {

	private String building;
    private String classroomName;
    private int capacity;
    private RoomType type;

    public Classroom() {}

    // Creates a Classroom instance.
    public Classroom(String building, String classroomName, int capacity, RoomType type) {
        this.building = building;
        this.classroomName = classroomName;
        this.capacity = capacity;
        this.type = type;
    }

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

	// Returns the capacity.
	public int getCapacity() {
		return capacity;
	}

	// Sets the capacity.
	public void setCapacity(int capacity) {
		this.capacity = capacity;
	}

	// Returns the type.
	public RoomType getType() {
		return type;
	}

	// Sets the type.
	public void setType(RoomType type) {
		this.type = type;
	}

}
