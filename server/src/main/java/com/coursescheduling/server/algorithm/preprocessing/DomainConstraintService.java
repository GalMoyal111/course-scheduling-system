package com.coursescheduling.server.algorithm.preprocessing;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.coursescheduling.server.algorithm.model.DomainValue;
import com.coursescheduling.server.algorithm.model.UnavailableSlot;
import com.coursescheduling.server.algorithm.model.Variable;

@Service
public class DomainConstraintService {

    public void applyLecturerConstraints(List<Variable> variables) {
        Map<String, List<UnavailableSlot>> constraints = getLecturerConstraints();

        for (Variable v : variables) {

            List<UnavailableSlot> unavailable = constraints.get(v.getLecturer());

            if (unavailable == null)
                continue;

            List<DomainValue> values = v.getDomain().getValues();

            values.removeIf(dv ->
                unavailable.stream().anyMatch(slot ->
                    slot.getDay() == dv.getDay() &&
                    slot.getFrame() == dv.getStartFrame()
                )
            );
        }
    }

    
    
    private Map<String, List<UnavailableSlot>> getLecturerConstraints() {
        Map<String, List<UnavailableSlot>> map = new HashMap<>();

        map.put("משה כהן", List.of(
                new UnavailableSlot(1, 3),
                new UnavailableSlot(2, 5)
        ));

        return map;
    }
}
