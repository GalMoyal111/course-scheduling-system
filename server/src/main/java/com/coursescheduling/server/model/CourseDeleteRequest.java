package com.coursescheduling.server.model;

public class CourseDeleteRequest {
    private String semesterNumber;
    private String courseCode;

    public CourseDeleteRequest() {}

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


}
