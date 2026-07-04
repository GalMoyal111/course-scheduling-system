package com.coursescheduling.server.algorithm.model;

import com.coursescheduling.server.model.Classroom;

public class AssignedValue extends DomainValue{
	
	private Classroom room;
	
	// Creates a AssignedValue instance.
	public AssignedValue(int day, int startFrame, Classroom room) {
        super(day, startFrame); 
        this.room = room;
    }

    // Returns the room.
    public Classroom getRoom() {
        return room;
    }

    // Sets the room.
    public void setRoom(Classroom room) {
        this.room = room;
    }

}
