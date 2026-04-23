package com.coursescheduling.server.algorithm.model;
import com.coursescheduling.server.model.Classroom;


public class ScheduledLessonDTO {
	
	private String courseId;
	private String courseName;
    private String type;
    private String lecturer;
    private int day;
    private int startFrame;
    private int duration;
    private Classroom room;
	private int cluster;
    
    
	public ScheduledLessonDTO(String courseId,String courseName, String type, String lecturer, int day, int startFrame, int duration, Classroom room, int cluster) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.type = type;
        this.lecturer = lecturer;
        this.day = day;
        this.startFrame = startFrame;
        this.duration = duration;
        this.room = room;
		this.cluster = cluster;
    }


	public String getCourseId() {
		return courseId;
	}


	public void setCourseId(String courseId) {
		this.courseId = courseId;
	}
	
	public String getCourseName() {
		return courseName;
	}

	public void setCourseName(String courseName) {
		this.courseName = courseName;
	}


	public String getType() {
		return type;
	}


	public void setType(String type) {
		this.type = type;
	}


	public String getLecturer() {
		return lecturer;
	}


	public void setLecturer(String lecturer) {
		this.lecturer = lecturer;
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


	public int getDuration() {
		return duration;
	}


	public void setDuration(int duration) {
		this.duration = duration;
	}


	public Classroom getRoom() {
		return room;
	}


	public void setRoom(Classroom room) {
		this.room = room;
	}


	public int getCluster() {
		return cluster;
	}


	public void setCluster(int cluster) {
		this.cluster = cluster;
	}


}
