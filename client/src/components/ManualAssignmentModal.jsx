import React, { useState, useEffect, useMemo } from "react";
import { useData } from "../context/DataContext";
import Button from "./ui/Button";
import "./ui/ui.css"; // שימוש ב-CSS האחיד של המערכת
import Modal from "./ui/Modal"; // שימוש בקומפוננטת המודאל האחידה

const CLUSTER_NUMBER_TO_NAME = {
  1: "סמסטר 1",
  2: "סמסטר 2",
  3: "סמסטר 3",
  4: "סמסטר 4",
  5: "סמסטר 5",
  6: "סמסטר 6",
  7: "סמסטר 7",
  8: "סמסטר 8",
  9: "מדעים",
  10: "עיבוד אותות ורשתות תקשורת",
  11: "אלגוריתמים",
  12: "סמינרים",
  13: "הנדסת תוכנה",
  14: "מעבדות",
};

const DAY_NAMES = {
  1: "ראשון",
  2: "שני",
  3: "שלישי",
  4: "רביעי",
  5: "חמישי",
  6: "שישי"
};

// פונקציית עזר להמרת Frame לשעת התחלה
const getStartTimeByFrame = (frame) => {
    // נניח ש-frame 1 מתחיל ב-08:30, וכל מסגרת היא שעה (פחות 10 דקות הפסקה, אז 09:20 סיום)
    const startHour = 7 + parseInt(frame, 10); 
    const isHalfPast = startHour === 12 ? "20" : "30"; // התאמה לשעות אוניברסיטה אופייניות - אפשר לשנות לפי הלוגיקה המדויקת שלך
    // בשביל פשטות, נשתמש בחישוב כללי:
    const hour = Math.floor(8.5 + (frame - 1));
    const mins = frame % 2 === 0 ? "30" : "30"; // או לוגיקה מורכבת יותר
    
    // פתרון פשוט וקבוע: (מתאים לאריאל למשל)
    const times = {
        1: "08:30", 2: "09:30", 3: "10:30", 4: "11:30", 5: "12:50", 
        6: "13:50", 7: "14:50", 8: "15:50", 9: "16:50", 10: "17:50", 
        11: "18:50", 12: "19:50"
    };
    return times[frame] || "Unknown";
}

