package com.coursescheduling.server.model;

public class Lesson {
	private String courseId;

    private String courseName;

    private int index;

    private String lecturer;

    private int groupId;

    private LessonType type;

    private int duration;

    private int splitGroupId;

    private Semester semester;

    private int credits;

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

	public int getIndex() {
		return index;
	}

	public void setIndex(int index) {
		this.index = index;
	}

	public String getLecturer() {
		return lecturer;
	}

	public void setLecturer(String lecturer) {
		this.lecturer = lecturer;
	}

	public int getGroupId() {
		return groupId;
	}

	public void setGroupId(int groupId) {
		this.groupId = groupId;
	}

	public LessonType getType() {
	    return type;
	}

	public void setType(LessonType type) {
	    this.type = type;
	}

	public int getDuration() {
		return duration;
	}

	public void setDuration(int duration) {
		this.duration = duration;
	}

	public int getSplitGroupId() {
		return splitGroupId;
	}

	public void setSplitGroupId(int splitGroupId) {
		this.splitGroupId = splitGroupId;
	}

	public Semester getSemester() {
	    return semester;
	}

	public void setSemester(Semester semester) {
	    this.semester = semester;
	}

	public int getCredits() {
		return credits;
	}

	public void setCredits(int credits) {
		this.credits = credits;
	}
	
    
	

}