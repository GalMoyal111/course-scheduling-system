package com.coursescheduling.server.algorithm.model;

import com.coursescheduling.server.model.LessonType;

public class Variable {

	private String lessonId;
	private String courseId;
	private String lecturer;
	private int cluster;
	private LessonType type;
	private int duration;
	private String splitGroupId;
	private int index;
	private float credits;
	private Boolean isHardCourse;
	
	
	
	public String getLessonId() {
		return lessonId;
	}
	public void setLessonId(String lessonId) {
		this.lessonId = lessonId;
	}
	public String getCourseId() {
		return courseId;
	}
	public void setCourseId(String courseId) {
		this.courseId = courseId;
	}
	public String getLecturer() {
		return lecturer;
	}
	public void setLecturer(String lecturer) {
		this.lecturer = lecturer;
	}
	public int getCluster() {
		return cluster;
	}
	public void setCluster(int cluster) {
		this.cluster = cluster;
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
	public String getSplitGroupId() {
		return splitGroupId;
	}
	public void setSplitGroupId(String splitGroupId) {
		this.splitGroupId = splitGroupId;
	}
	public int getIndex() {
		return index;
	}
	public void setIndex(int index) {
		this.index = index;
	}
	public float getCredits() {
		return credits;
	}
	public void setCredits(float credits) {
		this.credits = credits;
	}
	public Boolean getIsHardCourse() {
		return isHardCourse;
	}
	public void setIsHardCourse(Boolean isHardCourse) {
		this.isHardCourse = isHardCourse;
	}
	
	
}
