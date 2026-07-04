package com.coursescheduling.server.model;

public class Course {
    private int cluster;
    private String courseId;
    private String courseName;
    private String prerequisiteCourseNumber;
    private int lectureHours;
    private int tutorialHours;
    private int labHours;
    private int projectHours;
    private float credits;
    private String clusterName;
    private Integer lectureNumberStudents;
    private Integer tutorialNumberStudents;
    private Integer labNumberStudents;

    public Course() {}

    public Course(int cluster, String courseId, String courseName, String prerequisiteCourseNumber,
                  int lectureHours, int tutorialHours, int labHours, int projectHours, float credits, String clusterName,
                  Integer lectureNumberStudents, Integer tutorialNumberStudents, Integer labNumberStudents) {
        this.cluster = cluster;
        this.courseId = courseId;
        this.courseName = courseName;
        this.prerequisiteCourseNumber = prerequisiteCourseNumber;
        this.lectureHours = lectureHours;
        this.tutorialHours = tutorialHours;
        this.labHours = labHours;
        this.projectHours = projectHours;
        this.credits = credits;
        this.clusterName = clusterName;
        this.lectureNumberStudents = lectureNumberStudents;
        this.tutorialNumberStudents = tutorialNumberStudents;
        this.labNumberStudents = labNumberStudents;
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

    // Returns the prerequisite course number.
    public String getPrerequisiteCourseNumber() {
        return prerequisiteCourseNumber;
    }

    // Sets the prerequisite course number.
    public void setPrerequisiteCourseNumber(String prerequisiteCourseNumber) {
        this.prerequisiteCourseNumber = prerequisiteCourseNumber;
    }

    // Returns the lecture hours.
    public int getLectureHours() {
        return lectureHours;
    }

    // Sets the lecture hours.
    public void setLectureHours(int lectureHours) {
        this.lectureHours = lectureHours;
    }

    // Returns the tutorial hours.
    public int getTutorialHours() {
        return tutorialHours;
    }

    // Sets the tutorial hours.
    public void setTutorialHours(int tutorialHours) {
        this.tutorialHours = tutorialHours;
    }

    // Returns the lab hours.
    public int getLabHours() {
        return labHours;
    }

    // Sets the lab hours.
    public void setLabHours(int labHours) {
        this.labHours = labHours;
    }

    // Returns the project hours.
    public int getProjectHours() {
        return projectHours;
    }

    // Sets the project hours.
    public void setProjectHours(int projectHours) {
        this.projectHours = projectHours;
    }

    

    // Returns the cluster.
    public int getCluster() {
		return cluster;
	}

	// Sets the cluster.
	public void setCluster(int cluster) {
		this.cluster = cluster;
	}

	// Returns the credits.
	public float getCredits() {
		return credits;
	}

	// Sets the credits.
	public void setCredits(float credits) {
		this.credits = credits;
	}


    // Returns the cluster name.
    public String getClusterName() {
        return clusterName;
    }

    // Sets the cluster name.
    public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }

    // Returns the lecture number students.
    public Integer getLectureNumberStudents() {
        return lectureNumberStudents;
    }

    // Sets the lecture number students.
    public void setLectureNumberStudents(Integer lectureNumberStudents) {
        this.lectureNumberStudents = lectureNumberStudents;
    }

    // Returns the tutorial number students.
    public Integer getTutorialNumberStudents() {
        return tutorialNumberStudents;
    }

    // Sets the tutorial number students.
    public void setTutorialNumberStudents(Integer tutorialNumberStudents) {
        this.tutorialNumberStudents = tutorialNumberStudents;
    }

    // Returns the lab number students.
    public Integer getLabNumberStudents() {
        return labNumberStudents;
    }

    // Sets the lab number students.
    public void setLabNumberStudents(Integer labNumberStudents) {
        this.labNumberStudents = labNumberStudents;
    }
}
