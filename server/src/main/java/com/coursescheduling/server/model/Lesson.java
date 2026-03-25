package com.coursescheduling.server.model;

// Represents a single lesson (e.g., lecture, lab, seminar) of a course, with all relevant properties.
public class Lesson {
	private String courseId; // e.g., "11101"

    private String courseName; // e.g., "Introduction to Computer Science"

    private String lessonId; 

    private String lecturer; // e.g., "Dr. Smith"

    private int cluster; // the first semester is group 1, the second semester is group 2, etc.

    private LessonType type; // e.g., LECTURE, LAB, SEMINAR

    private int duration;  // duration in hours

    private String splitGroupId;  // for splitting lessons of 4 hours into two 2-hour lessons. 0 means no split.

    private Semester semester; // 1 for first semester, 2 for second semester, summer for summer semester

    private float credits; // number of credits for this lesson

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


	public String getLessonId() {
		return lessonId;
	}

	public void setLessonId(String lessonId) {
		this.lessonId = lessonId;
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

	public void setCluster(int groupId) {
		this.cluster = groupId;
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

	public Semester getSemester() {
	    return semester;
	}

	public void setSemester(Semester semester) {
	    this.semester = semester;
	}

	public float getCredits() {
		return credits;
	}

	public void setCredits(float credits2) {
		this.credits = credits2;
	}
	
    
	

}