import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { getAllCourses, getAllLessons, getAllClassrooms, getAllLecturers, getTimetableHistory, getTimetableById , getAllClusters} from "../services/api";

const DataContext = createContext();

// Cache duration in milliseconds (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;

export function DataProvider({ children }) {
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [currentTimetableMetadata, setCurrentTimetableMetadata] = useState(null); 
  const [history, setHistory] = useState([]);
  const [clusters, setClusters] = useState([]);
  
  // Cache timestamps
  const [lessonsTimestamp, setLessonsTimestamp] = useState(null);
  const [coursesTimestamp, setCoursesTimestamp] = useState(null);
  const [classroomsTimestamp, setClassroomsTimestamp] = useState(null);
  const [lecturersTimestamp, setLecturersTimestamp] = useState(null);
  const [historyTimestamp, setHistoryTimestamp] = useState(null);
  const [clustersTimestamp, setClustersTimestamp] = useState(null);


  const [isFetching, setIsFetching] = useState({
    courses: false,
    lessons: false,
    classrooms: false,
    lecturers: false,
    history: false,
    clusters: false
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

  const invalidateHistoryCache = useCallback(() => {
    setHistoryTimestamp(null);
  }, []);

  const invalidateClustersCache = useCallback(() => {
    setClustersTimestamp(null);
  }, []);


  // Invalidate all caches
  const invalidateAllCache = useCallback(() => {
    setLessonsTimestamp(null);
    setCoursesTimestamp(null);
    setClassroomsTimestamp(null);
    setLecturersTimestamp(null);
    setHistoryTimestamp(null);
    setClustersTimestamp(null);
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
  }, [coursesTimestamp, isCacheValid]);


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


  const fetchHistoryIfNeeded = useCallback(async (caller = "Unknown") => {
    if (isFetching.history) return;

    if (history.length > 0 && isCacheValid(historyTimestamp)) {
      console.log(`[Cache] History is fresh, skipping fetch for: ${caller}`);
      return;
    }
    setIsFetching(prev => ({ ...prev, history: true }));
    try {
      const data = await getTimetableHistory(caller);
      setHistory(Array.isArray(data) ? data : []);
      setHistoryTimestamp(Date.now());
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setIsFetching(prev => ({ ...prev, history: false }));
    }
  }, [history.length, historyTimestamp, isCacheValid, isFetching.history]);


  const fetchClustersIfNeeded = useCallback(async (caller = "Unknown") => {
    if (isFetching.clusters) return;

    if (clusters.length > 0 && isCacheValid(clustersTimestamp)) {
      console.log(`[Cache] Clusters are fresh, skipping fetch for: ${caller}`);
      return;
    }

    setIsFetching(prev => ({ ...prev, clusters: true }));

    try {
      const data = await getAllClusters(caller);
      setClusters(Array.isArray(data) ? data : []);
      setClustersTimestamp(Date.now());
    } catch (err) {
      console.error("Failed to fetch clusters:", err);
    } finally {
      setIsFetching(prev => ({ ...prev, clusters: false }));
    }
  }, [clusters.length, clustersTimestamp, isCacheValid, isFetching.clusters]);


  const loadTimetableFromHistory = useCallback(async (id, caller = "Unknown") => {
    try {
      const fullSchedule = await getTimetableById(id, caller);
      const metadata = history.find(h => h.id === id);
      
      setSchedule(fullSchedule);
      setCurrentTimetableMetadata(metadata || null);
      return true; 
    } catch (err) {
      console.error("Failed to load full timetable:", err);
      return false; 
    }
  }, [history]);


  const clusterMappings = useMemo(() => {
    const numToName = {};
    const nameToNum = {};
    
    clusters.forEach(c => {
      numToName[c.number] = c.name;
      nameToNum[c.name] = c.number;
    });

    return { numToName, nameToNum };
  }, [clusters]);




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
    currentTimetableMetadata,
    setCurrentTimetableMetadata,
    history,
    setHistory,
    loadTimetableFromHistory,
    clusters,
    setClusters,
    clusterMappings,

    
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
    historyTimestamp,
    setHistoryTimestamp,
    clustersTimestamp,
    setClustersTimestamp,

    
    // Cache invalidation
    invalidateLessonsCache,
    invalidateCoursesCache,
    invalidateClassroomsCache,
    invalidateLecturersCache,
    invalidateAllCache,
    invalidateHistoryCache,
    invalidateClustersCache,


    // Fetching state
    fetchCoursesIfNeeded,
    fetchLessonsIfNeeded,
    fetchLecturersIfNeeded,
    fetchClassroomsIfNeeded,
    fetchHistoryIfNeeded,
    updateCoursesLocally,
    fetchClustersIfNeeded
  }), [
    lessons, courses, classrooms, lecturers, schedule, currentTimetableMetadata, history,
    lessonsTimestamp, coursesTimestamp, classroomsTimestamp, lecturersTimestamp, historyTimestamp,
    isCacheValid, 
    invalidateLessonsCache, invalidateCoursesCache, 
    invalidateClassroomsCache, invalidateLecturersCache, invalidateHistoryCache, invalidateAllCache,
    fetchCoursesIfNeeded, fetchLessonsIfNeeded, fetchLecturersIfNeeded, fetchClassroomsIfNeeded, fetchHistoryIfNeeded, loadTimetableFromHistory, updateCoursesLocally,
    clusters, clustersTimestamp, clusterMappings, invalidateClustersCache, fetchClustersIfNeeded
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