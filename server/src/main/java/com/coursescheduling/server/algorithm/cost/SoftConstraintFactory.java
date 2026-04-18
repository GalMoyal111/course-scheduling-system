package com.coursescheduling.server.algorithm.cost;

import java.util.ArrayList;
import java.util.List;

public class SoftConstraintFactory {

    public static List<SoftConstraint> createSoftConstraints() {
        List<SoftConstraint> softConstraints = new ArrayList<>();
        softConstraints.add(new RoomSizeEfficiencyConstraint());
        softConstraints.add(new PreferMorningForHardCoursesConstraint());
        
        softConstraints.add(new LecturerCompactScheduleConstraint());
        
        return softConstraints;
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
