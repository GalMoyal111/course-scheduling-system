package com.coursescheduling.server.algorithm.preprocessing;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.coursescheduling.server.algorithm.model.Variable;
import com.coursescheduling.server.model.Lesson;
import com.coursescheduling.server.service.LessonService;



@Service
public class VariableBuilder {
	
	@Autowired
    private LessonService lessonService;
	
	public List<Variable> createVariables(){
		List <Lesson> lessons = lessonService.getAllLessons();
		List <Variable> variables = new ArrayList<>();
		
		for (Lesson lesson : lessons) {
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
            
            variables.add(v);
		}
		
		
		System.out.print("hfdhj");
		return null;
		
	}
}
