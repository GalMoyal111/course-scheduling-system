package com.coursescheduling.server.model;

public class CourseUpdateRequest {
    private Course oldCourse;
    private Course newCourse;
    // Returns the old course.
    public Course getOldCourse() {
        return oldCourse;
    }
    // Sets the old course.
    public void setOldCourse(Course oldCourse) {
        this.oldCourse = oldCourse;
    }
    // Returns the new course.
    public Course getNewCourse() {
        return newCourse;
    }
    // Sets the new course.
    public void setNewCourse(Course newCourse) {
        this.newCourse = newCourse;
    }
}
