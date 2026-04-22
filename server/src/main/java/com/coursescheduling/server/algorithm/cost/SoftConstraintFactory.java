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
        return defaultWeights;
    }
    

    // חשוב!!! אולי להשתמש בcase כשיהיו יותר סוגים
    // public static SoftConstraint createSoftConstraint(String constraintType) {
    //     switch (constraintType) {
    //         case "RoomCapacity":
    //             List<String> roomCapacityData = List.of("RoomA:30", "RoomB:50", "RoomC:20");
    //             return new RoomCapacitySoftConstraint();
    //         case "PreferredTimeSlot":
    //             return new PreferredTimeSlotSoftConstraint();
    //         case "InstructorPreference":
    //             return new InstructorPreferenceSoftConstraint();
    //         // Add more cases for different types of soft constraints
    //         default:
    //             throw new IllegalArgumentException("Unknown soft constraint type: " + constraintType);
    //     }
    // }

    
}
