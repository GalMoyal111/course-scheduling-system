package com.coursescheduling.server.algorithm.solver;
import java.util.*;
import com.coursescheduling.server.model.Classroom;

public class RoomManager {

    private Map<String, Set<Classroom>> roomAvailability;

    public RoomManager(List<Classroom> rooms) {
        this.roomAvailability = initRoomAvailability(rooms);
    }

    private Map<String, Set<Classroom>> initRoomAvailability(List<Classroom> rooms) {

        Map<String, Set<Classroom>> map = new HashMap<>();

        for (int day = 1; day <= 6; day++) {

            int maxFrame = (day == 6) ? 4 : 12;

            for (int frame = 1; frame <= maxFrame; frame++) {

                String key = buildKey(day, frame);

                map.put(key, new HashSet<>(rooms));
            }
        }

        return map;
    }

    
    private String buildKey(int day, int frame) {
        return day + "-" + frame;
    }

    
    public Set<Classroom> getAvailableRooms(int day, int frame) {
        return roomAvailability.get(buildKey(day, frame));
    }
    
    
    public boolean bookRoom(int day, int frame, Classroom classroom) {
        Set<Classroom> available = roomAvailability.get(buildKey(day, frame));
        if (available != null && available.contains(classroom)) {
            available.remove(classroom);
            return true; 
        }
        return false; 
    }
    
    
    public void releaseRoom(int day, int frame, Classroom classroom) {
        Set<Classroom> available = roomAvailability.get(buildKey(day, frame));
        if (available != null) {
            available.add(classroom);
        }
    }
    
    
    
}
