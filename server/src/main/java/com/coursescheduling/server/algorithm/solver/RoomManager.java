package com.coursescheduling.server.algorithm.solver;
import java.util.*;
import com.coursescheduling.server.model.Classroom;

/// Manages room availability for scheduling courses
public class RoomManager {

    private Map<String, Set<Classroom>> roomAvailability;

    public RoomManager(List<Classroom> rooms) {
        this.roomAvailability = initRoomAvailability(rooms);
    }

    // Initializes the room availability map for each day and time frame
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

    // Builds a unique key for the given day and time frame
    private String buildKey(int day, int frame) {
        return day + "-" + frame;
    }

    // Returns the set of available classrooms for the specified day and time frame
    public Set<Classroom> getAvailableRooms(int day, int frame) {
        return roomAvailability.get(buildKey(day, frame));
    }
    
    
    // Attempts to book a classroom for the specified day and time frame
    public boolean bookRoom(int day, int frame, Classroom classroom) {
        Set<Classroom> available = roomAvailability.get(buildKey(day, frame));
        if (available != null && available.contains(classroom)) {
            available.remove(classroom);
            return true; 
        }
        return false; 
    }
    
    // Releases a previously booked classroom for the specified day and time frame
    public void releaseRoom(int day, int frame, Classroom classroom) {
        Set<Classroom> available = roomAvailability.get(buildKey(day, frame));
        if (available != null) {
            available.add(classroom);
        }
    }
    
    
    
}
