import React, { useState, useMemo } from "react";
import "./ui/ui.css";

export default function CourseList({ courses = [], onEdit, onDelete, onSelectionChange, title = "Courses" }) {
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedCredits, setSelectedCredits] = useState("");

  // Extract unique semesters (cluster names) from courses
  // This includes both named clusters (מדעים, etc.) and semester labels (סמסטר 1-8)
  const uniqueSemesters = useMemo(() => {
    const semesters = new Set();
    courses.forEach(c => {
      if (c.clusterName) {
        semesters.add(c.clusterName);
      }
    });
    
    // Convert to array and sort: semesters first (1-8), then named clusters (alphabetically)
    return Array.from(semesters).sort((a, b) => {
      // Extract semester numbers if present (e.g., "סמסטר 1" -> 1)
      const aSemesterMatch = a.match(/\d+/);
      const bSemesterMatch = b.match(/\d+/);
      const aSemesterNum = aSemesterMatch ? parseInt(aSemesterMatch[0]) : null;
      const bSemesterNum = bSemesterMatch ? parseInt(bSemesterMatch[0]) : null;
      
      // Semesters (with numbers) come first, sorted by number
      if (aSemesterNum !== null && bSemesterNum !== null) {
        return aSemesterNum - bSemesterNum;
      }
      
      // Semesters before named clusters
      if (aSemesterNum !== null) return -1;
      if (bSemesterNum !== null) return 1;
      
      // Named clusters sorted alphabetically (Hebrew)
      return a.localeCompare(b, 'he');
    });
  }, [courses]);

  const uniqueCredits = useMemo(() => {
    const credits = Array.from(new Set(courses.map(c => c.credits).filter(c => c != null)))
      .sort((a, b) => a - b);
    return credits;
  }, [courses]);

  // Filter courses based on selected filters
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      if (selectedSemester && c.clusterName !== selectedSemester) return false;
      if (selectedCredits && c.credits !== parseFloat(selectedCredits)) return false;
      return true;
    });
  }, [courses, selectedSemester, selectedCredits]);

  if (!courses || courses.length === 0) {
    return (
      <div className="ui-card">
        <div className="empty-illustration">
          <svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect x="8" y="20" width="104" height="56" rx="6" fill="#eef2ff" />
            <rect x="18" y="30" width="40" height="8" rx="2" fill="#c7d2fe" />
            <rect x="18" y="44" width="74" height="6" rx="2" fill="#e0e7ff" />
            <rect x="18" y="54" width="30" height="6" rx="2" fill="#e0e7ff" />
          </svg>
          <div style={{ marginTop: 12, fontWeight: 700 }}>No courses yet</div>
          <div style={{ color: "var(--muted)", marginTop: 6 }}>Upload an Excel file or add a course manually.</div>
        </div>
      </div>
    );
  }

  const hasActiveFilters = selectedSemester || selectedCredits;
  const displayCount = hasActiveFilters ? filteredCourses.length : courses.length;

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
            ({displayCount}{hasActiveFilters ? `/${courses.length}` : ""})
          </span>
        </div>
      </div>

      {/* Filter Controls */}
      <div style={{ 
        display: "flex", 
        gap: 20, 
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

        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
          <span className="material-icons" style={{ fontSize: "1.1rem", color: "var(--muted)" }}>school</span>
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
              minWidth: "140px"
            }}
          >
            <option value="">All Semesters</option>
            {uniqueSemesters.map(semester => (
              <option key={semester} value={semester}>{semester}</option>
            ))}
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
              minWidth: "120px"
            }}
          >
            <option value="">All Credits</option>
            {uniqueCredits.map(credit => (
              <option key={credit} value={credit}>{credit} Credits</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setSelectedSemester("");
              setSelectedCredits("");
            }}
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
          courses={filteredCourses}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelectionChange={onSelectionChange}
        />
      </div>
    </div>
  );
}

function SelectableTable({ courses, onEdit, onDelete, onSelectionChange }) {
  const [selectedMap, setSelectedMap] = useState({});

  const keyFor = (course) => `${course.courseId || ""}||${course.cluster || ""}`;

  const toggleRow = (course) => {
    const key = keyFor(course);
    const next = { ...selectedMap };
    if (next[key]) {
      delete next[key];
    } else {
      next[key] = course;
    }
    setSelectedMap(next);
    onSelectionChange && onSelectionChange(Object.values(next));
  };

  const allSelected = courses.length > 0 && courses.every((course) => selectedMap[keyFor(course)]);

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedMap({});
      onSelectionChange && onSelectionChange([]);
    } else {
      const map = {};
      courses.forEach((course) => {
        map[keyFor(course)] = course;
      });
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
              aria-label="Select all courses"
              checked={allSelected}
              onChange={toggleSelectAll}
            />
          </th>
          <th>Semester</th>
          <th>Course ID</th>
          <th>Course Name</th>
          <th>Lecture</th>
          <th>Tutorial</th>
          <th>Lab</th>
          <th>Project</th>
          <th>Credits</th>
          <th style={{ width: 88 }}></th>
        </tr>
      </thead>
      <tbody>
        {courses.map((course) => {
          const key = keyFor(course);
          const checked = !!selectedMap[key];
          return (
            <tr key={key} onClick={() => toggleRow(course)}>
              <td>
                <input
                  type="checkbox"
                  aria-label={`Select ${course.courseId || "course"}`}
                  checked={checked}
                  onChange={() => toggleRow(course)}
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              <td>{course.clusterName || course.cluster || ""}</td>
              <td>{course.courseId || ""}</td>
              <td>{course.courseName || ""}</td>
              <td>{course.lectureHours ?? ""}</td>
              <td>{course.tutorialHours ?? ""}</td>
              <td>{course.labHours ?? ""}</td>
              <td>{course.projectHours ?? ""}</td>
              <td>{course.credits ?? ""}</td>
              <td>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="icon-btn icon-btn--edit"
                    title="Edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit && onEdit(course);
                    }}
                  >
                    <span className="material-icons">edit</span>
                  </button>

                  <button
                    type="button"
                    className="icon-btn icon-btn--delete"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete && onDelete(course);
                    }}
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
