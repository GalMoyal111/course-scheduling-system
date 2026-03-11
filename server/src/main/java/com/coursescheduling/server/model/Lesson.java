package com.coursescheduling.server.model;

// Represents a single lesson (e.g., lecture, lab, seminar) of a course, with all relevant properties.
public class Lesson {
	private String courseId; // e.g., "11101"

    private String courseName; // e.g., "Introduction to Computer Science"

    private int index; // Sequential index for lessons of the same course+semester, assigned after sorting.

    private String lecturer; // e.g., "Dr. Smith"

    private int groupId; // the first semester is group 1, the second semester is group 2, etc.

    private LessonType type; // e.g., LECTURE, LAB, SEMINAR

    private int duration;  // duration in hours

    private int splitGroupId;  // for splitting lessons of 4 hours into two 2-hour lessons. 0 means no split.

    private Semester semester; // 1 for first semester, 2 for second semester, summer for summer semester

    private double credits; // number of credits for this lesson

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

	public double getCredits() {
		return credits;
	}

	public void setCredits(double credits2) {
		this.credits = credits2;
	}
	
    
	

}