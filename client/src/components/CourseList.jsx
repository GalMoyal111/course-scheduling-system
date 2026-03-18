import React, { useState } from "react";
import "./ui/ui.css";

export default function CourseList({ courses = [], onEdit, onDelete, onSelectionChange, title = "Courses" }) {
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

  return (
    <div className="ui-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontWeight: 700 }}>{title} ({courses.length})</div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <SelectableTable
          courses={courses}
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

  const keyFor = (course) => `${course.courseId || ""}||${course.semesterNumber || ""}`;

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
          <th>Cluster</th>
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
              <td>{course.semesterNumber || ""}</td>
              <td>{course.courseId || ""}</td>
              <td>{course.courseName || ""}</td>
              <td>{course.lectureHours ?? ""}</td>
              <td>{course.tutorialHours ?? ""}</td>
              <td>{course.labHours ?? ""}</td>
              <td>{course.projectHours ?? ""}</td>
              <td>{course.credits ?? ""}</td>
              <td>{course.clusterName || ""}</td>
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
