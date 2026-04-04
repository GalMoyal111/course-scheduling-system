package com.coursescheduling.server.algorithm.preprocessing;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.coursescheduling.server.algorithm.model.DomainValue;
import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.model.Classroom;
import com.coursescheduling.server.model.LessonType;

@Service
public class DomainConstraintService {

    public void applyLecturerConstraints(List<Variable> variables) {
        Map<String, List<DomainValue>> constraints = getLecturerConstraints();

        for (Variable v : variables) {

            List<DomainValue> unavailable = constraints.get(v.getLecturer());

            if (unavailable == null)
                continue;

            List<DomainValue> values = v.getDomain().getValues();

            values.removeIf(dv ->
                unavailable.stream().anyMatch(slot ->
                    slot.getDay() == dv.getDay() &&
                    slot.getStartFrame() == dv.getStartFrame()
                )
            );
        }
    }

    
    
    private Map<String, List<DomainValue>> getLecturerConstraints() {
        Map<String, List<DomainValue>> map = new HashMap<>();

        map.put("משה כהן", List.of(
                new DomainValue(1, 3),
                new DomainValue(2, 5)
        ));

        return map;
    }
    
    
    public void applyGlobalConstraints(List<Variable> variables, List<DomainValue> blockedSlots) {

        for (Variable v : variables) {

            List<DomainValue> values = v.getDomain().getValues();

            values.removeIf(dv -> blockedSlots.stream().anyMatch(slot -> slot.getDay() == dv.getDay() &&
                    slot.getStartFrame() == dv.getStartFrame()));
            
            
        }
    }
    
    
    public void applyDurationConstraints(List<Variable> variables) {

        for (Variable v : variables) {

            int duration = v.getDuration();

            List<DomainValue> values = v.getDomain().getValues();

            values.removeIf(dv -> {
                int day = dv.getDay();
                int start = dv.getStartFrame();

                int maxFrame = (day == 6) ? 4 : 12;

                return start + duration - 1 > maxFrame;
            });
        }
    }
    
    
    
    public boolean isRoomTypeSuitable(Variable var, Classroom room) {
        LessonType lessonType = var.getType();
        String roomType = room.getType(); 

        if (roomType == null) return false;

        switch (lessonType) {
            case PHYSICS_LAB:
                return roomType.equals("physics lab");
            
            case NETWORKING_LAB:
                return roomType.equals("networks lab");
            
            case LAB:
                return roomType.equals("lab");
            
            case LECTURE:
            case TUTORIAL:
            case PBL:
                return roomType.equals("normal");
            
            default:
                return roomType.equals("normal");
        }
    }
    
    
    
}
