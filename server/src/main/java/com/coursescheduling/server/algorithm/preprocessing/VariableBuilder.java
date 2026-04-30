package com.coursescheduling.server.algorithm.preprocessing;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.coursescheduling.server.algorithm.model.Domain;
import com.coursescheduling.server.algorithm.model.DomainValue;
import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.model.Lesson;
import com.coursescheduling.server.model.LessonType;
import com.coursescheduling.server.model.Semester;
import com.coursescheduling.server.service.LessonService;



@Service
public class VariableBuilder {
	
	@Autowired
    private LessonService lessonService;
	
	public List<Variable> createVariables(Semester semester, Map<LessonType, Integer> requiredCapacitiesMap, List<String> hardCourseIds){		
		
		List<Lesson> lessons = getSupportedLessonsFromDB(semester);
		List <Variable> variables = new ArrayList<>();
		
		for (Lesson lesson : lessons) {
			Variable v = mapLessonToVariable(lesson, requiredCapacitiesMap, hardCourseIds);
	        variables.add(v);
	    }
		
		Map<String, List<Variable>> byCourse = groupByCourse(variables);
		
		assignIndexesPerCourse(byCourse);
		
		buildInitialDomains(variables);
				
		
		return variables;
		
	}
	
	
	
	

	private Variable mapLessonToVariable(Lesson lesson, Map<LessonType, Integer> requiredCapacitiesMap, List<String> hardCourseIds) {    	
		
		Variable v = new Variable();

		v.setLessonId(lesson.getLessonId());
		v.setCourseId(lesson.getCourseId());
		v.setLecturer(lesson.getLecturer());
		v.setCluster(lesson.getCluster());
		v.setType(lesson.getType());
		v.setDuration(lesson.getDuration());
		v.setSplitGroupId(lesson.getSplitGroupId());
		v.setCredits(lesson.getCredits());

		if (hardCourseIds != null && hardCourseIds.contains(lesson.getCourseId()) && lesson.getType() == LessonType.LECTURE) {
			v.setIsHardCourse(true);
		} else {
			v.setIsHardCourse(false);
		}
		
		
		if (requiredCapacitiesMap != null && requiredCapacitiesMap.containsKey(lesson.getType())) {
            v.setRequiredCapacity(requiredCapacitiesMap.get(lesson.getType()));
        } else {
            v.setRequiredCapacity(getDefaultCapacity(lesson.getType())); 
        }
		
		
		return v;
	}
	

	
	private Map<String, List<Variable>> groupByCourse(List<Variable> variables) {
	    Map<String, List<Variable>> map = new HashMap<>();

	    for (Variable v : variables) {
	        map.computeIfAbsent(v.getCourseId(), k -> new ArrayList<>()).add(v);
	    }

	    return map;
	}
	
	
	
	private void assignIndexesPerCourse(Map<String, List<Variable>> byCourse) {

	    for (List<Variable> courseVars : byCourse.values()) {

	    	courseVars.sort(Comparator.comparingInt(v -> v.getType().getPriority()));

	        int index = 1;

	        for (Variable v : courseVars) {
	            v.setIndex(index++);
	        }
	    }
	}
	
	
	private void buildInitialDomains(List<Variable> variables) {

	    for (Variable v : variables) {

	        Domain domain = new Domain();

	        for (int day = 1; day <= 6; day++) {

	            int maxFrame = (day == 6) ? 4 : 12;

	            for (int frame = 1; frame <= maxFrame; frame++) {

	                DomainValue dv = new DomainValue(day, frame);

	                domain.addValue(dv);
	                
	            }
	        }
	        
	        v.setDomain(domain);
	    }
	}
	
	
	private List<Lesson> getSupportedLessonsFromDB(Semester semester) {
        List<Lesson> allLessons = lessonService.getLessonsBySemester(semester);
        
        List<Lesson> filtered = new ArrayList<>();
        for (Lesson l : allLessons) {
            LessonType type = l.getType();
            if (type == LessonType.LECTURE || 
                type == LessonType.TUTORIAL || 
                type == LessonType.LAB || 
                type == LessonType.PHYSICS_LAB || 
                type == LessonType.NETWORKING_LAB) {
                filtered.add(l);
            }
        }
        return filtered;
    }
	
	
	
	private int getDefaultCapacity(LessonType type) {
        if (type == null) return 0;
        switch (type) {
            case LECTURE: return 60;
            case TUTORIAL: return 40;
            case LAB: return 20;
            case PHYSICS_LAB: return 15;
            case NETWORKING_LAB: return 12;
            default: return 0;
        }
    }

	
}
