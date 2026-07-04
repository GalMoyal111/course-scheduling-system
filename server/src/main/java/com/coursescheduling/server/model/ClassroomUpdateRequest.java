package com.coursescheduling.server.model;

public class ClassroomUpdateRequest {
	private Classroom oldClassroom;
    private Classroom newClassroom;

    // Returns the old classroom.
    public Classroom getOldClassroom() {
        return oldClassroom;
    }

    // Sets the old classroom.
    public void setOldClassroom(Classroom oldClassroom) {
        this.oldClassroom = oldClassroom;
    }

    // Returns the new classroom.
    public Classroom getNewClassroom() {
        return newClassroom;
    }

    // Sets the new classroom.
    public void setNewClassroom(Classroom newClassroom) {
        this.newClassroom = newClassroom;
    }
}
