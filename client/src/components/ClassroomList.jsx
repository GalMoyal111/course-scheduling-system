import React, { useEffect, useState } from "react";
import "./ui/ui.css";
import { typeBadge } from "./ui/typeUtils";


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
