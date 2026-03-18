package com.coursescheduling.server.model;

import java.util.List;

public class ClusterCoursesList {
	
	private String clusterId;
    private List<Course> courses;

    public ClusterCoursesList() {}

    public ClusterCoursesList(String clusterId, List<Course> courses) {
        this.clusterId = clusterId;
        this.courses = courses;
    }

    public String getClusterId() {
        return clusterId;
    }

    public void setClusterId(String clusterId) {
        this.clusterId = clusterId;
    }

    public List<Course> getCourses() {
        return courses;
    }

    public void setCourses(List<Course> courses) {
        this.courses = courses;
    }
	
}
