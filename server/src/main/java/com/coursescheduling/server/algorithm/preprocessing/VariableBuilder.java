package com.coursescheduling.server.algorithm.preprocessing;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.coursescheduling.server.algorithm.model.Domain;
import com.coursescheduling.server.algorithm.model.DomainValue;
import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.model.Lesson;
import com.coursescheduling.server.model.Semester;
import com.coursescheduling.server.service.LessonService;



@Service
public class VariableBuilder {
	
	@Autowired
    private LessonService lessonService;
	
	public List<Variable> createVariables(Semester semester){
		
		List<Lesson> lessons = lessonService.getLessonsBySemester(semester);
				
		List <Variable> variables = new ArrayList<>();
		
		for (Lesson lesson : lessons) {
	        Variable v = mapLessonToVariable(lesson);
	        variables.add(v);
	    }
		
		Map<String, List<Variable>> byCourse = groupByCourse(variables);
		
		assignIndexesPerCourse(byCourse);
		
		buildInitialDomains(variables);
		
		printVariables(byCourse);
		
		
		return variables;
		
	}
	
	
	
	private void printVariables(Map<String, List<Variable>> byCourse) {

	    System.out.println("\n========== VARIABLES ==========\n");

	    for (String courseId : byCourse.keySet()) {

	        System.out.println("📘 Course: " + courseId);
	        System.out.println("--------------------------------");

	        for (Variable v : byCourse.get(courseId)) {
	            System.out.println(
	                "Index: " + v.getIndex() +
	                " | Type: " + v.getType() +
	                " | Duration: " + v.getDuration() +
	                " | Lecturer: " + v.getLecturer() +
	                " | Split: " + v.getSplitGroupId()
	            );
	            System.out.println("Domain size: " + v.getDomain().getValues().size());
	        }

	        System.out.println();
	    }

	    System.out.println("================================\n");
	}
	
	
	private Variable mapLessonToVariable(Lesson lesson) {
	    Variable v = new Variable();

	    v.setLessonId(lesson.getLessonId());
	    v.setCourseId(lesson.getCourseId());
	    v.setLecturer(lesson.getLecturer());
	    v.setCluster(lesson.getCluster());
	    v.setType(lesson.getType());
	    v.setDuration(lesson.getDuration());
	    v.setSplitGroupId(lesson.getSplitGroupId());
	    v.setCredits(lesson.getCredits());
	    v.setIsHardCourse(false);

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

	                if (day == 3 && (frame == 5 || frame == 6)) {
	                    continue;
	                }

	                DomainValue dv = new DomainValue();
	                dv.setDay(day);
	                dv.setStartFrame(frame);
	                dv.setRoomId(null); 

	                domain.addValue(dv);
	                
	            }
	        }
	        
	        v.setDomain(domain);
	    }
	}
	
	
	
	
	
	
}
