package com.coursescheduling.server.model;

public class CourseUpdateRequest {
    private Course oldCourse;
    private Course newCourse;
    public Course getOldCourse() {
        return oldCourse;
    }
    public void setOldCourse(Course oldCourse) {
        this.oldCourse = oldCourse;
    }
    public Course getNewCourse() {
        return newCourse;
    }
    public void setNewCourse(Course newCourse) {
        this.newCourse = newCourse;
    }
}
