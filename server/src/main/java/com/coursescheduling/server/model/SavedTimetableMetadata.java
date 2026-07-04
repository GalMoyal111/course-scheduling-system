package com.coursescheduling.server.model;

public class SavedTimetableMetadata {
    private String id;
    private String name;
    private Semester semester;
    private long createdAt;

    public SavedTimetableMetadata() {}

    // Creates a SavedTimetableMetadata instance.
    public SavedTimetableMetadata(String id, String name, Semester semester, long createdAt) {
        this.id = id;
        this.name = name;
        this.semester = semester;
        this.createdAt = createdAt;
    }

    // Returns the id.
    public String getId() {
        return id;
    }

    // Sets the id.
    public void setId(String id) {
        this.id = id;
    }

    // Returns the name.
    public String getName() {
        return name;
    }

    // Sets the name.
    public void setName(String name) {
        this.name = name;
    }

    // Returns the semester.
    public Semester getSemester() {
        return semester;
    }

    // Sets the semester.
    public void setSemester(Semester semester) {
        this.semester = semester;
    }

    // Returns the created at.
    public long getCreatedAt() {
        return createdAt;
    }

    // Sets the created at.
    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }
}
