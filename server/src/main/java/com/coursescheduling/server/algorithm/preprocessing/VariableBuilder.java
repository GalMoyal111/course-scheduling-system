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
import com.coursescheduling.server.model.Course;
import com.coursescheduling.server.service.CourseService;
import com.coursescheduling.server.model.ClassroomSizeSettings;
import com.coursescheduling.server.service.ClassroomSizeSettingsService;



@Service
public class VariableBuilder {
	
	@Autowired
    private LessonService lessonService;
	
	@Autowired
    private CourseService courseService;

	@Autowired
    private ClassroomSizeSettingsService classroomSizeSettingsService;

	// Creates the variables.
	public List<Variable> createVariables(Semester semester, Map<LessonType, Integer> requiredCapacitiesMap, List<String> hardCourseIds , List<String> englishCourseIds, List<String> virtualCourseIds, Integer electiveCapacity){		
		
		List<Lesson> lessons = getSupportedLessonsFromDB(semester);
		List<Variable> variables = new ArrayList<>();
		ClassroomSizeSettings settings;

		try {
			settings = classroomSizeSettingsService.getClassroomSizeSettings();
		} catch (Exception e) {
			throw new RuntimeException("Failed to load classroom size settings", e);
		}

		Map<String, Course> coursesById = getCoursesById();

		for (Lesson lesson : lessons) {
			Variable v = mapLessonToVariable(lesson,coursesById,settings,requiredCapacitiesMap,hardCourseIds,englishCourseIds,virtualCourseIds,electiveCapacity);
			variables.add(v);
		}
		
		Map<String, List<Variable>> byCourse = groupByCourse(variables);
		
		assignIndexesPerCourse(byCourse);
		
		buildInitialDomains(variables);
				
		
		return variables;
		
	}

	// Handles the map lesson to variable logic.
	private Variable mapLessonToVariable(Lesson lesson, Map<String, Course> coursesById, ClassroomSizeSettings settings, Map<LessonType, Integer> requiredCapacitiesMap, List<String> hardCourseIds, List<String> englishCourseIds,List<String> virtualCourseIds,  Integer electiveCapacity) {		
		
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
		
		if (englishCourseIds != null && englishCourseIds.contains(lesson.getCourseId())) {
			v.setEnglishCourse(true);
		} else {
			v.setEnglishCourse(false);
		}
		
		if (virtualCourseIds != null && virtualCourseIds.contains(lesson.getCourseId())) {
	        v.setVirtual(true);
	    } else {
	        v.setVirtual(false);
	    }
		
		Course course = coursesById.get(lesson.getCourseId());

		if (course != null) {
			v.setRequiredCapacity(getRequiredCapacityFromCourse(course, lesson.getType(), settings));
		} else {
			System.out.println("⚠️ Course not found for lesson: " + lesson.getLessonId()
					+ " | courseId: " + lesson.getCourseId()
					+ ". Falling back to request/default capacity.");

			if (lesson.getCluster() >= 9 && electiveCapacity != null) {
				v.setRequiredCapacity(electiveCapacity);
			} else if (requiredCapacitiesMap != null && requiredCapacitiesMap.containsKey(lesson.getType())) {
				v.setRequiredCapacity(requiredCapacitiesMap.get(lesson.getType()));
			} else {
				throw new RuntimeException(
					"Missing course and missing required capacity for lesson: "
					+ lesson.getLessonId()
					+ " | courseId: "
					+ lesson.getCourseId()
					+ " | type: "
					+ lesson.getType()
				);
			}
		}

		
		return v;
	}
	
	// Handles the group by course logic.
	private Map<String, List<Variable>> groupByCourse(List<Variable> variables) {
	    Map<String, List<Variable>> map = new HashMap<>();

	    for (Variable v : variables) {
	        map.computeIfAbsent(v.getCourseId(), k -> new ArrayList<>()).add(v);
	    }

	    return map;
	}
	
	// Handles the assign indexes per course logic.
	private void assignIndexesPerCourse(Map<String, List<Variable>> byCourse) {

	    for (List<Variable> courseVars : byCourse.values()) {

	    	courseVars.sort(Comparator.comparingInt(v -> v.getType().getPriority()));

	        int index = 1;

	        for (Variable v : courseVars) {
	            v.setIndex(index++);
	        }
	    }
	}
	
	// Builds the initial domains.
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
	
	// Returns the supported lessons from db.
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

	// Returns the courses by id.
	private Map<String, Course> getCoursesById() {
		Map<String, Course> coursesById = new HashMap<>();

		try {
			List<Course> courses = courseService.getAllCoursesRaw();

			for (Course course : courses) {
				coursesById.put(course.getCourseId(), course);
			}

		} catch (Exception e) {
			throw new RuntimeException("Failed to load courses for variable building", e);
		}

		return coursesById;
	}

	// Returns the required capacity from course.
	private int getRequiredCapacityFromCourse(Course course,LessonType type,ClassroomSizeSettings settings) {
		if (course == null || type == null || settings == null) {
			throw new RuntimeException("Course, LessonType, and ClassroomSizeSettings must not be null");
		}
		if (course.getCluster() >= 9) {
			return course.getLectureNumberStudents() != null
					? course.getLectureNumberStudents()
					: settings.getElectiveCourseSize();
						
		}
		switch (type) {
			case LECTURE:
				return course.getLectureNumberStudents() != null
						? course.getLectureNumberStudents()
						: settings.getLectureSize();

			case TUTORIAL:
				return course.getTutorialNumberStudents() != null
						? course.getTutorialNumberStudents()
						: settings.getTutorialSize();

			case LAB:
				return course.getLabNumberStudents() != null
						? course.getLabNumberStudents()
						: settings.getLabSize();

			case PHYSICS_LAB:
				return settings.getPhysicsLabSize();

			case NETWORKING_LAB:
				return settings.getNetworkingLabSize();

			default:
				throw new RuntimeException("Unsupported lesson type for capacity: " + type + " in course: " + course.getCourseId());
		}
	}

}
