import React from "react";
import "./ui/ui.css";

function typeBadge(type) {
  if (!type) return <span className="type-badge type-normal">Normal</span>;
  const t = type.toLowerCase();
  if (t.includes("lab") && t.includes("network")) return <span className="type-badge type-network">Networking Lab</span>;
  if (t.includes("network")) return <span className="type-badge type-network">Networking Lab</span>;
  if (t.includes("physics")) return <span className="type-badge type-physics">Physics Lab</span>;
  if (t.includes("lab")) return <span className="type-badge type-lab">Laboratory</span>;
  return <span className="type-badge type-normal">Normal</span>;
}

export default function ClassroomList({ classrooms = [], onEdit, onDelete }) {
  if (!classrooms || classrooms.length === 0) {
    return (
      <div className="ui-card">
        <div className="empty-illustration">
          <svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect x="8" y="20" width="104" height="56" rx="6" fill="#eef2ff" />
            <rect x="18" y="30" width="40" height="8" rx="2" fill="#c7d2fe" />
            <rect x="18" y="44" width="74" height="6" rx="2" fill="#e0e7ff" />
            <rect x="18" y="54" width="30" height="6" rx="2" fill="#e0e7ff" />
          </svg>
          <div style={{ marginTop: 12, fontWeight: 700 }}>No classrooms yet</div>
          <div style={{ color: "var(--muted)", marginTop: 6 }}>Upload an Excel file or add a classroom manually.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ui-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontWeight: 700 }}>Classrooms ({classrooms.length})</div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Building</th>
              <th>Class name</th>
              <th>Capacity</th>
              <th>Type</th>
              <th style={{ width: 88 }}></th>
            </tr>
          </thead>
          <tbody>
            {classrooms.map((c, idx) => (
              <tr key={idx}>
                <td>{c.building}</td>
                <td>{c.classroomName}</td>
                <td>{c.capacity}</td>
                <td>{typeBadge(c.type)}</td>
                <td>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                        type="button"
                        className="icon-btn icon-btn--edit"
                        title="Edit"
                        onClick={() => onEdit && onEdit(c)}
                    >
                        <span className="material-icons">edit</span>
                    </button>

                    <button
                        type="button"
                        className="icon-btn icon-btn--delete"
                        title="Delete"
                        onClick={() => onDelete && onDelete(c)}
                    >
                        <span className="material-icons">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
