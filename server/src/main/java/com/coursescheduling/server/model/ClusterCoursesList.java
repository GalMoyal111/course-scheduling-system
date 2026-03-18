package com.coursescheduling.server.model;

import java.util.List;

public class ClusterCoursesList {

    private String clusterName;
    private List<Course> courses;

    public ClusterCoursesList() {}

    public ClusterCoursesList(String clusterName, List<Course> courses) {
        this.clusterName = clusterName;
        this.courses = courses;
    }

    public String getClusterName() {
        return clusterName;
    }

    public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }

    public List<Course> getCourses() {
        return courses;
    }

    public void setCourses(List<Course> courses) {
        this.courses = courses;
    }
}
