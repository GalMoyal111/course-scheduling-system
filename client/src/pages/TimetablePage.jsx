import React, { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import { useData } from "../context/DataContext";
import "./TimetablePage.css";
import Modal from "../components/ui/Modal"; 
import { saveTimetable } from "../services/api";

export default function TimetablePage() {
  const { schedule, clusters, invalidateHistoryCache, clusterMappings } = useData();
  const [selectedCluster, setSelectedCluster] = useState("ALL");


  const clusterMapping = clusterMappings.numToName;

  // Determine the range of semester numbers (typically 1-8)
  const semesterRange = useMemo(() => {
    const nums = new Set([1, 2, 3, 4, 5, 6, 7, 8]); // Default range
    clusters.forEach(c => {
      if (c.number && c.number < 9) {
        nums.add(c.number);
      }
    });
    return Array.from(nums).sort((a, b) => a - b);
  }, [clusters]);

  // Determine the max named cluster number
  const maxNamedClusterNum = useMemo(() => {
    let max = 8; // Default: semester range is 1-8
    clusters.forEach(c => {
      if (c.number && c.number > max) {
        max = c.number;
      }
    });
    return max;
  }, [clusters]);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveSemester, setSaveSemester] = useState("A");
  const [isSaving, setIsSaving] = useState(false);


  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const hebrewDays = [
    { name: "ראשון", index: 1 }, { name: "שני", index: 2 }, { name: "שלישי", index: 3 },
    { name: "רביעי", index: 4 }, { name: "חמישי", index: 5 }, { name: "שישי", index: 6 },
  ];

  const times = [
    { range: "08:30-09:20", frame: 1, isBreak: false },
    { range: "09:30-10:20", frame: 2, isBreak: false },
    { range: "10:30-11:20", frame: 3, isBreak: false },
    { range: "11:30-12:20", frame: 4, isBreak: false },
    { range: "12:20-12:50", frame: null, isBreak: true }, 
    { range: "12:50-13:40", frame: 5, isBreak: false },
    { range: "13:50-14:40", frame: 6, isBreak: false },
    { range: "14:50-15:40", frame: 7, isBreak: false },
    { range: "15:50-16:40", frame: 8, isBreak: false },
    { range: "16:50-17:40", frame: 9, isBreak: false },
    { range: "17:50-18:40", frame: 10, isBreak: false },
    { range: "18:50-19:40", frame: 11, isBreak: false },
    { range: "19:50-20:40", frame: 12, isBreak: false },
  ];

  const clusterOptions = useMemo(() => {
    if (!Array.isArray(schedule) || schedule.length === 0) {
      return [{ value: "ALL", label: "All clusters" }];
    }

    // Filter for regular semester clusters (those in semesterRange)
    const regularClusters = Array.from(
      new Set(
        schedule
          .map((lesson) => Number(lesson.cluster))
          .filter((cluster) => Number.isInteger(cluster) && semesterRange.includes(cluster))
      )
    ).sort((a, b) => a - b);

    const options = [{ value: "ALL", label: "All clusters" }];

    regularClusters.forEach((cluster) => {
      const label = clusterMapping[cluster] || `סמסטר ${cluster}`;
      options.push({ value: String(cluster), label });
    });

    // Check if there are any named clusters (clusters > maxNamedClusterNum or in DataContext)
    if (schedule.some((lesson) => Number(lesson.cluster) > maxNamedClusterNum)) {
      options.push({ value: "ELECTIVES", label: "Elective courses" });
    }

    return options;
  }, [schedule, semesterRange, maxNamedClusterNum, clusterMapping]);

  // פונקציית תרגום לסוג השיעור
  const translateType = (type) => {
    const types = {
      "LECTURE": "הרצאה",
      "TUTORIAL": "תרגול",
      "LAB": "מעבדה",
      "PHYSICS_LAB": "מעבדת פיזיקה",
      "NETWORKING_LAB": "מעבדת תקשורת",
      "PBL": "PBL"
    };
    return types[type] || type;
  };

  const visibleSchedule = useMemo(() => {
    if (!Array.isArray(schedule)) {
      return [];
    }

    if (selectedCluster === "ALL") {
      return schedule;
    }

    if (selectedCluster === "ELECTIVES") {
      return schedule.filter((lesson) => Number(lesson.cluster) > maxNamedClusterNum);
    }

    const clusterNumber = Number(selectedCluster);
    return schedule.filter((lesson) => Number(lesson.cluster) === clusterNumber);
  }, [schedule, selectedCluster, maxNamedClusterNum]);

  const getVisibleLessonsForSlot = (day, frame) => {
    if (!frame) return [];

    return visibleSchedule.filter((lesson) => {
      const start = lesson.startFrame;
      const end = start + (lesson.duration || 1) - 1;
      return lesson.day === day && frame >= start && frame <= end;
    });
  };

  const handleSaveClick = () => {
    setIsSaveModalOpen(true);
  };


  const handleConfirmSave = async () => {
    if (!saveName.trim()) {
      alert("Please enter a name for the timetable.");
      return;
    }

    setIsSaving(true);
    try {
      const requestData = {
        name: saveName.trim(),
        semester: saveSemester,
        schedule: schedule
      };

      await saveTimetable(requestData);
      
      invalidateHistoryCache();
      
      setIsSaveModalOpen(false);
      setSaveName("");
      alert("Timetable saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save timetable. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="timetable-page">
      <div className="timetable-header">
        <h1>Created time schedule</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={handleSaveClick}
            title="Save system in history"
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(79, 70, 229, 0.2)",
              backgroundColor: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease",
              color: "var(--text)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(79, 70, 229, 0.08)";
              e.currentTarget.style.borderColor = "rgba(79, 70, 229, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "rgba(79, 70, 229, 0.2)";
            }}
          >
            <span className="material-icons" style={{ fontSize: "1.3rem" }}>save</span>
          </button>
          <Button onClick={() => window.print()} variant="secondary">
            <span className="material-icons" style={{ marginRight: 8 }}>print</span>
            Printing system
          </Button>
        </div>
      </div>

      <div className="timetable-filter-bar">
        <label className="timetable-filter-label" htmlFor="cluster-filter">
          Cluster
        </label>
        <select
          id="cluster-filter"
          className="timetable-semester-select"
          value={selectedCluster}
          onChange={(e) => setSelectedCluster(e.target.value)}
        >
          {clusterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="timetable-container">
        {visibleSchedule.length === 0 ? (
          <div className="empty-state">
             <span className="material-icons">calendar_today</span>
             <p>No timetable found for the selected cluster.</p>
          </div>
        ) : (
          <table className="timetable-table">
            <thead>
              <tr>
                <th className="time-column">שעה</th>
                {hebrewDays.map((day) => (
                  <th key={day.index}>{day.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {times.map((timeItem, idx) => (
                <tr key={idx} className={timeItem.isBreak ? "break-row-style" : ""}>
                  <td className="time-cell-label">{timeItem.range}</td>
                  {hebrewDays.map((day) => {
                    const lessons = getVisibleLessonsForSlot(day.index, timeItem.frame);
                    return (
                      <td key={`${day.index}-${idx}`} className="slot-cell">
                        {timeItem.isBreak ? (
                          <div className="break-text">הפסקה</div>
                        ) : (
                          lessons.map((l, i) => (
                            <div key={i} className="lesson-card">
                              <div className="lesson-header">
                                <span className="lesson-course" title={l.courseName}>
                                  {l.courseName || l.courseId}
                                </span>
                                <span className="lesson-type">{translateType(l.type)}</span>
                              </div>
                              <div className="lesson-lecturer">
                                <span style={{ fontWeight: 'bold', marginLeft: '4px' }}>{l.courseId}</span> 
                                • {l.lecturer}
                              </div>
                              {l.room && (
                                <div className="lesson-room">
                                  <span className="material-icons">location_on</span>
                                  {l.room.classroomName} {/* <--- כאן שינינו ל-classroomName */}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Save Timetable"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsSaveModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirmSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </>
        }
      >
        <div className="form-field">
          <label>Timetable Name</label>
          <input
            type="text"
            className="ui-input"
            placeholder="e.g., Option 1 - No Fridays"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
          />
        </div>
        <div className="form-field" style={{ marginTop: '15px' }}>
          <label>Semester</label>
          <select 
            className="ui-select" 
            value={saveSemester} 
            onChange={(e) => setSaveSemester(e.target.value)}
          >
            <option value="A">Semester A</option>
            <option value="B">Semester B</option>
            <option value="SUMMER">Summer Semester</option>
          </select>
        </div>
      </Modal>


    </div>
  );
}