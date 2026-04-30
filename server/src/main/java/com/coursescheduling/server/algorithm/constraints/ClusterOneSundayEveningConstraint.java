package com.coursescheduling.server.algorithm.constraints;

import org.springframework.stereotype.Component;

import com.coursescheduling.server.algorithm.model.DomainValue;
import com.coursescheduling.server.algorithm.model.Variable;

@Component
public class ClusterOneSundayEveningConstraint {

    private static final int CLUSTER_ONE = 1;
    private static final int SUNDAY = 1;
    private static final int FIRST_BLOCKED_FRAME = 9; 

    public boolean isValid(Variable variable, DomainValue value) {
        if (variable.getCluster() != CLUSTER_ONE) {
            return true; 
        }

        if(value.getDay() != SUNDAY) {
            return true; 
        }

        return value.getStartFrame() < FIRST_BLOCKED_FRAME ;
    }

}
