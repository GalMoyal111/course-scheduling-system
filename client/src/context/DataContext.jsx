import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { getAllCourses, getAllLessons, getAllClassrooms, getAllLecturers, getTimetableHistory, getTimetableById , getAllClusters , getSystemAvailability, getClassroomSizeSettings} from "../services/api";

const DataContext = createContext();

// Cache duration in milliseconds (30 minutes)
const CACHE_DURATION = 60 * 60 * 1000;

export function DataProvider({ children }) {
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [currentTimetableMetadata, setCurrentTimetableMetadata] = useState(null); 
  const [history, setHistory] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [electiveCapacity, setElectiveCapacity] = useState(25);
  const [systemBlockedSlots, setSystemBlockedSlots] = useState([]);
  const [systemBlockedSlotsTimestamp, setSystemBlockedSlotsTimestamp] = useState(null);
  const [classroomSizeSettingsTimestamp, setClassroomSizeSettingsTimestamp] = useState(null);
  

  const [generatorWeights, setGeneratorWeights] = useState({
    "RoomSizeEfficiency": 5.0,
    "PreferMorningForHardCourses": 5.0,
    "LecturerCompactSchedule": 5.0,
    "CourseComponentsOverlap": 5.0,
    "MandatoryMorningPreferred": 5.0,
    "ElectiveEveningPreferred": 5.0,
    "InconvenientTiming": 5.0,
    "ElectiveCourseInTheSameClassroom": 5.0,
    "AvoidBuildingP": 5.0,
    "LecturerPreference": 5.0,
    "EnglishCourseTiming": 5.0,
    "LoadBalancing": 5.0,
    "ClusterOverlap": 5.0
  });
  const [manualAssignments, setManualAssignments] = useState([]);
  const [hardCourses, setHardCourses] = useState([]);
  const [semester, setSemester] = useState("");
  const [englishCourses, setEnglishCourses] = useState([]);
  const [virtualCourses, setVirtualCourses] = useState([]);
  const [requiredCapacities, setRequiredCapacities] = useState({LECTURE: 60,TUTORIAL: 40,LAB: 20,PHYSICS_LAB: 15,NETWORKING_LAB: 12});


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
    clusters: false,
    systemBlockedSlots: false,
    classroomSizeSettings: false
  });

  const updateCoursesLocally = useCallback((newCourses) => {
    setCourses(newCourses);
    setCoursesTimestamp(Date.now());
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

  const invalidateSystemSlotsCache = useCallback(() => {
    setSystemBlockedSlotsTimestamp(null);
  }, []);

  const invalidateClassroomSizeSettingsCache = useCallback(() => {
    setClassroomSizeSettingsTimestamp(null);
  }, []);


  // Invalidate all caches
  const invalidateAllCache = useCallback(() => {
    setLessonsTimestamp(null);
    setCoursesTimestamp(null);
    setClassroomsTimestamp(null);
    setLecturersTimestamp(null);
    setHistoryTimestamp(null);
    setClustersTimestamp(null);
    setSystemBlockedSlotsTimestamp(null);
    setClassroomSizeSettingsTimestamp(null);
  }, []);

  const fetchCoursesIfNeeded = useCallback(async (caller = "Unknown", forceFetch = false) => {
    if (isFetching.courses) return;

    if (!forceFetch && isCacheValid(coursesTimestamp)) {
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


  const fetchLessonsIfNeeded = useCallback(async (caller = "Unknown", forceFetch = false) => {
    if (isFetching.lessons) return;

    if (!forceFetch && isCacheValid(lessonsTimestamp)) {
      console.log(`[Cache] Lessons are fresh, skipping fetch for: ${caller}`);
      return;
    }

    setIsFetching(prev => ({ ...prev, lessons: true }));
    console.warn(`[API GET] Fetching lessons for: ${caller}`);

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


  const fetchLecturersIfNeeded = useCallback(async (caller = "Unknown", forceFetch = false) => {
    if (isFetching.lecturers) return;

    if (!forceFetch && isCacheValid(lecturersTimestamp)) {
      console.log(`[Cache] Lecturers are fresh, skipping fetch for: ${caller}`);
      return;
    }

    setIsFetching(prev => ({ ...prev, lecturers: true }));
    console.warn(`[API GET] Fetching lecturers for: ${caller}`);

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



  const fetchClassroomsIfNeeded = useCallback(async (caller = "Unknown", forceFetch = false) => {
    if (isFetching.classrooms) return;

    if (!forceFetch && isCacheValid(classroomsTimestamp)) {
      console.log(`[Cache] Classrooms are fresh, skipping fetch for: ${caller}`);
      return;
    }

    setIsFetching(prev => ({ ...prev, classrooms: true }));
    console.warn(`[API GET] Fetching classrooms for: ${caller}`);

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


  const fetchHistoryIfNeeded = useCallback(async (caller = "Unknown", forceFetch = false) => {
    if (isFetching.history) return;

    if (!forceFetch && isCacheValid(historyTimestamp)) {
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

    if (isCacheValid(clustersTimestamp)) {
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


  const fetchSystemBlockedSlotsIfNeeded = useCallback(async (caller = "Unknown", forceFetch = false) => {
    if (isFetching.systemBlockedSlots) return;

    if (!forceFetch && isCacheValid(systemBlockedSlotsTimestamp)) {
      console.log(`[Cache] System blocked slots are fresh, skipping fetch for: ${caller}`);
      return;
    }

    setIsFetching(prev => ({ ...prev, systemBlockedSlots: true }));
    console.warn(`[API GET] Fetching system blocked slots for: ${caller}`);

    try {
      const data = await getSystemAvailability(caller);
      setSystemBlockedSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch system blocked slots:", err);
    } finally {
      setSystemBlockedSlotsTimestamp(Date.now()); 
      setIsFetching(prev => ({ ...prev, systemBlockedSlots: false }));
    }
  }, [systemBlockedSlotsTimestamp, isCacheValid]); 

  const fetchClassroomSizeSettingsIfNeeded = useCallback(async (caller = "Unknown", forceFetch = false) => {
    if (isFetching.classroomSizeSettings) return;

    if (!forceFetch && isCacheValid(classroomSizeSettingsTimestamp)) {
      console.log(`[Cache] Classroom size settings are fresh, skipping fetch for: ${caller}`);
      return;
    }

    setIsFetching(prev => ({ ...prev, classroomSizeSettings: true }));
    console.warn(`[API GET] Fetching classroom size settings for: ${caller}`);

    try {
      const data = await getClassroomSizeSettings(caller);

      setRequiredCapacities({
        LECTURE: data.lectureSize,
        TUTORIAL: data.tutorialSize,
        LAB: data.labSize,
        PHYSICS_LAB: data.physicsLabSize,
        NETWORKING_LAB: data.networkingLabSize
      });

      setElectiveCapacity(data.electiveCourseSize);
      setClassroomSizeSettingsTimestamp(Date.now());
    } catch (err) {
      console.error("Failed to fetch classroom size settings:", err);
    } finally {
      setIsFetching(prev => ({ ...prev, classroomSizeSettings: false }));
    }
  }, [classroomSizeSettingsTimestamp, isCacheValid, isFetching.classroomSizeSettings]);


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
    systemBlockedSlots,
    setSystemBlockedSlots,
    

    generatorWeights, setGeneratorWeights,
    manualAssignments, setManualAssignments,
    hardCourses, setHardCourses,
    semester,
    setSemester,
    englishCourses, setEnglishCourses,
    virtualCourses, setVirtualCourses,
    requiredCapacities, setRequiredCapacities,
    electiveCapacity, setElectiveCapacity,
    
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
    systemBlockedSlotsTimestamp, 
    setSystemBlockedSlotsTimestamp,
    classroomSizeSettingsTimestamp,
    setClassroomSizeSettingsTimestamp,


    
    // Cache invalidation
    invalidateLessonsCache,
    invalidateCoursesCache,
    invalidateClassroomsCache,
    invalidateLecturersCache,
    invalidateAllCache,
    invalidateHistoryCache,
    invalidateClustersCache,
    invalidateSystemSlotsCache,
    invalidateClassroomSizeSettingsCache,


    // Fetching state
    fetchCoursesIfNeeded,
    fetchLessonsIfNeeded,
    fetchLecturersIfNeeded,
    fetchClassroomsIfNeeded,
    fetchHistoryIfNeeded,
    updateCoursesLocally,
    fetchClustersIfNeeded,
    fetchSystemBlockedSlotsIfNeeded,
    fetchClassroomSizeSettingsIfNeeded
  }), [
    lessons, courses, classrooms, lecturers, schedule, currentTimetableMetadata, history,
    lessonsTimestamp, coursesTimestamp, classroomsTimestamp, lecturersTimestamp, historyTimestamp,
    isCacheValid, 
    invalidateLessonsCache, invalidateCoursesCache, 
    invalidateClassroomsCache, invalidateLecturersCache, invalidateHistoryCache, invalidateAllCache,
    fetchCoursesIfNeeded, fetchLessonsIfNeeded, fetchLecturersIfNeeded, fetchClassroomsIfNeeded, fetchHistoryIfNeeded, loadTimetableFromHistory, updateCoursesLocally,
    clusters, clustersTimestamp, clusterMappings, invalidateClustersCache, fetchClustersIfNeeded,
    generatorWeights, manualAssignments, hardCourses, requiredCapacities, electiveCapacity,
    systemBlockedSlots, systemBlockedSlotsTimestamp, invalidateSystemSlotsCache, fetchSystemBlockedSlotsIfNeeded, englishCourses,classroomSizeSettingsTimestamp, invalidateClassroomSizeSettingsCache,fetchClassroomSizeSettingsIfNeeded, setEnglishCourses, semester, setSemester, virtualCourses, setVirtualCourses
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