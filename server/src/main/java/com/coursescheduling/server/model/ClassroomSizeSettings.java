package com.coursescheduling.server.model;

public class ClassroomSizeSettings {

    private int lectureSize;
    private int tutorialSize;
    private int labSize;
    private int physicsLabSize;
    private int networkingLabSize;
    private int electiveCourseSize;

    // Creates a ClassroomSizeSettings instance.
    public ClassroomSizeSettings() {
    }

    // Creates a ClassroomSizeSettings instance.
    public ClassroomSizeSettings(int lectureSize, int tutorialSize, int labSize, int physicsLabSize, int networkingLabSize, int electiveCourseSize) {
        this.lectureSize = lectureSize;
        this.tutorialSize = tutorialSize;
        this.labSize = labSize;
        this.physicsLabSize = physicsLabSize;
        this.networkingLabSize = networkingLabSize;
        this.electiveCourseSize = electiveCourseSize;
    }

    // Creates the default.
    public static ClassroomSizeSettings createDefault() {
        return new ClassroomSizeSettings(60, 40, 20, 15, 12, 25);
    }

    // Returns the lecture size.
    public int getLectureSize() {
        return lectureSize;
    }
    
    // Sets the lecture size.
    public void setLectureSize(int lectureSize) {
        this.lectureSize = lectureSize;
    }

    // Returns the tutorial size.
    public int getTutorialSize() {
        return tutorialSize;
    }

    // Sets the tutorial size.
    public void setTutorialSize(int tutorialSize) {
        this.tutorialSize = tutorialSize;
    }

    // Returns the lab size.
    public int getLabSize() {
        return labSize;
    }

    // Sets the lab size.
    public void setLabSize(int labSize) {
        this.labSize = labSize;
    }

    // Returns the physics lab size.
    public int getPhysicsLabSize() {
        return physicsLabSize;
    }

    // Sets the physics lab size.
    public void setPhysicsLabSize(int physicsLabSize) {
        this.physicsLabSize = physicsLabSize;
    }

    // Returns the networking lab size.
    public int getNetworkingLabSize() {
        return networkingLabSize;
    }

    // Sets the networking lab size.
    public void setNetworkingLabSize(int networkingLabSize) {
        this.networkingLabSize = networkingLabSize;
    }

    // Returns the elective course size.
    public int getElectiveCourseSize() {
        return electiveCourseSize;
    }

    // Sets the elective course size.
    public void setElectiveCourseSize(int electiveCourseSize) {
        this.electiveCourseSize = electiveCourseSize;
    }

}
