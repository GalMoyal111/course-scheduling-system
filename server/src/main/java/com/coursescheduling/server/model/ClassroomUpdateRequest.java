package com.coursescheduling.server.model;

public class ClassroomUpdateRequest {
	private Classroom oldClassroom;
    private Classroom newClassroom;

    public Classroom getOldClassroom() {
        return oldClassroom;
    }

    public void setOldClassroom(Classroom oldClassroom) {
        this.oldClassroom = oldClassroom;
    }

    public Classroom getNewClassroom() {
        return newClassroom;
    }

    public void setNewClassroom(Classroom newClassroom) {
        this.newClassroom = newClassroom;
    }
}
