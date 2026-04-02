package com.coursescheduling.server.algorithm.model;

public class DomainValue {
	private int day;
	private int startFrame;
	private String roomId;
	private boolean isOccupied;
	
	
	
	
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
	public String getRoomId() {
		return roomId;
	}
	public void setRoomId(String roomId) {
		this.roomId = roomId;
	}
	public boolean isOccupied() {
		return isOccupied;
	}
	public void setOccupied(boolean isOccupied) {
		this.isOccupied = isOccupied;
	}
	
	
}
