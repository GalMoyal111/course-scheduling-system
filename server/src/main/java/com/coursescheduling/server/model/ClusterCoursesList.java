package com.coursescheduling.server.model;

import java.util.List;

public class ClusterCoursesList {

    private String clusterName;
    private List<Course> courses;

    public ClusterCoursesList() {}

    // Creates a ClusterCoursesList instance.
    public ClusterCoursesList(String clusterName, List<Course> courses) {
        this.clusterName = clusterName;
        this.courses = courses;
    }

    // Returns the cluster name.
    public String getClusterName() {
        return clusterName;
    }

    // Sets the cluster name.
    public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }

    // Returns the courses.
    public List<Course> getCourses() {
        return courses;
    }

    // Sets the courses.
    public void setCourses(List<Course> courses) {
        this.courses = courses;
    }
}
