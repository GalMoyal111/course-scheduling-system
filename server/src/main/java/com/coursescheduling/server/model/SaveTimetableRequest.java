package com.coursescheduling.server.model;

import com.coursescheduling.server.algorithm.model.ScheduledLessonDTO;
import java.util.List;

public class SaveTimetableRequest {
    private String name;
    private Semester semester;
    private List<ScheduledLessonDTO> schedule;

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

    // Returns the schedule.
    public List<ScheduledLessonDTO> getSchedule() {
        return schedule;
    }

    // Sets the schedule.
    public void setSchedule(List<ScheduledLessonDTO> schedule) {
        this.schedule = schedule;
    }
}
