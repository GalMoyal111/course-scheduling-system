package com.coursescheduling.server.algorithm.model;

public class DomainValue {
	private int day;
	private int startFrame;

	public DomainValue() {
    }
	
	public DomainValue(int day, int startFrame) {
        this.day = day;
        this.startFrame = startFrame;
    }
	

	public int getDay() {
		return day;
	}
	public void setDay(int day) {
		this.day = day;
	}
	public int getStartFrame() {
		return startFrame;
	}
	public void setStartFrame(int startFrame) {
		this.startFrame = startFrame;
	}

}
