import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { getAllCourses, getAllLessons, getAllClassrooms, getAllLecturers } from "../services/api";

const DataContext = createContext();

// Cache duration in milliseconds (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;

export function DataProvider({ children }) {
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [schedule, setSchedule] = useState([]);
  
  // Cache timestamps
  const [lessonsTimestamp, setLessonsTimestamp] = useState(null);
  const [coursesTimestamp, setCoursesTimestamp] = useState(null);
  const [classroomsTimestamp, setClassroomsTimestamp] = useState(null);
  const [lecturersTimestamp, setLecturersTimestamp] = useState(null);

  const [isFetching, setIsFetching] = useState({
    courses: false,
    lessons: false,
    classrooms: false,
    lecturers: false
  });

  const updateCoursesLocally = useCallback((newCourses) => {
    setCourses(newCourses);
    setCoursesTimestamp(Date.now()); // מעדכן גם את החותמת כדי שה-Cache ייחשב טרי
  }, []);
  
  // Check if cache is still valid
  const isCacheValid = useCallback((timestamp) => {
    if (!timestamp) return false;
    return Date.now() - timestamp < CACHE_DURATION;
  }, []);

  // Invalidate specific cache
  const invalidateLessonsCache = useCallback(() => {
    setLessonsTimestamp(null);
  }, []);

  const invalidateCoursesCache = useCallback(() => {
    setCoursesTimestamp(null);
  }, []);

  const invalidateClassroomsCache = useCallback(() => {
    setClassroomsTimestamp(null);
  }, []);

  const invalidateLecturersCache = useCallback(() => {
    setLecturersTimestamp(null);
  }, []);

  // Invalidate all caches
  const invalidateAllCache = useCallback(() => {
    setLessonsTimestamp(null);
    setCoursesTimestamp(null);
    setClassroomsTimestamp(null);
    setLecturersTimestamp(null);
  }, []);

  const fetchCoursesIfNeeded = useCallback(async (caller = "Unknown") => {
    if (isFetching.courses) return;

    if (courses.length > 0 && isCacheValid(coursesTimestamp)) {
      console.log(`[Cache] Courses are fresh, skipping fetch for: ${caller}`);
      return;
    }

    setIsFetching(prev => ({ ...prev, courses: true }));
    console.warn(`[API GET] Fetching courses for: ${caller}`);

    try {
      const data = await getAllCourses(caller);
      setCourses(Array.isArray(data) ? data : []);
      setCoursesTimestamp(Date.now());
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setIsFetching(prev => ({ ...prev, courses: false }));
    }
  }, [courses.length, coursesTimestamp, isCacheValid, isFetching.courses]);


  const fetchLessonsIfNeeded = useCallback(async (caller = "Unknown") => {
    if (isFetching.lessons) return;

    if (lessons.length > 0 && isCacheValid(lessonsTimestamp)) {
      console.log(`[Cache] Lessons are fresh, skipping fetch for: ${caller}`);
      return;
    }

    setIsFetching(prev => ({ ...prev, lessons: true }));

    try {
      const data = await getAllLessons(caller);
      setLessons(Array.isArray(data) ? data : []);
      setLessonsTimestamp(Date.now());
    } catch (err) {
      console.error("Failed to fetch lessons:", err);
    } finally {
      setIsFetching(prev => ({ ...prev, lessons: false }));
    }
  }, [lessons.length, lessonsTimestamp, isCacheValid, isFetching.lessons]);


  const fetchLecturersIfNeeded = useCallback(async (caller = "Unknown") => {
    if (isFetching.lecturers) return;

    if (lecturers.length > 0 && isCacheValid(lecturersTimestamp)) {
      console.log(`[Cache] Lecturers are fresh, skipping fetch for: ${caller}`);
      return;
    }

    setIsFetching(prev => ({ ...prev, lecturers: true }));

    try {
      const data = await getAllLecturers(caller);
      setLecturers(Array.isArray(data) ? data : []);
      setLecturersTimestamp(Date.now());
    } catch (err) {
      console.error("Failed to fetch lecturers:", err);
    } finally {
      setIsFetching(prev => ({ ...prev, lecturers: false }));
    }
  }, [lecturers.length, lecturersTimestamp, isCacheValid, isFetching.lecturers]);



  const fetchClassroomsIfNeeded = useCallback(async (caller = "Unknown") => {
    if (isFetching.classrooms) return;

    if (classrooms.length > 0 && isCacheValid(classroomsTimestamp)) {
      console.log(`[Cache] Classrooms are fresh, skipping fetch for: ${caller}`);
      return;
    }

    setIsFetching(prev => ({ ...prev, classrooms: true }));

    try {
      const data = await getAllClassrooms(caller);
      setClassrooms(Array.isArray(data) ? data : []);
      setClassroomsTimestamp(Date.now());
    } catch (err) {
      console.error("Failed to fetch classrooms:", err);
    } finally {
      setIsFetching(prev => ({ ...prev, classrooms: false }));
    }
  }, [classrooms.length, classroomsTimestamp, isCacheValid, isFetching.classrooms]);



  // הפתרון: שימוש ב-useMemo כדי למנוע יצירת אובייקט חדש בכל רינדור
  const contextValue = useMemo(() => ({
    // Data
    lessons,
    setLessons,
    courses,
    setCourses,
    classrooms,
    setClassrooms,
    lecturers,
    setLecturers,
    schedule,
    setSchedule,
    
    // Cache validation
    isCacheValid,
    lessonsTimestamp,
    setLessonsTimestamp,
    coursesTimestamp,
    setCoursesTimestamp,
    classroomsTimestamp,
    setClassroomsTimestamp,
    lecturersTimestamp,
    setLecturersTimestamp,
    
    // Cache invalidation
    invalidateLessonsCache,
    invalidateCoursesCache,
    invalidateClassroomsCache,
    invalidateLecturersCache,
    invalidateAllCache,

    // Fetching state
    fetchCoursesIfNeeded,
    fetchLessonsIfNeeded,
    fetchLecturersIfNeeded,
    fetchClassroomsIfNeeded,
  }), [
    // רשימת התלויות: האובייקט ייווצר מחדש רק כשאחד מאלה ישתנה
    lessons, courses, classrooms, lecturers,schedule,
    lessonsTimestamp, coursesTimestamp, classroomsTimestamp, lecturersTimestamp,
    isCacheValid, 
    invalidateLessonsCache, invalidateCoursesCache, 
    invalidateClassroomsCache, invalidateLecturersCache, invalidateAllCache,
    fetchCoursesIfNeeded, fetchLessonsIfNeeded, fetchLecturersIfNeeded, fetchClassroomsIfNeeded
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}