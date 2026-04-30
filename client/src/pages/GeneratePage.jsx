import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { generateTimetable } from "../services/api";
import Button from "../components/ui/Button";
import Toast, { useToast } from "../components/ui/Toast";
import "./GeneratePage.css";
import { useData } from "../context/DataContext";
import ManualAssignmentModal from "../components/ManualAssignmentModal";
import HardCourseModal from "../components/HardCourseModal";


const DAY_NAMES = { 1: "ראשון", 2: "שני", 3: "שלישי", 4: "רביעי", 5: "חמישי", 6: "שישי" };
const getStartTimeByFrame = (frame) => {
  const times = { 1: "08:30", 2: "09:30", 3: "10:30", 4: "11:30", 5: "12:30", 6: "13:50", 7: "14:50", 8: "15:50", 9: "16:50", 10: "17:50", 11: "18:50", 12: "19:50" };
  return times[frame] || "Unknown";
}



export default function GeneratePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [semester, setSemester] = useState("A");

const { 
    setSchedule, 
    fetchLessonsIfNeeded, 
    fetchLecturersIfNeeded, 
    fetchClassroomsIfNeeded,
    fetchCoursesIfNeeded,
    
    generatorWeights: weights, 
    setGeneratorWeights: setWeights,
    manualAssignments, 
    setManualAssignments,
    hardCourses, 
    setHardCourses,
    requiredCapacities, 
    setRequiredCapacities
  } = useData();


  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isHardModalOpen, setIsHardModalOpen] = useState(false);


  const handleAddManualAssignment = (newAssignment) => {
    setManualAssignments((prev) => [...prev, newAssignment]);
  };

  const handleRemoveManualAssignment = (indexToRemove) => {
    setManualAssignments((prev) => prev.filter((_, index) => index !== indexToRemove));
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
        label: "Room Capacity Efficiency", 
        desc: "Prioritize fitting large groups into optimal sized rooms." 
    },
    "PreferMorningForHardCourses": { 
        label: "Morning Peak Performance", 
        desc: "Schedule challenging courses during high-concentration hours." 
    },
    "LecturerCompactSchedule": { 
        label: "Compact Staff Schedule", 
        desc: "Minimize idle gaps (holes) between lessons for lecturers." 
    },
    "CourseComponentsOverlap": { 
        label: "Prevent Component Overlap", 
        desc: "Avoid scheduling lectures and tutorials on the same day." 
    },
    "MandatoryMorningPreferred": { 
        label: "Core Courses in the Morning", 
        desc: "Give priority to mandatory core subjects in early slots." 
    },
    "ElectiveEveningPreferred": { 
        label: "Later Slots for Electives", 
        desc: "Move enrichment and elective courses to the afternoon/evening." 
    },
    "InconvenientTiming": { 
        label: "Avoid Weekends & Late Nights", 
        desc: "Minimize classes on Fridays or very late evening hours." 
    },
    "ElectiveCourseInTheSameClassroom": { 
        label: "Elective Room Grouping", 
        desc: "Keep related elective tracks within the same physical classroom." 
    },
    "AvoidBuildingP": {
          label: "Avoid Building P",
          desc: "Assign a penalty for scheduling classes in building P."
      },
    "LecturerPreference": {
          label: "Lecturer Preferences",
          desc: "Respect lecturers' soft requests to avoid teaching on specific days/hours."
      }
  };

  const handleWeightChange = (constraintName, value) => {
    setWeights((prev) => ({ ...prev, [constraintName]: parseFloat(value) }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const requestData = { semester, softConstraintWeights: weights, manualAssignments: manualAssignments, hardCourseIds: hardCourses.map(c => c.courseId),requiredCapacities: requiredCapacities };
      
      const generatedSchedule = await generateTimetable(requestData);

      setSchedule(generatedSchedule);
      navigate("/timetable");
    } catch (err) {
      setError(err.message);
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
        <p>Fine-tune the scheduling algorithm's behavior using the sliders below.</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="material-icons">error_outline</span>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Step 1 */}
      <div className="generate-card">
        <h3>
          <span className="material-icons">calendar_month</span>
          1. Target Semester
        </h3>
        <div className="form-group">
          <label>Select the semester you wish to schedule:</label>
          <select 
            className="semester-select"
            value={semester} 
            onChange={(e) => {setSemester(e.target.value); setManualAssignments([]);}}
          >
            <option value="A">Semester A</option>
            <option value="B">Semester B</option>
          </select>
        </div>
      </div>

      <div className="generate-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3>
            <span className="material-icons">push_pin</span>
            Manual Assignments (Pre-scheduling)
          </h3>
          <Button variant="secondary" onClick={() => setIsManualModalOpen(true)}>
            + Add Manual Assignment
          </Button>
        </div>
        <p className="hint-text">
          Have specific lessons that MUST be scheduled at an exact time and room? Add them here. 
          The algorithm will lock them in place and build the rest of the schedule around them.
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
          <h3><span className="material-icons">priority_high</span> Hard Courses (Morning Priority)</h3>
          <Button variant="secondary" onClick={() => setIsHardModalOpen(true)}>+ Add Hard Course</Button>
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


      {/* 🔥 Step 3: Lesson Capacity Requirements */}
      <div className="generate-card">
        <h3>
          <span className="material-icons">groups</span>
          2. Lesson Capacity Requirements
        </h3>
        <p className="hint-text">
          Define the minimum number of students each lesson type must accommodate. 
          The algorithm will use these numbers to find classrooms with sufficient size.
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
        </div>
      </div>

      {/* Step 2 */}
      <div className="generate-card">
        <h3>
          <span className="material-icons">settings_input_component</span>
          3. Algorithm Optimization Weights
        </h3>
        <p className="hint-text">
          Adjust the priority (0 = Low, 10 = High) for each scheduling rule.
        </p>
        
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
          onClick={handleGenerate} 
          disabled={loading} 
          variant="primary"
          className="generate-big-button"
        >
           {/* הורדנו את הטעינה מפה, הכפתור תמיד יראה אותו דבר, פשוט יהיה לחוץ/חסום */}
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
          <h2 style={{ color: "white", marginTop: "20px", fontWeight: "600", fontSize: "24px" }}>
             AI Algorithm is Processing...
          </h2>
          <p style={{ color: "#e2e8f0", marginTop: "8px", fontSize: "16px" }}>
             Analyzing thousands of possibilities to build the perfect schedule.<br/>
             This may take up to 1-2 minutes. Please don't close the window.
          </p>
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
      />



    </div>
  );
}