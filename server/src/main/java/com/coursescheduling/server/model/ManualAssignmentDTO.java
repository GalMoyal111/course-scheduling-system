package com.coursescheduling.server.model;

public class ManualAssignmentDTO {
    
    private String lessonId; 
    private int day; 
    private int startFrame;
    private String building; 
    private String classroomName; 

    // Constructors
    public ManualAssignmentDTO() {}

    public ManualAssignmentDTO(String lessonId, int day, int startFrame, String building, String classroomName) {
        this.lessonId = lessonId;
        this.day = day;
        this.startFrame = startFrame;
        this.building = building;
        this.classroomName = classroomName;
    }

    public String getLessonId() { return lessonId; }
    public void setLessonId(String lessonId) { this.lessonId = lessonId; }

    public int getDay() { return day; }
    public void setDay(int day) { this.day = day; }

    public int getStartFrame() { return startFrame; }
    public void setStartFrame(int startFrame) { this.startFrame = startFrame; }

    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }

    public String getClassroomName() { return classroomName; }
    public void setClassroomName(String classroomName) { this.classroomName = classroomName; }
}