package com.coursescheduling.server.algorithm.model;

import java.util.ArrayList;
import java.util.List;

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
	private Domain domain;
	
	private List<DomainValue> nonPreferredSlots = new ArrayList<>();
	private int requiredCapacity;
	private boolean isEnglishCourse = false;
	private boolean isVirtual = false;
	
	
	
	
	// Returns the domain.
	public Domain getDomain() {
		return domain;
	}
	// Returns the required capacity.
	public int getRequiredCapacity() {
		return requiredCapacity;
	}
	// Sets the required capacity.
	public void setRequiredCapacity(int requiredCapacity) {
		this.requiredCapacity = requiredCapacity;
	}
	// Sets the domain.
	public void setDomain(Domain domain) {
		this.domain = domain;
	}
	// Returns the lesson id.
	public String getLessonId() {
		return lessonId;
	}
	// Sets the lesson id.
	public void setLessonId(String lessonId) {
		this.lessonId = lessonId;
	}
	// Returns the course id.
	public String getCourseId() {
		return courseId;
	}
	// Sets the course id.
	public void setCourseId(String courseId) {
		this.courseId = courseId;
	}
	// Returns the lecturer.
	public String getLecturer() {
		return lecturer;
	}
	// Sets the lecturer.
	public void setLecturer(String lecturer) {
		this.lecturer = lecturer;
	}
	// Returns the cluster.
	public int getCluster() {
		return cluster;
	}
	// Sets the cluster.
	public void setCluster(int cluster) {
		this.cluster = cluster;
	}
	// Returns the type.
	public LessonType getType() {
		return type;
	}
	// Sets the type.
	public void setType(LessonType type) {
		this.type = type;
	}
	// Returns the duration.
	public int getDuration() {
		return duration;
	}
	// Sets the duration.
	public void setDuration(int duration) {
		this.duration = duration;
	}
	// Returns the split group id.
	public String getSplitGroupId() {
		return splitGroupId;
	}
	// Sets the split group id.
	public void setSplitGroupId(String splitGroupId) {
		this.splitGroupId = splitGroupId;
	}
	// Returns the index.
	public int getIndex() {
		return index;
	}
	// Sets the index.
	public void setIndex(int index) {
		this.index = index;
	}
	// Returns the credits.
	public float getCredits() {
		return credits;
	}
	// Sets the credits.
	public void setCredits(float credits) {
		this.credits = credits;
	}
	// Returns the is hard course.
	public Boolean getIsHardCourse() {
		return isHardCourse;
	}
	// Sets the is hard course.
	public void setIsHardCourse(Boolean isHardCourse) {
		this.isHardCourse = isHardCourse;
	}
	
	
	// Returns the non preferred slots.
	public List<DomainValue> getNonPreferredSlots() {
	    return nonPreferredSlots;
	}

	// Sets the non preferred slots.
	public void setNonPreferredSlots(List<DomainValue> nonPreferredSlots) {
	    this.nonPreferredSlots = nonPreferredSlots;
	}
	
	// Checks whether english course.
	public boolean isEnglishCourse() {
        return isEnglishCourse;
    }

    // Sets the english course.
    public void setEnglishCourse(boolean englishCourse) {
        isEnglishCourse = englishCourse;
    }
    
    // Checks whether virtual.
    public boolean isVirtual() {
        return isVirtual;
    }

    // Sets the virtual.
    public void setVirtual(boolean virtual) {
        isVirtual = virtual;
    }
	
}
