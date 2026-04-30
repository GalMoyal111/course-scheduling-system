package com.coursescheduling.server.algorithm.cost;
import com.coursescheduling.server.algorithm.model.AssignedValue;
import com.coursescheduling.server.algorithm.model.Variable;


import java.util.Map;

public class ElectiveCourseInTheSameClassroom implements SoftConstraint {

    @Override
    public double calculatePenalty(Variable variable, AssignedValue value, Map<Variable, AssignedValue> currentAssignment) {
        if (variable.getCluster() < 9) {
            return 0.0; // No penalty for non-elective courses
        }

        double penalty = 0.0;
        for (Map.Entry<Variable, AssignedValue> entry : currentAssignment.entrySet()) {
            Variable otherVar = entry.getKey();
            AssignedValue otherVal = entry.getValue();

            if (otherVar.getCourseId().equals(variable.getCourseId()) && otherVar.getCluster() < 9) {
                if (!value.getRoom().equals(otherVal.getRoom())) {
                    penalty += 1.0; 
                }
            }
        }
        return penalty; // Return accumulated penalty
    }

    @Override
    public String getName() {
        return "electiveCourseInTheSameClassroom";
    }

    @Override
    public double getMaxPenalty() {
        return 1.0; 
    }
    
}

// package com.coursescheduling.server.algorithm.cost;

// import com.coursescheduling.server.algorithm.model.AssignedValue;
// import com.coursescheduling.server.algorithm.model.Variable;
// import com.coursescheduling.server.model.Classroom;

// import java.util.Map;

// public class ElectiveCourseInTheSameClassroom implements SoftConstraint {

//     @Override
//     public double calculatePenalty(
//             Variable variable,
//             AssignedValue value,
//             Map<Variable, AssignedValue> currentAssignment
//     ) {
//         if (variable.getCluster() < 9) {
//             return 0.0;
//         }

//         if (value == null || value.getRoom() == null) {
//             return 0.0;
//         }

//         double penalty = 0.0;

//         for (Map.Entry<Variable, AssignedValue> entry : currentAssignment.entrySet()) {
//             Variable otherVar = entry.getKey();
//             AssignedValue otherVal = entry.getValue();

//             if (otherVal == null || otherVal.getRoom() == null) {
//                 continue;
//             }

//             boolean sameCourse = otherVar.getCourseId().equals(variable.getCourseId());
//             boolean sameCluster = otherVar.getCluster() == variable.getCluster();

//             if (sameCourse && sameCluster) {
//                 if (!isSameRoom(value.getRoom(), otherVal.getRoom())) {
//                     penalty += 1.0;
//                 }
//             }
//         }

//         return penalty;
//     }

//     private boolean isSameRoom(Classroom room1, Classroom room2) {
//         if (room1 == null || room2 == null) {
//             return false;
//         }

//         return room1.getBuilding().equals(room2.getBuilding())
//                 && room1.getClassroomName().equals(room2.getClassroomName());
//     }

//     @Override
//     public String getName() {
//         return "electiveCourseInTheSameClassroom";
//     }

//     @Override
//     public double getMaxPenalty() {
//         return 3.0;
//     }
// }