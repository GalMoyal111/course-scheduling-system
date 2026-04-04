package com.coursescheduling.server.model;

public enum LessonType {
    LECTURE(1),
    TUTORIAL(2),
    LAB(3),
    PHYSICS_LAB(3),
    NETWORKING_LAB(3),
    PBL(4),
    PROJECT(5);

    private final int priority;

    LessonType(int priority) {
        this.priority = priority;
    }

    public int getPriority() {
        return priority;
    }
}