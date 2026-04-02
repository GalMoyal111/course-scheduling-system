package com.coursescheduling.server.algorithm.model;

public class UnavailableSlot {

    private int day;
    private int frame;

    public UnavailableSlot(int day, int frame) {
        this.day = day;
        this.frame = frame;
    }

    public int getDay() {
        return day;
    }

    public int getFrame() {
        return frame;
    }
}