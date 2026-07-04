package com.coursescheduling.server.model;

public class CourseDeleteRequest {
    private String semesterNumber;
    private String courseId;

    public CourseDeleteRequest() {}

    // Returns the semester number.
    public String getSemesterNumber() {
        return semesterNumber;
    }

    // Sets the semester number.
    public void setSemesterNumber(String semesterNumber) {
        this.semesterNumber = semesterNumber;
    }

    // Returns the course id.
    public String getCourseId() {
        return courseId;
    }

    // Sets the course id.
    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }


}
