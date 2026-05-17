package com.coursescheduling.server.model;

public class ClassroomSizeSettings {

    private int lectureSize;
    private int tutorialSize;
    private int labSize;
    private int physicsLabSize;
    private int networkingLabSize;
    private int electiveCourseSize;

    public ClassroomSizeSettings() {
    }

    public ClassroomSizeSettings(int lectureSize, int tutorialSize, int labSize, int physicsLabSize, int networkingLabSize, int electiveCourseSize) {
        this.lectureSize = lectureSize;
        this.tutorialSize = tutorialSize;
        this.labSize = labSize;
        this.physicsLabSize = physicsLabSize;
        this.networkingLabSize = networkingLabSize;
        this.electiveCourseSize = electiveCourseSize;
    }

    public static ClassroomSizeSettings createDefault() {
        return new ClassroomSizeSettings(60, 40, 20, 15, 12, 25);
    }

    public int getLectureSize() {
        return lectureSize;
    }
    
    public void setLectureSize(int lectureSize) {
        this.lectureSize = lectureSize;
    }

    public int getTutorialSize() {
        return tutorialSize;
    }

    public void setTutorialSize(int tutorialSize) {
        this.tutorialSize = tutorialSize;
    }

    public int getLabSize() {
        return labSize;
    }

    public void setLabSize(int labSize) {
        this.labSize = labSize;
    }

    public int getPhysicsLabSize() {
        return physicsLabSize;
    }

    public void setPhysicsLabSize(int physicsLabSize) {
        this.physicsLabSize = physicsLabSize;
    }

    public int getNetworkingLabSize() {
        return networkingLabSize;
    }

    public void setNetworkingLabSize(int networkingLabSize) {
        this.networkingLabSize = networkingLabSize;
    }

    public int getElectiveCourseSize() {
        return electiveCourseSize;
    }

    public void setElectiveCourseSize(int electiveCourseSize) {
        this.electiveCourseSize = electiveCourseSize;
    }

}
