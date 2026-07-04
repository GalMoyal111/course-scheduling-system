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

    private Semester semester; // 1 for first semester, 2 for second semester

    private float credits; // number of credits for this lesson

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


	// Returns the lesson id.
	public String getLessonId() {
		return lessonId;
	}

	// Sets the lesson id.
	public void setLessonId(String lessonId) {
		this.lessonId = lessonId;
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
	public void setCluster(int groupId) {
		this.cluster = groupId;
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

	// Returns the semester.
	public Semester getSemester() {
	    return semester;
	}

	// Sets the semester.
	public void setSemester(Semester semester) {
	    this.semester = semester;
	}

	// Returns the credits.
	public float getCredits() {
		return credits;
	}

	// Sets the credits.
	public void setCredits(float credits2) {
		this.credits = credits2;
	}
	
    
	

}
