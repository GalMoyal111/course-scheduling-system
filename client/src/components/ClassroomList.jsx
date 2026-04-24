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


export default function ClassroomList({ classrooms = [], onEdit, onDelete, onSelectionChange, title = "Classrooms" }) {
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // Extract unique buildings and types from classrooms
  const uniqueBuildings = useMemo(() => {
    const buildings = Array.from(new Set(classrooms.map(c => c.building).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, 'he'));
    return buildings;
  }, [classrooms]);

  const uniqueTypes = useMemo(() => {
    const types = classrooms
      .map(c => c.type)
      .filter((t, idx, arr) => t && arr.indexOf(t) === idx)
      .sort((a, b) => a.localeCompare(b, 'he'));
    return types;
  }, [classrooms]);

  // Filter classrooms based on selected filters
  const filteredClassrooms = useMemo(() => {
    return classrooms.filter(c => {
      if (selectedBuilding && c.building !== selectedBuilding) return false;
      if (selectedType && c.type !== selectedType) return false;
      return true;
    });
  }, [classrooms, selectedBuilding, selectedType]);

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

  const hasActiveFilters = selectedBuilding || selectedType;
  const displayCount = hasActiveFilters ? filteredClassrooms.length : classrooms.length;

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
            ({displayCount}{hasActiveFilters ? `/${classrooms.length}` : ""})
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
          <span className="material-icons" style={{ fontSize: "1.1rem", color: "var(--muted)" }}>apartment</span>
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(15, 23, 36, 0.12)",
              backgroundColor: selectedBuilding ? "rgba(79, 70, 229, 0.08)" : "white",
              color: "var(--text)",
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontWeight: selectedBuilding ? 600 : 500,
              minWidth: "140px"
            }}
          >
            <option value="">All Buildings</option>
            {uniqueBuildings.map(building => (
              <option key={building} value={building}>{building}</option>
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

        {hasActiveFilters && (
          <button
            onClick={() => {
              setSelectedBuilding("");
              setSelectedType("");
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
          classrooms={filteredClassrooms}
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
  // We'll keep the latest handler functions in refs and pass refs to memoized rows
  const onEditRef = React.useRef(onEdit);
  const onDeleteRef = React.useRef(onDelete);
  const onToggleRef = React.useRef();

  useEffect(() => { onEditRef.current = onEdit; onDeleteRef.current = onDelete; }, [onEdit, onDelete]);

  const toggleRow = (c) => {
    const k = keyFor(c);
    const next = { ...selectedMap };
    if (next[k]) delete next[k];
    else next[k] = c;
    setSelectedMap(next);
    onSelectionChange && onSelectionChange(Object.values(next));
    console.debug && console.debug("toggleRow", { key: k, totalSelected: Object.keys(next).length });
  };

  // keep pointer to latest toggle handler so memoized rows can call it without
  // requiring re-renders when the parent re-creates handler identities
  useEffect(() => { onToggleRef.current = toggleRow; });

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
            <ClassroomRow
              key={k}
              c={c}
              checked={checked}
              onToggleRef={onToggleRef}
              onEditRef={onEditRef}
              onDeleteRef={onDeleteRef}
            />
          );
        })}
      </tbody>
    </table>
  );
}

// Individual row component. Memoized to avoid re-rendering every row when only
// one row's selection state changes. The comparator only checks the fields we
// display and the `checked` state.
const ClassroomRow = React.memo(function ClassroomRow({ c, checked, onToggleRef, onEditRef, onDeleteRef }) {
  const k = `${c.building}||${c.classroomName}`;

  return (
    <tr onClick={() => onToggleRef.current && onToggleRef.current(c)}>
      <td>
        <input
          type="checkbox"
          aria-label={`Select ${c.building} ${c.classroomName}`}
          checked={checked}
          onChange={(e) => { e.stopPropagation(); onToggleRef.current && onToggleRef.current(c); }}
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
            onClick={(e) => { e.stopPropagation(); onEditRef.current && onEditRef.current(c); }}
          >
            <span className="material-icons">edit</span>
          </button>

          <button
            type="button"
            className="icon-btn icon-btn--delete"
            title="Delete"
            onClick={(e) => { e.stopPropagation(); onDeleteRef.current && onDeleteRef.current(c); }}
          >
            <span className="material-icons">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}, (prev, next) => {
  // Only re-render when the displayed data or the checked state changes.
  return (
    prev.checked === next.checked &&
    prev.c.building === next.c.building &&
    prev.c.classroomName === next.c.classroomName &&
    prev.c.capacity === next.c.capacity &&
    prev.c.type === next.c.type
  );
});
