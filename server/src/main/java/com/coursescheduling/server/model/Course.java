package com.coursescheduling.server.model;

public class Course {
    private String semesterNumber;
    private String courseCode;
    private String courseName;
    private String prerequisiteCourseNumberOrConditions;
    private int lectureHours;
    private int tutorialHours;
    private int labHours;
    private int projectHours;
    private int credits;
    private String notes;

    public Course() {}

    public Course(String semesterNumber, String courseCode, String courseName, String prerequisiteCourseNumberOrConditions,
                  int lectureHours, int tutorialHours, int labHours, int projectHours, int credits, String notes) {
        this.semesterNumber = semesterNumber;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.prerequisiteCourseNumberOrConditions = prerequisiteCourseNumberOrConditions;
        this.lectureHours = lectureHours;
        this.tutorialHours = tutorialHours;
        this.labHours = labHours;
        this.projectHours = projectHours;
        this.credits = credits;
        this.notes = notes;
    }

    public String getSemesterNumber() {
        return semesterNumber;
    }

    public void setSemesterNumber(String semesterNumber) {
        this.semesterNumber = semesterNumber;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
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

    public int getCredits() {
        return credits;
    }

    public void setCredits(int credits) {
        this.credits = credits;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

}
