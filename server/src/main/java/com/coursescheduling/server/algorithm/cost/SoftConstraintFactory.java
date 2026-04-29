package com.coursescheduling.server.algorithm.cost;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SoftConstraintFactory {

    public static List<SoftConstraint> createSoftConstraints() {
        List<SoftConstraint> softConstraints = new ArrayList<>();
        softConstraints.add(new RoomSizeEfficiencyConstraint());
        softConstraints.add(new PreferMorningForHardCoursesConstraint());
        
        softConstraints.add(new LecturerCompactScheduleConstraint());
        
        softConstraints.add(new CourseComponentsOverlapConstraint());
        
        softConstraints.add(new MandatoryMorningPreferredConstraint());
        
        softConstraints.add(new ElectiveEveningPreferredConstraint());
        
        softConstraints.add(new InconvenientTimingConstraint());

        softConstraints.add(new ElectiveCourseInTheSameClassroom());
        
        softConstraints.add(new AvoidBuildingPConstraint());
        
        softConstraints.add(new LecturerPreferenceConstraint());
        
        return softConstraints;
    }

    public static Map<String, Double> getDefaultUserWeights() {
        Map<String, Double> defaultWeights = new HashMap<>();
        defaultWeights.put("RoomSizeEfficiency", 5.0);
        defaultWeights.put("PreferMorningForHardCourses", 5.0);
        defaultWeights.put("LecturerCompactSchedule", 5.0);
        defaultWeights.put("CourseComponentsOverlap", 5.0);
        defaultWeights.put("MandatoryMorningPreferred", 5.0);
        defaultWeights.put("ElectiveEveningPreferred", 5.0);
        defaultWeights.put("InconvenientTiming", 5.0);
        defaultWeights.put("ElectiveCourseInTheSameClassroom", 5.0);
        defaultWeights.put("AvoidBuildingP", 5.0);
        defaultWeights.put("LecturerPreference", 5.0);
        return defaultWeights;
    }
    


    
}
