package com.coursescheduling.server.model;

public class Course {
    private int cluster;
    private String courseId;
    private String courseName;
    private String prerequisiteCourseNumberOrConditions;
    private int lectureHours;
    private int tutorialHours;
    private int labHours;
    private int projectHours;
    private float credits;
    private String notes;
    private String clusterName;

    public Course() {}

    public Course(int cluster, String courseId, String courseName, String prerequisiteCourseNumberOrConditions,
                  int lectureHours, int tutorialHours, int labHours, int projectHours, float credits, String notes, String clusterName) {
        this.cluster = cluster;
        this.courseId = courseId;
        this.courseName = courseName;
        this.prerequisiteCourseNumberOrConditions = prerequisiteCourseNumberOrConditions;
        this.lectureHours = lectureHours;
        this.tutorialHours = tutorialHours;
        this.labHours = labHours;
        this.projectHours = projectHours;
        this.credits = credits;
        this.notes = notes;
        this.clusterName = clusterName;
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

    public String getPrerequisiteCourseNumberOrConditions() {
        return prerequisiteCourseNumberOrConditions;
    }

    public void setPrerequisiteCourseNumberOrConditions(String prerequisiteCourseNumberOrConditions) {
        this.prerequisiteCourseNumberOrConditions = prerequisiteCourseNumberOrConditions;
    }

    public int getLectureHours() {
        return lectureHours;
    }

    public void setLectureHours(int lectureHours) {
        this.lectureHours = lectureHours;
    }

    public int getTutorialHours() {
        return tutorialHours;
    }

    public void setTutorialHours(int tutorialHours) {
        this.tutorialHours = tutorialHours;
    }

    public int getLabHours() {
        return labHours;
    }

    public void setLabHours(int labHours) {
        this.labHours = labHours;
    }

    public int getProjectHours() {
        return projectHours;
    }

    public void setProjectHours(int projectHours) {
        this.projectHours = projectHours;
    }

    

    public int getCluster() {
		return cluster;
	}

	public void setCluster(int cluster) {
		this.cluster = cluster;
	}

	public float getCredits() {
		return credits;
	}

	public void setCredits(float credits) {
		this.credits = credits;
	}

	public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getClusterName() {
        return clusterName;
    }

    public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }
}
