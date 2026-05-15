import React, { useState, useEffect, useCallback, useMemo , useRef} from "react";
import { useNavigate } from "react-router-dom";
import { generateTimetable, cancelGeneration } from "../services/api";
import Button from "../components/ui/Button";
import Toast, { useToast } from "../components/ui/Toast";
import "./GeneratePage.css";
import { useData } from "../context/DataContext";
import ManualAssignmentModal from "../components/ManualAssignmentModal";
import HardCourseModal from "../components/HardCourseModal";
import InfoButton from "../components/InfoButton";
import Modal from "../components/ui/Modal";



const DAY_NAMES = { 1: "ראשון", 2: "שני", 3: "שלישי", 4: "רביעי", 5: "חמישי", 6: "שישי" };
const getStartTimeByFrame = (frame) => {
  const times = { 1: "08:30", 2: "09:30", 3: "10:30", 4: "11:30", 5: "12:30", 6: "13:50", 7: "14:50", 8: "15:50", 9: "16:50", 10: "17:50", 11: "18:50", 12: "19:50" };
  return times[frame] || "Unknown";
}



export default function GeneratePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const isCancellingRef = useRef(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const { 
      setSchedule, 
      fetchLessonsIfNeeded, 
      fetchLecturersIfNeeded, 
      fetchClassroomsIfNeeded,
      fetchCoursesIfNeeded,
      courses,
      lessons,
      semester,
      setSemester,
      
      generatorWeights: weights, 
      setGeneratorWeights: setWeights,
      manualAssignments, 
      setManualAssignments,
      hardCourses, 
      setHardCourses,
      englishCourses, 
      setEnglishCourses,
      requiredCapacities, 
      setRequiredCapacities,
      electiveCapacity, 
      setElectiveCapacity
    } = useData();


  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isHardModalOpen, setIsHardModalOpen] = useState(false);
  const [isEnglishModalOpen, setIsEnglishModalOpen] = useState(false);
  const [showSemesterValidation, setShowSemesterValidation] = useState(false);


  const handleAddManualAssignment = (newAssignment) => {
    setManualAssignments((prev) => [...prev, newAssignment]);
  };

  const handleRemoveManualAssignment = (indexToRemove) => {
    setManualAssignments((prev) => prev.filter((_, index) => index !== indexToRemove));
  };


  const confirmCancel = async () => {
    setShowCancelConfirm(false); 
    setIsCancelling(true);     
    isCancellingRef.current = true;  
    try {
      await cancelGeneration();
    } catch (err) {
      console.error("Failed to trigger cancel:", err);
      setIsCancelling(false);
    }
  };


  React.useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchLessonsIfNeeded("GeneratePage"),
          fetchLecturersIfNeeded("GeneratePage"),
          fetchClassroomsIfNeeded("GeneratePage"),
          fetchCoursesIfNeeded("GeneratePage"),
        ]);
      } catch (err) {
        console.error("Failed to load data for generator:", err);
      }
    };

    loadInitialData();
 }, [fetchLessonsIfNeeded, fetchLecturersIfNeeded, fetchClassroomsIfNeeded, fetchCoursesIfNeeded]);


  const constraintDetails = {
    "RoomSizeEfficiency": { 
        label: "Optimize Classroom Capacity", 
        desc: "Prevents wasting large classrooms on small groups, keeping them available for larger courses." 
    },
    "PreferMorningForHardCourses": { 
        label: "Morning Peak Performance", 
        desc: "Schedules demanding courses in the early morning when students are most focused." 
    },
    "LecturerCompactSchedule": { 
        label: "Compact Staff Schedule", 
        desc: "Minimizes waiting times for lecturers by grouping their teaching hours and preventing single-lesson campus visits." 
    },
    "CourseComponentsOverlap": { 
        label: "Prevent Component Overlap", 
        desc: "Ensures lectures for the same course aren't scheduled on the same day, while also preventing tutorial overlaps, giving students time to process the material." 
    },
    "MandatoryMorningPreferred": { 
        label: "Core Courses in the Morning", 
        desc: "Prioritizes scheduling mandatory and core subjects during the earlier, more convenient hours of the day." 
    },
    "ElectiveEveningPreferred": { 
        label: "Later Slots for Electives", 
        desc: "Shifts elective and enrichment courses to the afternoon and evening, freeing up mornings for mandatory courses." 
    },
    "InconvenientTiming": { 
        label: "Avoid Late Hours & Fridays", 
        desc: "Minimizes classes on Fridays or during late evening hours as much as possible (except for English courses)." 
    },
    "ElectiveCourseInTheSameClassroom": { 
        label: "Elective Room Grouping", 
        desc: "Keeps all lessons of a specific elective course in the exact same classroom to prevent students from moving around unnecessarily." 
    },
    "AvoidBuildingP": {
          label: "Avoid Building P",
          desc: "Prefers scheduling lessons in any other building, using Building P only when no other classrooms are available across the campus."
      },
    "LecturerPreference": {
          label: "Lecturer Preferences",
          desc: "Respects lecturers' requests by avoiding scheduling classes during hours they prefer not to teach."
      },
    "EnglishCourseTiming": {  
          label: "English Course Optimal Timing",
          desc: "Schedules English courses during their traditional time slots (Friday mornings or weekday afternoons)."
      },
    "LoadBalancing": {  
          label: "Campus Load Balancing",
          desc: "Spreads lessons across the week to prevent overcrowding and having too many concurrent classes."
      },
    "ClusterOverlap": {
          label: "Cluster Overlap Avoidance",
          desc: "Crucial: Prevents scheduling two courses from the same track or semester at the same time, ensuring students can attend both."
      }
  };

  const handleSemesterChange = (e) => {
    const selectedSem = e.target.value;
    setSemester(selectedSem);
    
    // מנקים הגדרות של סמסטר קודם
    setManualAssignments([]);
    setHardCourses([]);

    if (selectedSem && courses.length > 0) {
      const ENGLISH_IDS = ["11360", "11064", "11063", "11361", "11060"];
      
      // אוספים את כל ה-ID של הקורסים שיש להם שיעורים בסמסטר שנבחר
      const activeIdsInSemester = new Set(
          lessons.filter(l => l.semester === selectedSem).map(l => l.courseId)
      );

      // מוצאים מתוך כל הקורסים את קורסי האנגלית ששייכים לסמסטר הזה
      const autoEnglishCourses = courses.filter(c => 
          ENGLISH_IDS.includes(c.courseId) && 
          (c.semester === selectedSem || activeIdsInSemester.has(c.courseId))
      );

      setEnglishCourses(autoEnglishCourses);
    } else {
      setEnglishCourses([]);
    }
  };

  const handleWeightChange = (constraintName, value) => {
    setWeights((prev) => ({ ...prev, [constraintName]: parseFloat(value) }));
  };

  const handleGenerateClick = () => {
    if (!semester) {
      setShowSemesterValidation(true); // מקפיץ את המודל אם הסמסטר ריק
    } else {
      handleGenerate(); // ממשיך ליצירת המערכת אם הכל תקין
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setIsCancelling(false);
    isCancellingRef.current = false;
    try {
      const requestData = { 
        semester, 
        softConstraintWeights: weights, 
        manualAssignments, 
        hardCourseIds: hardCourses.map(c => c.courseId),
        englishCourseIds: englishCourses.map(c => c.courseId),
        requiredCapacities, 
        electiveCapacity 
      };
      
      const generatedSchedule = await generateTimetable(requestData);
      setSchedule(generatedSchedule);
      navigate("/timetable");
    } catch (err) {
      console.error("Full Error Object:", err);
      
      const errorMessage = err.response?.data || err.message || "";
      
      if (isCancellingRef.current || errorMessage.includes("CANCELLED_BY_USER") || errorMessage.toLowerCase().includes("cancel")) {
        console.log("Timetable generation was successfully cancelled by the user.");
        setLoading(false);
        setIsCancelling(false);
        isCancellingRef.current = false;
        return; // עוצרים נקי בלי הודעת שגיאה
      }

      let friendlyMessage = "We couldn't find a valid schedule with the current constraints.";
      
      try {
        const errorBody = JSON.parse(err.message.replace(/Generation failed: \d+ /, ""));
        if (errorBody.message) {
          friendlyMessage = errorBody.message;
        }
      } catch (e) {
        if (typeof err.message === 'string' && !err.message.includes("{")) {
            friendlyMessage = err.message;
        }
      }

      setError(friendlyMessage);
      setLoading(false);
    }
  };

  return (
    <div className="generate-page">
      <div className="generate-header">
        <h1>
          <span className="material-icons generator-icon">auto_awesome</span>
          AI Timetable Engine
        </h1>
        <p>Let our intelligent algorithm create the perfect schedule for your courses. Configure your preferences below and generate an optimized timetable in seconds.</p>
      </div>

      {/* --- Error Modal Popup --- */}
      {error && (
        <div className="error-modal-overlay">
          <div className="error-modal-content">
            <div className="error-modal-header">
              <span className="material-icons warning-icon">warning_amber</span>
              <h2>Scheduling Conflict</h2>
            </div>
            
            <div className="error-modal-body">
              <p className="main-error-text">{error}</p>
              
              <div className="suggestions-box">
                <h4>Suggested Actions:</h4>
                <ul>
                  {manualAssignments.length > 0 && (
                    <li><strong>Manual Assignments:</strong> Try removing fixed lessons to give the AI more flexibility.</li>
                  )}
                  <li><strong>Lecturers:</strong> Check if someone is blocked (Unavailable) on too many slots.</li>
                  <li><strong>Capacities:</strong> Ensure your requested student count isn't too high for the available rooms.</li>
                </ul>
              </div>
            </div>

            <div className="error-modal-footer">
              <Button variant="primary" onClick={() => setError("")}>
                I'll adjust the settings
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 1 */}
      <div className="generate-card">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h3 style={{ margin: 0 }}>
            <span className="material-icons">calendar_month</span>
            1. Target Semester
          </h3>
          <InfoButton 
            title="What is a Semester?"
            description="A semester is a complete academic term. Select which semester (A or B) you want to create a schedule for. All courses assigned to that semester will be scheduled."
          />
        </div>
        <div className="form-group">
          <label>Choose which semester to schedule:</label>
          <select 
            className="semester-select"
            value={semester} 
            onChange={handleSemesterChange}
          >
            <option value="" disabled>-- Select Semester --</option>
            <option value="A">Semester A</option>
            <option value="B">Semester B</option>
          </select>
        </div>
      </div>

      <div className="generate-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h3 style={{ margin: 0 }}>
              <span className="material-icons">push_pin</span>
              2. Manual Assignments (Lock in Specific Times)
            </h3>
            <InfoButton 
              title="What are Manual Assignments?"
              description="Use this if you have specific lessons that MUST be scheduled at an exact time and room. The algorithm will lock them in place and build the rest of the schedule around them."
            />
          </div>
          <Button variant="secondary" onClick={() => setIsManualModalOpen(true)}>
            + Add Assignment
          </Button>
        </div>
        <p className="hint-text">
          Need a lesson at a specific time? Lock it in here and let the algorithm organize everything else around it.
        </p>

        {manualAssignments.length > 0 && (
          <div className="manual-assignments-list" style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {manualAssignments.map((assignment, index) => (
              <div key={index} style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div>
                  <strong>{assignment.courseName} ({assignment.type})</strong>
                  <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                    Lecturer: {assignment.lecturer} | {DAY_NAMES[assignment.day]}, {getStartTimeByFrame(assignment.startFrame)} - {getStartTimeByFrame(assignment.startFrame + assignment.duration)} | Room: Building {assignment.building}, {assignment.classroomName}
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveManualAssignment(index)} 
                  style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                >
                  <span className="material-icons">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hard Courses Section */}
      <div className="generate-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h3 style={{ margin: 0 }}>
              <span className="material-icons">priority_high</span>
              3. Challenging Courses (Morning Preference)
            </h3>
            <InfoButton 
              title="Why Morning for Hard Courses?"
              description="Difficult courses require maximum student focus. By scheduling them in the morning when students are most alert and energized, they learn better. Use this for demanding subjects like advanced math, physics, or programming."
            />
          </div>
          <Button variant="secondary" onClick={() => setIsHardModalOpen(true)}>+ Add Course</Button>
        </div>
        
        {hardCourses.length > 0 && (
          <div style={{ marginTop: "15px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {hardCourses.map((c, index) => (
              <div key={index} className="badge" style={{ background: "#fee2e2", color: "#991b1b", padding: "8px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>{c.courseName}</span>
                <span className="material-icons" style={{ fontSize: "16px", cursor: "pointer" }} onClick={() => setHardCourses(prev => prev.filter((_, i) => i !== index))}>close</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* English Courses Section */}
      <div className="generate-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h3 style={{ margin: 0 }}>
              <span className="material-icons">language</span>
              English Courses (Friday / Afternoon Preference)
            </h3>
            <InfoButton 
              title="What are English Courses?"
              description="These courses will be specifically targeted to be scheduled on Fridays or late afternoons."
            />
          </div>
          <Button variant="secondary" onClick={() => setIsEnglishModalOpen(true)}>+ Add Course</Button>
        </div>
        
        {englishCourses.length > 0 && (
          <div style={{ marginTop: "15px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {englishCourses.map((c, index) => (
              <div key={index} className="badge" style={{ background: "#e0e7ff", color: "#3730a3", padding: "8px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>{c.courseName}</span>
                <span className="material-icons" style={{ fontSize: "16px", cursor: "pointer" }} onClick={() => setEnglishCourses(prev => prev.filter((_, i) => i !== index))}>close</span>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* 🔥 Step 3: Lesson Capacity Requirements */}
      <div className="generate-card">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h3 style={{ margin: 0 }}>
            <span className="material-icons">groups</span>
            4. Classroom Size Requirements
          </h3>
          <InfoButton 
            title="Why Specify Class Sizes?"
            description="Different lesson types need different room sizes. A lecture for 100 students needs a large hall, while a lab for 20 students needs a smaller space. The algorithm will automatically select appropriate classrooms based on these numbers."
          />
        </div>
        <p className="hint-text">
          Tell us the expected number of students for each lesson type, and we'll find suitable classrooms automatically.
        </p>
        
        <div className="capacity-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px', 
          marginTop: '20px' 
        }}>
          {Object.entries(requiredCapacities).map(([type, value]) => {
            const typeIcons = {
              'LECTURE': 'school',
              'TUTORIAL': 'groups',
              'LAB': 'science',
              'PHYSICS_LAB': 'bolt',
              'NETWORKING_LAB': 'router',
              'PBL': 'lightbulb'
            };
            const typeColors = {
              'LECTURE': '#3b82f6',
              'TUTORIAL': '#10b981',
              'LAB': '#f59e0b',
              'PHYSICS_LAB': '#8b5cf6',
              'NETWORKING_LAB': '#ec4899',
              'PBL': '#f97316'
            };
            
            return (
              <div key={type} style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: `2px solid ${typeColors[type]}20`,
                borderRadius: '12px',
                padding: '16px',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: typeColors[type],
                  boxShadow: `0 4px 12px ${typeColors[type]}15`
                }
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span className="material-icons" style={{ 
                    color: typeColors[type], 
                    fontSize: '24px'
                  }}>
                    {typeIcons[type]}
                  </span>
                  <label style={{ 
                    fontSize: '0.9rem', 
                    color: '#1e293b', 
                    fontWeight: '700',
                    margin: 0,
                    textTransform: 'capitalize'
                  }}>
                    {type.replace('_', ' ').toLowerCase()}
                  </label>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="number"
                    style={{ 
                      width: '100%',
                      padding: '12px',
                      border: `2px solid ${typeColors[type]}40`,
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      color: typeColors[type],
                      backgroundColor: '#fff',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    value={value}
                    min="1"
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setRequiredCapacities(prev => ({ ...prev, [type]: val }));
                    }}
                    onFocus={(e) => e.target.style.borderColor = typeColors[type]}
                    onBlur={(e) => e.target.style.borderColor = `${typeColors[type]}40`}
                  />
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    padding: '4px 8px',
                    backgroundColor: `${typeColors[type]}10`,
                    borderRadius: '6px'
                  }}>
                    students
                  </span>
                </div>
              </div>
            );
          })}
          
          {/* Elective Course Capacity */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '2px solid #a78bfa20',
            borderRadius: '12px',
            padding: '16px',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span className="material-icons" style={{ 
                color: '#a78bfa', 
                fontSize: '24px'
              }}>
                star
              </span>
              <label style={{ 
                fontSize: '0.9rem', 
                color: '#1e293b', 
                fontWeight: '700',
                margin: 0
              }}>
                Elective courses
              </label>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="number"
                style={{ 
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #a78bfa40',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  color: '#a78bfa',
                  backgroundColor: '#fff',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                value={electiveCapacity}
                min="1"
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setElectiveCapacity(val);
                }}
                onFocus={(e) => e.target.style.borderColor = '#a78bfa'}
                onBlur={(e) => e.target.style.borderColor = '#a78bfa40'}
              />
              <span style={{
                fontSize: '0.75rem',
                color: '#64748b',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                padding: '4px 8px',
                backgroundColor: '#a78bfa10',
                borderRadius: '6px'
              }}>
                students
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="generate-card">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h3 style={{ margin: 0 }}>
            <span className="material-icons">settings_input_component</span>
            5. Fine-Tune Scheduling Priorities
          </h3>
          <InfoButton 
            title="How to Use Sliders?"
            description="Each slider controls how important a scheduling rule is. Set to 10 (High) to make it a top priority, or 0 (Low) to ignore it. For example, set 'Compact Staff Schedule' to 10 if your lecturers want minimal campus visits."
          />
        </div>
        <p className="hint-text">
          Adjust each priority slider (0 = Low, 10 = High) to customize how the algorithm schedules your timetable. Higher values mean the algorithm will work harder to satisfy that rule.
        </p>

        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%)',
          border: '1px solid #e0f2fe',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <span className="material-icons" style={{ color: '#0ea5e9', marginTop: '2px', flexShrink: 0, fontSize: '20px' }}>lightbulb</span>
          <div style={{ color: '#0c4a6e', fontSize: '0.9rem', lineHeight: '1.5' }}>
            <strong>Quick tip:</strong> Mix high and low priorities for the best results. If everything is set to 10, the algorithm can't prioritize what truly matters to you.
          </div>
        </div>
        
        {Object.keys(weights).map((constraint) => (
          <div key={constraint} className="constraint-row" style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <div className="constraint-info">
                <span className="constraint-name">{constraintDetails[constraint].label}</span>
                <span className="constraint-desc">{constraintDetails[constraint].desc}</span>
              </div>
              
              <input 
                type="range" 
                className="weight-slider"
                min="0" max="10" step="1" 
                value={weights[constraint]} 
                onChange={(e) => handleWeightChange(constraint, e.target.value)}
              />
              
              <div className="weight-badge">{weights[constraint]}</div>
            </div>
            
            {weights[constraint] == 0 && (
              <div style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "8px", fontWeight: "500", marginLeft: "250px" }}>
                <span className="material-icons" style={{ fontSize: "14px", verticalAlign: "middle", marginRight: "4px" }}>warning</span>
                Note: Assigning a weight of 0 will cause this constraint to be completely ignored.
              </div>
            )}
            
          </div>
        ))}
      </div>

      {/* Primary Action Button */}
      <div className="generate-footer">
        <Button 
          onClick={handleGenerateClick} /* <-- שינינו לפונקציה החדשה */
          disabled={loading} /* <-- החזרנו רק לטעינה */
          variant="primary"
          className="generate-big-button"
        >
           <div className="button-label">
               <span>Generate Optimal Schedule</span>
               <span className="material-icons">rocket_launch</span>
           </div>
        </Button>
      </div>

      {/* --- התוספת שלנו: מסך טעינה מלא --- */}
      {loading && (
        <div className="uploading-overlay">
          <div className="spinner"></div>
          <h2 style={{ color: "white", marginTop: "20px", fontWeight: "600", fontSize: "24px", textAlign: "center" }}>
            {isCancelling ? "Stopping Algorithm..." : "AI Algorithm is Processing..."}
          </h2>
          <p style={{ color: "#e2e8f0", marginTop: "8px", fontSize: "16px", textAlign: "center" }}>
            {isCancelling 
              ? "Safely aborting the process. Please wait a moment." 
              : <>Analyzing thousands of possibilities to build the perfect schedule.<br/>This may take up to 1-2 minutes.</>
            }
          </p>
          
          {!isCancelling && (
            <Button 
              variant="secondary"
              onClick={() => setShowCancelConfirm(true)} // פותח את המודל במקום לבטל ישר
              style={{ 
                marginTop: "24px", 
                backgroundColor: "rgba(255, 255, 255, 0.1)", 
                color: "white", 
                borderColor: "rgba(255, 255, 255, 0.3)" 
              }}
            >
              <span className="material-icons" style={{ marginRight: "8px", verticalAlign: "middle" }}>stop_circle</span>
              Cancel Generation
            </Button>
          )}
        </div>
      )}
      {/* --------------------------------- */}




      <ManualAssignmentModal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)}
        onSave={handleAddManualAssignment}
        currentSemester={semester}
      />


      <HardCourseModal 
        isOpen={isHardModalOpen} 
        onClose={() => setIsHardModalOpen(false)} 
        onSave={(c) => setHardCourses(prev => [...prev, c])}
        currentSemester={semester}
        title="Add Challenging Course"
        actionText="Mark as Hard"
        description="Selected courses will have their Lectures prioritized for morning slots (8:30 - 12:30)."
      />


      <HardCourseModal 
        isOpen={isEnglishModalOpen} 
        onClose={() => setIsEnglishModalOpen(false)} 
        onSave={(c) => setEnglishCourses(prev => [...prev, c])}
        currentSemester={semester}
        title="Add English Course"
        actionText="Add Course"
        description="These courses will be prioritized for Friday mornings or weekday afternoons."
      />

      <Modal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        title="Stop Generation?"
        variant="warning"
        centerContent={true}
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", width: "100%" }}>
            <Button variant="secondary" onClick={() => setShowCancelConfirm(false)}>
              No, Keep Going
            </Button>
            <Button variant="danger" onClick={confirmCancel}>
              Yes, Stop
            </Button>
          </div>
        }
      >
        <p style={{ textAlign: "center", fontSize: "16px", margin: 0, color: "#334155" }}>
          Are you sure you want to stop the AI from generating the schedule?<br/>
          Any progress will be lost.
        </p>
      </Modal>


      <Modal
        isOpen={showSemesterValidation}
        onClose={() => setShowSemesterValidation(false)}
        title="Missing Information"
        variant="warning"
        centerContent={true}
        footer={
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Button variant="primary" onClick={() => setShowSemesterValidation(false)}>
              Got it
            </Button>
          </div>
        }
      >
        <p style={{ textAlign: "center", fontSize: "16px", margin: 0, color: "#334155" }}>
          Please select a <strong>Target Semester</strong> (A or B) at the top of the page before generating the schedule.
        </p>
      </Modal>




    </div>
  );
}