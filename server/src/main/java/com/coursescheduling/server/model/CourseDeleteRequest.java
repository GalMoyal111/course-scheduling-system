package com.coursescheduling.server.model;

public class CourseDeleteRequest {
    private String semesterNumber;
    private String courseId;

    public CourseDeleteRequest() {}

    public String getSemesterNumber() {
        return semesterNumber;
    }

    public void setSemesterNumber(String semesterNumber) {
        this.semesterNumber = semesterNumber;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }


}
