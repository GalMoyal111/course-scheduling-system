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
	
	public List<Variable> createVariables(Semester semester){
		
		// the original
		//List<Lesson> lessons = getSupportedLessonsFromDB(semester);
		
		//temp
		List<Lesson> lessons = createTestLessons();
		
		
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
	
	private boolean isHardCourse(String courseId) {
    	return "111".equals(courseId) || "333".equals(courseId);
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
		v.setIsHardCourse(isHardCourse(lesson.getCourseId()));

		return v;
	}
	
	// private Variable mapLessonToVariable(Lesson lesson) {
	//     Variable v = new Variable();

	//     v.setLessonId(lesson.getLessonId());
	//     v.setCourseId(lesson.getCourseId());
	//     v.setLecturer(lesson.getLecturer());
	//     v.setCluster(lesson.getCluster());
	//     v.setType(lesson.getType());
	//     v.setDuration(lesson.getDuration());
	//     v.setSplitGroupId(lesson.getSplitGroupId());
	//     v.setCredits(lesson.getCredits());
	//     v.setIsHardCourse(false);

	//     return v;
	// }
	
	
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
	
	
	
	private List<Lesson> createTestLessons() {

	    List<Lesson> lessons = new ArrayList<>();

	    lessons.add(createLesson("111", "משה 1", 2, LessonType.LECTURE, 1, 5, null));
	    lessons.add(createLesson("111", "מושה 2", 2, LessonType.LECTURE, 1, 5, null));
	    lessons.add(createLesson("111", "משה", 2, LessonType.TUTORIAL, 1, 5, null));
	    lessons.add(createLesson("111", "משה", 2, LessonType.TUTORIAL, 1, 5, null));
	    lessons.add(createLesson("111", "משה", 2, LessonType.LAB, 1, 5, null));

	    lessons.add(createLesson("222", "דנה", 2, LessonType.LECTURE, 1, 2, null));
	    lessons.add(createLesson("222", "דנה", 2, LessonType.TUTORIAL, 1, 2, null));
	    lessons.add(createLesson("222", "דנה", 2, LessonType.LAB, 1, 2, null));
	    lessons.add(createLesson("222", "משה", 2, LessonType.LAB, 1, 2, null));

	    String splitId1 = UUID.randomUUID().toString();
	    lessons.add(createLesson("333", "יוסי", 2, LessonType.LECTURE, 2, 4, splitId1));
	    lessons.add(createLesson("333", "יוסי", 2, LessonType.LECTURE, 2, 4, splitId1));
	    
	    String splitId3 = UUID.randomUUID().toString();
	    lessons.add(createLesson("333", "אליס", 2, LessonType.LECTURE, 2, 5, splitId3));
	    lessons.add(createLesson("333", "אליס", 2, LessonType.LECTURE, 2, 5, splitId3));
	    

	    lessons.add(createLesson("333", "יוסי", 2, LessonType.TUTORIAL, 2, 5, null));

	    lessons.add(createLesson("444", "שרה", 2, LessonType.LECTURE, 3, 5, null));
	    lessons.add(createLesson("444", "שרה", 2, LessonType.LECTURE, 3, 5, null));
	    lessons.add(createLesson("444", "שרה", 2, LessonType.TUTORIAL, 3, 5, null));
	    lessons.add(createLesson("444", "שרה", 2, LessonType.LAB, 3, 5, null));
	    lessons.add(createLesson("444", "שרה", 2, LessonType.LAB, 3, 5, null));

	    lessons.add(createLesson("555", "אבי", 2, LessonType.LECTURE, 3, 4, null));
	    lessons.add(createLesson("555", "אבי", 2, LessonType.TUTORIAL, 3, 4, null));

	    String splitId2 = UUID.randomUUID().toString();
	    lessons.add(createLesson("666", "רון", 2, LessonType.LECTURE, 3, 3, splitId2));
	    lessons.add(createLesson("666", "רון", 2, LessonType.LECTURE, 3, 3, splitId2));

	    lessons.add(createLesson("666", "רון", 2, LessonType.LAB, 3, 3, null));
	    lessons.add(createLesson("666", "רון", 2, LessonType.TUTORIAL, 3, 3, null));
	    
	    
	    lessons.add(createLesson("777", "בוב", 3, LessonType.LECTURE, 3, 3, null));
	    lessons.add(createLesson("777", "בוב", 3, LessonType.LECTURE, 3, 3, null));
	    lessons.add(createLesson("777", "בוב", 2, LessonType.TUTORIAL, 3, 3, null));
	    lessons.add(createLesson("777", "בוב", 2, LessonType.TUTORIAL, 3, 3, null));
	    lessons.add(createLesson("777", "בוב", 2, LessonType.LAB, 3, 3, null));
	    
	    
	    lessons.add(createLesson("888", "דונק", 2, LessonType.LECTURE , 9 , 3, null));
	    lessons.add(createLesson("888", "דונק", 2, LessonType.TUTORIAL , 9 , 3, null));
	    
	    lessons.add(createLesson("999", "איתי", 2, LessonType.LECTURE , 9 , 3, null));
	    lessons.add(createLesson("999", "איתי", 2, LessonType.TUTORIAL , 9 , 3, null));

	    return lessons;
	}
	


	private Lesson createLesson(String courseId, String lecturer, int duration, LessonType type,int cluster,  int credits, String splitId) {
	    Lesson l = new Lesson();

	    l.setLessonId(UUID.randomUUID().toString());
	    l.setCourseId(courseId);
	    l.setLecturer(lecturer);
	    l.setDuration(duration);
	    l.setType(type);
	    l.setSplitGroupId(splitId); 
	    l.setCluster(cluster);
	    l.setCredits(credits);
	    l.setSemester(Semester.A);

	    return l;
	}
	
	
	
	
	
}
