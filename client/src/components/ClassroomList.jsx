import React, { useEffect, useState } from "react";
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

export default function ClassroomList({ classrooms = [], onEdit, onDelete, onSelectionChange, title = "Classrooms" }) {
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
        <div style={{ fontWeight: 700 }}>{title} ({classrooms.length})</div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <SelectableTable
          classrooms={classrooms}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelectionChange={onSelectionChange}
        />
      </div>
    </div>
  );
}

function SelectableTable({ classrooms, onEdit, onDelete, onSelectionChange }) {
  const [selectedMap, setSelectedMap] = useState({});

  const keyFor = (c) => `${c.building}||${c.classroomName}`;

  // Create a stable key representing the set/order of classrooms so we don't
  // reset selection on every parent render (parent may pass a new array ref).
  const stableKey = classrooms.map(keyFor).join("|");

  useEffect(() => {
    // reset selection only when the actual list of classroom keys changes
    setSelectedMap({});
    onSelectionChange && onSelectionChange([]);
  }, [stableKey]);

  console.debug && console.debug("SelectableTable render", { count: classrooms.length, selected: Object.keys(selectedMap).length });
  const toggleRow = (c) => {
    const k = keyFor(c);
    const next = { ...selectedMap };
    if (next[k]) delete next[k];
    else next[k] = c;
    setSelectedMap(next);
    onSelectionChange && onSelectionChange(Object.values(next));
    console.debug && console.debug("toggleRow", { key: k, totalSelected: Object.keys(next).length });
  };

  const allSelected = classrooms.length > 0 && classrooms.every((c) => selectedMap[keyFor(c)]);

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedMap({});
      onSelectionChange && onSelectionChange([]);
      console.debug && console.debug("toggleSelectAll", { action: "clear" });
    } else {
      const map = {};
      classrooms.forEach((c) => (map[keyFor(c)] = c));
      setSelectedMap(map);
      onSelectionChange && onSelectionChange(Object.values(map));
      console.debug && console.debug("toggleSelectAll", { action: "selectAll", total: Object.keys(map).length });
    }
  };

  return (
    <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ width: 40 }}>
            <input
              type="checkbox"
              aria-label="Select all classrooms"
              checked={allSelected}
              onChange={toggleSelectAll}
            />
          </th>
          <th>Building</th>
          <th>Class name</th>
          <th>Capacity</th>
          <th>Type</th>
          <th style={{ width: 88 }}></th>
        </tr>
      </thead>
      <tbody>
        {classrooms.map((c) => {
          const k = keyFor(c);
          const checked = !!selectedMap[k];
          return (
            <tr key={k} onClick={() => toggleRow(c)}>
                <td>
                  <input
                    type="checkbox"
                    aria-label={`Select ${c.building} ${c.classroomName}`}
                    checked={checked}
                    onChange={() => toggleRow(c)}
                    onClick={(e) => e.stopPropagation()} /* prevent double toggle when clicking checkbox */
                  />
                </td>
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
                        onClick={(e) => { e.stopPropagation(); onEdit && onEdit(c); }}
                  >
                      <span className="material-icons">edit</span>
                  </button>

                  <button
                      type="button"
                      className="icon-btn icon-btn--delete"
                      title="Delete"
                        onClick={(e) => { e.stopPropagation(); onDelete && onDelete(c); }}
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
