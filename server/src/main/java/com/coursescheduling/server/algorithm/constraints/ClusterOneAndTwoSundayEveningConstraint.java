package com.coursescheduling.server.algorithm.constraints;

import org.springframework.stereotype.Component;

import com.coursescheduling.server.algorithm.model.DomainValue;
import com.coursescheduling.server.algorithm.model.Variable;

@Component
public class ClusterOneAndTwoSundayEveningConstraint {

    private static final int CLUSTER_ONE = 1;
    private static final int CLUSTER_TWO = 2;
    private static final int SUNDAY = 1;
    private static final int FIRST_BLOCKED_FRAME = 9; 

    // Checks whether valid.
    public boolean isValid(Variable variable, DomainValue value) {
        if (variable.getCluster() != CLUSTER_ONE && variable.getCluster() != CLUSTER_TWO) {
            return true; 
        }

        if(value.getDay() != SUNDAY) {
            return true; 
        }

        return value.getStartFrame() < FIRST_BLOCKED_FRAME ;
    }

}