export default function ManualAssignmentModal({ isOpen, onClose, onSave, currentSemester }) {
  const { lessons, classrooms, lecturers } = useData();

  const [selectedCluster, setSelectedCluster] = useState("");
  const [selectedCourseName, setSelectedCourseName] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");

  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedClassroomName, setSelectedClassroomName] = useState("");

  const [selectedDay, setSelectedDay] = useState("");
  const [selectedFrame, setSelectedFrame] = useState("");
  
  const [error, setError] = useState("");


  useEffect(() => {
    if (isOpen) {
      setSelectedCluster("");
      setSelectedCourseName("");
      setSelectedLessonId("");
      setSelectedBuilding("");
      setSelectedClassroomName("");
      setSelectedDay("");
      setSelectedFrame("");
      setError("");
    }
  }, [isOpen]);

  const semesterLessons = useMemo(() => {
      if (!lessons || !currentSemester) return [];
      return lessons.filter(l => l.semester === currentSemester);
  }, [lessons, currentSemester]);


  const availableClusters = useMemo(() => {
    const clusters = new Set();
    semesterLessons.forEach(l => { // שינוי כאן
      if (l.cluster) clusters.add(l.cluster);
    });
    return Array.from(clusters).sort((a, b) => a - b);
  }, [semesterLessons]); // שינוי כאן

  const filteredCourseNames = useMemo(() => {
    if (!selectedCluster) return [];
    const courseNames = new Set();
    semesterLessons // שינוי כאן
      .filter(l => l.cluster.toString() === selectedCluster.toString())
      .forEach(l => courseNames.add(l.courseName));
    return Array.from(courseNames).sort();
  }, [semesterLessons, selectedCluster]); // שינוי כאן

  const filteredLessons = useMemo(() => {
    if (!selectedCluster || !selectedCourseName) return [];
    return semesterLessons.filter(l => // שינוי כאן
      l.cluster.toString() === selectedCluster.toString() && 
      l.courseName === selectedCourseName
    );
  }, [semesterLessons, selectedCluster, selectedCourseName]);

  const availableBuildings = useMemo(() => {
    const buildings = new Set();
    classrooms.forEach(c => {
      if (c.building) buildings.add(c.building);
    });
    return Array.from(buildings).sort();
  }, [classrooms]);

  const filteredClassrooms = useMemo(() => {
    if (!selectedBuilding) return [];
    return classrooms.filter(c => c.building === selectedBuilding).sort((a,b) => a.classroomName.localeCompare(b.classroomName));
  }, [classrooms, selectedBuilding]);

  // מציאת משך השיעור שנבחר כדי לחשב שעת סיום להצגה
  const selectedLessonDuration = useMemo(() => {
      if (!selectedLessonId) return 0;
      const lesson = lessons.find(l => l.lessonId === selectedLessonId);
      return lesson ? lesson.duration : 0;
  }, [selectedLessonId, lessons]);

  const handleSave = (e) => {
    if(e) e.preventDefault();
    setError("");

    if (!selectedLessonId || !selectedDay || !selectedFrame || !selectedClassroomName || !selectedBuilding) {
      setError("Please fill in all fields completely.");
      return;
    }

    const lesson = semesterLessons.find((l) => l.lessonId === selectedLessonId);   
    if (!lesson) return;

    const duration = lesson.duration;
    const startFrame = parseInt(selectedFrame, 10);
    const day = parseInt(selectedDay, 10);

    const maxFrame = day === 6 ? 4 : 12;
    if (startFrame + duration - 1 > maxFrame) {
      setError(`The lesson is ${duration} hours long and exceeds the day's limit.`);
      return;
    }

    const lecturer = lecturers.find((l) => l.name === lesson.lecturer);
    if (lecturer && lecturer.unavailableSlots) {
      for (let t = 0; t < duration; t++) {
        const currentFrame = startFrame + t;
        const isUnavailable = lecturer.unavailableSlots.some(
          (slot) => slot.day === day && slot.startFrame === currentFrame
        );

        if (isUnavailable) {
          setError(`Lecturer ${lecturer.name} is not available on day ${day} at time ${getStartTimeByFrame(currentFrame)}.`);
          return;
        }
      }
    }

    onSave({
      lessonId: lesson.lessonId,
      courseName: lesson.courseName,
      type: lesson.type,
      lecturer: lesson.lecturer,
      day: day,
      startFrame: startFrame,
      duration: duration, // שימושי לתצוגה
      building: selectedBuilding, 
      classroomName: selectedClassroomName
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title="Add Manual Assignment" 
        size="wide"
        footer={
            <>
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={handleSave}>Add Assignment</Button>
            </>
        }
    >
        <form onSubmit={handleSave}>
            {error && <div style={{ color: "red", fontSize: "14px", background: "#fee2e2", padding: "10px", borderRadius: "8px", marginBottom: "15px" }}>{error}</div>}

            <h4 style={{ margin: "0 0 15px 0", color: "#334155", fontSize: "15px", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>1. Select Lesson</h4>
            <div className="add-course-grid" style={{ marginBottom: "25px" }}>
                
                <div className="form-field">
                    <label>Cluster</label>
                    <select 
                        className="ui-select"
                        value={selectedCluster} 
                        onChange={(e) => {
                            setSelectedCluster(e.target.value);
                            setSelectedCourseName("");
                            setSelectedLessonId("");
                        }}
                    >
                        <option value="">-- Select Cluster --</option>
                        {availableClusters.map((cluster) => (
                            <option key={cluster} value={cluster}>
                                {CLUSTER_NUMBER_TO_NAME[cluster] || `Cluster ${cluster}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-field" style={{ opacity: selectedCluster ? 1 : 0.5 }}>
                    <label>Course</label>
                    <select 
                        className="ui-select"
                        value={selectedCourseName} 
                        onChange={(e) => {
                            setSelectedCourseName(e.target.value);
                            setSelectedLessonId("");
                        }}
                        disabled={!selectedCluster}
                    >
                        <option value="">-- Select Course --</option>
                        {filteredCourseNames.map((name) => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-field" style={{ opacity: selectedCourseName ? 1 : 0.5, gridColumn: "1 / -1" }}>
                    <label>Specific Lesson (Type & Lecturer)</label>
                    <select 
                        className="ui-select"
                        value={selectedLessonId} 
                        onChange={(e) => setSelectedLessonId(e.target.value)}
                        disabled={!selectedCourseName}
                    >
                        <option value="">-- Select Specific Lesson --</option>
                        {filteredLessons.map((l) => (
                            <option key={l.lessonId} value={l.lessonId}>
                                {l.type} - {l.lecturer} [{l.duration} hrs]
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <h4 style={{ margin: "0 0 15px 0", color: "#334155", fontSize: "15px", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>2. Select Room & Time</h4>
            <div className="add-course-grid">
                <div className="form-field">
                    <label>Building</label>
                    <select 
                        className="ui-select"
                        value={selectedBuilding} 
                        onChange={(e) => {
                            setSelectedBuilding(e.target.value);
                            setSelectedClassroomName("");
                        }}
                    >
                        <option value="">-- Building --</option>
                        {availableBuildings.map((b) => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                </div>

                <div className="form-field" style={{ opacity: selectedBuilding ? 1 : 0.5 }}>
                    <label>Room</label>
                    <select 
                        className="ui-select"
                        value={selectedClassroomName} 
                        onChange={(e) => setSelectedClassroomName(e.target.value)}
                        disabled={!selectedBuilding}
                    >
                        <option value="">-- Room --</option>
                        {filteredClassrooms.map((c) => (
                            <option key={c.classroomName} value={c.classroomName}>
                                {c.classroomName} (Cap: {c.capacity})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-field">
                    <label>Day</label>
                    <select 
                        className="ui-select"
                        value={selectedDay} 
                        onChange={(e) => setSelectedDay(e.target.value)}
                    >
                        <option value="">-- Day --</option>
                        {[1, 2, 3, 4, 5, 6].map((d) => (
                            <option key={d} value={d}>{DAY_NAMES[d]} (Day {d})</option>
                        ))}
                    </select>
                </div>

                <div className="form-field" style={{ position: "relative" }}>
                    <label>Start Time</label>
                    <select 
                        className="ui-select"
                        value={selectedFrame} 
                        onChange={(e) => setSelectedFrame(e.target.value)}
                    >
                        <option value="">-- Time --</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((f) => (
                            <option key={f} value={f}>
                                {getStartTimeByFrame(f)} (Frame {f})
                            </option>
                        ))}
                    </select>
                    {/* תצוגת משך השיעור לנוחות המשתמש */}
                    {selectedFrame && selectedLessonDuration > 0 && (
                         <div style={{ position: "absolute", bottom: "-20px", left: "5px", fontSize: "11px", color: "#64748b" }}>
                            Ends at {getStartTimeByFrame(parseInt(selectedFrame) + selectedLessonDuration)}
                         </div>
                    )}
                </div>
            </div>
        </form>
    </Modal>
  );
}