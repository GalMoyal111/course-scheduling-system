package com.coursescheduling.server.model;

import com.coursescheduling.server.algorithm.model.ScheduledLessonDTO;
import java.util.List;

public class SaveTimetableRequest {
    private String name;
    private Semester semester;
    private List<ScheduledLessonDTO> schedule;

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

    public List<ScheduledLessonDTO> getSchedule() {
        return schedule;
    }

    public void setSchedule(List<ScheduledLessonDTO> schedule) {
        this.schedule = schedule;
    }
}