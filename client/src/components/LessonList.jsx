import React, { useEffect, useState } from "react";
import "./ui/ui.css";
import { typeBadge } from "./ui/typeUtils.jsx";

export default function LessonList({ lessons = [], onEdit, onDelete, onSelectionChange, title = "Lessons" }) {
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

  return (
    <div className="ui-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontWeight: 700 }}>{title} ({lessons.length})</div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <SelectableTable
          lessons={lessons}
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

  const keyFor = (l) => `${l.courseId}||${l.index}`;

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
