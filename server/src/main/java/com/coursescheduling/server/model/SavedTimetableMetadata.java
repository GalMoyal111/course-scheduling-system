package com.coursescheduling.server.model;

public class SavedTimetableMetadata {
    private String id;
    private String name;
    private Semester semester;
    private long createdAt;

    public SavedTimetableMetadata() {}

    public SavedTimetableMetadata(String id, String name, Semester semester, long createdAt) {
        this.id = id;
        this.name = name;
        this.semester = semester;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Semester getSemester() {
        return semester;
    }

    public void setSemester(Semester semester) {
        this.semester = semester;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }
}