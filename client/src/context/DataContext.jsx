import { createContext, useContext, useState, useCallback, useMemo } from "react";

const DataContext = createContext();

// Cache duration in milliseconds (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;

export function DataProvider({ children }) {
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  
  // Cache timestamps
  const [lessonsTimestamp, setLessonsTimestamp] = useState(null);
  const [coursesTimestamp, setCoursesTimestamp] = useState(null);
  const [classroomsTimestamp, setClassroomsTimestamp] = useState(null);
  const [lecturersTimestamp, setLecturersTimestamp] = useState(null);

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
  }), [
    // רשימת התלויות: האובייקט ייווצר מחדש רק כשאחד מאלה ישתנה
    lessons, courses, classrooms, lecturers,
    lessonsTimestamp, coursesTimestamp, classroomsTimestamp, lecturersTimestamp,
    isCacheValid, 
    invalidateLessonsCache, invalidateCoursesCache, 
    invalidateClassroomsCache, invalidateLecturersCache, invalidateAllCache
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