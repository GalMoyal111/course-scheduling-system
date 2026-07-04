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
	private String lessonId;
    
    
	public ScheduledLessonDTO(String courseId,String courseName, String type, String lecturer, int day, 
		int startFrame, int duration, Classroom room, int cluster, String lessonId) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.type = type;
        this.lecturer = lecturer;
        this.day = day;
        this.startFrame = startFrame;
        this.duration = duration;
        this.room = room;
		this.cluster = cluster;
		this.lessonId = lessonId;
    }

	// Creates a ScheduledLessonDTO instance.
	public ScheduledLessonDTO() {
    }

	// Returns the course id.
	public String getCourseId() {
		return courseId;
	}


	// Sets the course id.
	public void setCourseId(String courseId) {
		this.courseId = courseId;
	}
	
	// Returns the course name.
	public String getCourseName() {
		return courseName;
	}

	// Sets the course name.
	public void setCourseName(String courseName) {
		this.courseName = courseName;
	}


	// Returns the type.
	public String getType() {
		return type;
	}


	// Sets the type.
	public void setType(String type) {
		this.type = type;
	}


	// Returns the lecturer.
	public String getLecturer() {
		return lecturer;
	}


	// Sets the lecturer.
	public void setLecturer(String lecturer) {
		this.lecturer = lecturer;
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


	// Returns the duration.
	public int getDuration() {
		return duration;
	}


	// Sets the duration.
	public void setDuration(int duration) {
		this.duration = duration;
	}


	// Returns the room.
	public Classroom getRoom() {
		return room;
	}


	// Sets the room.
	public void setRoom(Classroom room) {
		this.room = room;
	}


	// Returns the cluster.
	public int getCluster() {
		return cluster;
	}


	// Sets the cluster.
	public void setCluster(int cluster) {
		this.cluster = cluster;
	}

	// Returns the lesson id.
	public String getLessonId() {
		return lessonId;
	}

	// Sets the lesson id.
	public void setLessonId(String lessonId) {
		this.lessonId = lessonId;
	}


}
