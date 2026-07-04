package com.coursescheduling.server.algorithm.model;

public class DomainValue {
	private int day;
	private int startFrame;

	// Creates a DomainValue instance.
	public DomainValue() {
    }
	
	// Creates a DomainValue instance.
	public DomainValue(int day, int startFrame) {
        this.day = day;
        this.startFrame = startFrame;
    }
	

	// Returns the day.
	public int getDay() {
		return day;
	}
	// Sets the day.
	public void setDay(int day) {
		this.day = day;
	}
	// Returns the start frame.
	public int getStartFrame() {
		return startFrame;
	}
	// Sets the start frame.
	public void setStartFrame(int startFrame) {
		this.startFrame = startFrame;
	}

}
