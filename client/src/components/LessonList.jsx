import React, { useEffect, useState, useMemo } from "react";
import "./ui/ui.css";
import { typeBadge } from "./ui/typeUtils";

// Map type codes to display labels (matching typeBadge logic)
function getTypeLabel(type) {
  const typeMap = {
    "PHYSICS_LAB": "Physics Lab",
    "NETWORKING_LAB": "Networking Lab",
    "LAB": "Laboratory",
    "LECTURE": "Lecture",
    "TUTORIAL": "Practice",
    "NORMAL": "Normal",
    "PBL": "PBL",
    "PROJECT": "Project",
    "AUDITORIUM": "Auditorium",
  };
  return typeMap[type] || type;
}


export default function LessonList({ lessons = [], onEdit, onDelete, onSelectionChange, title = "Lessons" }) {
  const [selectedCourseName, setSelectedCourseName] = useState("");
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [selectedCluster, setSelectedCluster] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedCredits, setSelectedCredits] = useState("");

  // Extract unique values for each filter
  const uniqueCourseNames = useMemo(() => {
    const names = Array.from(new Set(lessons.map(l => l.courseName).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, 'he'));
    return names;
  }, [lessons]);

  const uniqueLecturers = useMemo(() => {
    const lecturers = Array.from(new Set(lessons.map(l => l.lecturer).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, 'he'));
    return lecturers;
  }, [lessons]);

  const uniqueClusters = useMemo(() => {
    const clusters = Array.from(new Set(lessons.map(l => String(l.cluster)).filter(Boolean)))
      .sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b, 'he');
      });
    return clusters;
  }, [lessons]);

  const uniqueTypes = useMemo(() => {
    const types = Array.from(new Set(lessons.map(l => l.type).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, 'he'));
    return types;
  }, [lessons]);

  const uniqueSemesters = useMemo(() => {
    const semesters = Array.from(new Set(lessons.map(l => l.semester).filter(s => s != null)))
      .sort((a, b) => {
        // Define semester order: A, B, SUMMER
        const semesterOrder = { "A": 1, "B": 2, "SUMMER": 3 };
        return (semesterOrder[a] || 99) - (semesterOrder[b] || 99);
      });
    return semesters;
  }, [lessons]);

  const uniqueCreditsValues = useMemo(() => {
    const credits = Array.from(new Set(lessons.map(l => l.credits).filter(c => c != null)))
      .sort((a, b) => a - b);
    return credits;
  }, [lessons]);

  // Filter lessons based on selected filters
  const filteredLessons = useMemo(() => {
    return lessons.filter(l => {
      if (selectedCourseName && l.courseName !== selectedCourseName) return false;
      if (selectedLecturer && l.lecturer !== selectedLecturer) return false;
      if (selectedCluster && parseInt(l.cluster) !== parseInt(selectedCluster)) return false;
      if (selectedType && l.type !== selectedType) return false;
      if (selectedSemester && l.semester !== selectedSemester) return false;
      if (selectedCredits && l.credits !== parseInt(selectedCredits)) return false;
      return true;
    });
  }, [lessons, selectedCourseName, selectedLecturer, selectedCluster, selectedType, selectedSemester, selectedCredits]);

  if (!lessons || lessons.length === 0) {
    return (
      <div className="ui-card">
        <div className="empty-illustration">
          <svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect x="8" y="20" width="104" height="56" rx="6" fill="#eef2ff" />
            <rect x="18" y="30" width="40" height="8" rx="2" fill="#c7d2fe" />
            <rect x="18" y="44" width="74" height="6" rx="2" fill="#e0e7ff" />
            <rect x="18" y="54" width="30" height="6" rx="2" fill="#e0e7ff" />
          </svg>
          <div style={{ marginTop: 12, fontWeight: 700 }}>No lessons yet</div>
          <div style={{ color: "var(--muted)", marginTop: 6 }}>Upload an Excel file or add a lesson manually.</div>
        </div>
      </div>
    );
  }

  const hasActiveFilters = selectedCourseName || selectedLecturer || selectedCluster || selectedType || selectedSemester || selectedCredits;
  const displayCount = hasActiveFilters ? filteredLessons.length : lessons.length;

  const clearAllFilters = () => {
    setSelectedCourseName("");
    setSelectedLecturer("");
    setSelectedCluster("");
    setSelectedType("");
    setSelectedSemester("");
    setSelectedCredits("");
  };

  return (
    <div className="ui-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ 
          fontWeight: 700, 
          fontSize: "1.05rem",
          background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          display: "inline-block"
        }}>
          {title} 
          <span style={{ 
            color: "var(--text)", 
            WebkitTextFillColor: "var(--text)",
            marginLeft: "8px",
            fontSize: "0.95rem",
            fontWeight: 600,
            opacity: hasActiveFilters ? 1 : 0.7
          }}>
            ({displayCount}{hasActiveFilters ? `/${lessons.length}` : ""})
          </span>
        </div>
      </div>

      {/* Filter Controls */}
      <div style={{ 
        display: "flex", 
        gap: 16, 
        marginBottom: 16, 
        flexWrap: "wrap",
        alignItems: "center",
        padding: "16px 16px",
        backgroundColor: "rgba(79, 70, 229, 0.02)",
        borderRadius: "8px",
        border: "1px solid rgba(79, 70, 229, 0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Filters:</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="material-icons" style={{ fontSize: "1.1rem", color: "var(--muted)" }}>book</span>
          <select
            value={selectedCourseName}
            onChange={(e) => setSelectedCourseName(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(15, 23, 36, 0.12)",
              backgroundColor: selectedCourseName ? "rgba(79, 70, 229, 0.08)" : "white",
              color: "var(--text)",
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontWeight: selectedCourseName ? 600 : 500,
              minWidth: "140px"
            }}
          >
            <option value="">All Courses</option>
            {uniqueCourseNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="material-icons" style={{ fontSize: "1.1rem", color: "var(--muted)" }}>person</span>
          <select
            value={selectedLecturer}
            onChange={(e) => setSelectedLecturer(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(15, 23, 36, 0.12)",
              backgroundColor: selectedLecturer ? "rgba(79, 70, 229, 0.08)" : "white",
              color: "var(--text)",
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontWeight: selectedLecturer ? 600 : 500,
              minWidth: "130px"
            }}
          >
            <option value="">All Lecturers</option>
            {uniqueLecturers.map(lecturer => (
              <option key={lecturer} value={lecturer}>{lecturer}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="material-icons" style={{ fontSize: "1.1rem", color: "var(--muted)" }}>layers</span>
          <select
            value={selectedCluster}
            onChange={(e) => setSelectedCluster(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(15, 23, 36, 0.12)",
              backgroundColor: selectedCluster ? "rgba(79, 70, 229, 0.08)" : "white",
              color: "var(--text)",
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontWeight: selectedCluster ? 600 : 500,
              minWidth: "110px"
            }}
          >
            <option value="">All Clusters</option>
            {uniqueClusters.map(cluster => (
              <option key={cluster} value={cluster}>{cluster}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="material-icons" style={{ fontSize: "1.1rem", color: "var(--muted)" }}>label</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(15, 23, 36, 0.12)",
              backgroundColor: selectedType ? "rgba(79, 70, 229, 0.08)" : "white",
              color: "var(--text)",
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontWeight: selectedType ? 600 : 500,
              minWidth: "130px"
            }}
          >
            <option value="">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{getTypeLabel(type)}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="material-icons" style={{ fontSize: "1.1rem", color: "var(--muted)" }}>event</span>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(15, 23, 36, 0.12)",
              backgroundColor: selectedSemester ? "rgba(79, 70, 229, 0.08)" : "white",
              color: "var(--text)",
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontWeight: selectedSemester ? 600 : 500,
              minWidth: "110px"
            }}
          >
            <option value="">All Semesters</option>
            {uniqueSemesters.map(semester => {
              const semesterLabels = { "A": "Semester A", "B": "Semester B", "SUMMER": "Summer" };
              return (
                <option key={semester} value={semester}>{semesterLabels[semester] || semester}</option>
              );
            })}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="material-icons" style={{ fontSize: "1.1rem", color: "var(--muted)" }}>star</span>
          <select
            value={selectedCredits}
            onChange={(e) => setSelectedCredits(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(15, 23, 36, 0.12)",
              backgroundColor: selectedCredits ? "rgba(79, 70, 229, 0.08)" : "white",
              color: "var(--text)",
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontWeight: selectedCredits ? 600 : 500,
              minWidth: "100px"
            }}
          >
            <option value="">All Credits</option>
            {uniqueCreditsValues.map(credit => (
              <option key={credit} value={credit}>{credit} Credits</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              backgroundColor: "rgba(239, 68, 68, 0.06)",
              color: "#dc2626",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 600,
              marginLeft: "auto",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgba(239, 68, 68, 0.12)";
              e.target.style.borderColor = "rgba(239, 68, 68, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "rgba(239, 68, 68, 0.06)";
              e.target.style.borderColor = "rgba(239, 68, 68, 0.2)";
            }}
          >
            <span className="material-icons" style={{ fontSize: "1rem", lineHeight: "1" }}>close</span>
            Clear Filters
          </button>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <SelectableTable
          lessons={filteredLessons}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelectionChange={onSelectionChange}
        />
      </div>
    </div>
  );
}

function SelectableTable({ lessons, onEdit, onDelete, onSelectionChange }) {
  const [selectedMap, setSelectedMap] = useState({});

  const keyFor = (l) => l.lessonId;

  const stableKey = lessons.map(keyFor).join("|");

  useEffect(() => {
    setSelectedMap({});
    onSelectionChange && onSelectionChange([]);
  }, [stableKey]);

  const toggleRow = (l) => {
    const k = keyFor(l);
    const next = { ...selectedMap };
    if (next[k]) delete next[k];
    else next[k] = l;
    setSelectedMap(next);
    onSelectionChange && onSelectionChange(Object.values(next));
  };

  const allSelected = lessons.length > 0 && lessons.every((c) => selectedMap[keyFor(c)]);

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedMap({});
      onSelectionChange && onSelectionChange([]);
    } else {
      const map = {};
      lessons.forEach((l) => (map[keyFor(l)] = l));
      setSelectedMap(map);
      onSelectionChange && onSelectionChange(Object.values(map));
    }
  };

  return (
    <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ width: 40 }}>
            <input
              type="checkbox"
              aria-label="Select all lessons"
              checked={allSelected}
              onChange={toggleSelectAll}
            />
          </th>
          <th>Course ID</th>
          <th>Course Name</th>
          <th>Lecturer</th>
          <th>Cluster</th>
          <th>Type</th>
          <th>Duration</th>
          <th>Semester</th>
          <th>Credits</th>
          <th style={{ width: 88 }}></th>
        </tr>
      </thead>
      <tbody>
        {lessons.map((l) => {
          const k = keyFor(l);
          const checked = !!selectedMap[k];
          return (
            <tr key={k} onClick={() => toggleRow(l)}>
              <td>
                <input
                  type="checkbox"
                  aria-label={`Select ${l.courseId} ${l.courseName}`}
                  checked={checked}
                  onChange={() => toggleRow(l)}
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              <td>{l.courseId}</td>
              <td>{l.courseName}</td>
              <td>{l.lecturer}</td>
              <td>{l.cluster}</td>
              <td>{typeBadge(l.type)}</td>
              <td>{l.duration}</td>
              <td>{l.semester ? String(l.semester) : ""}</td>
              <td>{l.credits}</td>
              <td>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="icon-btn icon-btn--edit"
                    title="Edit"
                    onClick={(e) => { e.stopPropagation(); onEdit && onEdit(l); }}
                  >
                    <span className="material-icons">edit</span>
                  </button>

                  <button
                    type="button"
                    className="icon-btn icon-btn--delete"
                    title="Delete"
                    onClick={(e) => { e.stopPropagation(); onDelete && onDelete(l); }}
                  >
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
