import React, { useEffect, useState, useMemo } from "react";
import "./ui/ui.css";
import { typeBadge } from "./ui/typeUtils";

// Map type codes to display labels (matching typeBadge logic)
function getTypeLabel(type) {
  const typeMap = {
    PHYSICS_LAB: "Physics Lab",
    NETWORKING_LAB: "Networking Lab",
    LAB: "Laboratory",
    LECTURE: "Lecture",
    TUTORIAL: "Practice",
    NORMAL: "Normal",
    PBL: "PBL",
    PROJECT: "Project",
    AUDITORIUM: "Auditorium",
  };
  return typeMap[type] || type;
}

// Predefined capacity ranges for filtering
const capacityRanges = [
  { label: "Up to 20", min: 0, max: 20 },
  { label: "21 - 40", min: 21, max: 40 },
  { label: "41 - 60", min: 41, max: 60 },
  { label: "More than 60", min: 61, max: Infinity },
];

export default function ClassroomList({
  classrooms = [],
  onEdit,
  onDelete,
  onSelectionChange,
  title = "Classrooms",
}) {
  const [selectedBuildings, setSelectedBuildings] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedCapacityRanges, setSelectedCapacityRanges] = useState([]);
  const [isBuildingsDropdownOpen, setIsBuildingsDropdownOpen] = useState(false);
  const [isTypesDropdownOpen, setIsTypesDropdownOpen] = useState(false);
  const [isCapacityDropdownOpen, setIsCapacityDropdownOpen] = useState(false);

  // Extract unique buildings and types from classrooms
  const uniqueBuildings = useMemo(() => {
    const buildings = Array.from(
      new Set(classrooms.map((c) => c.building).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b, "he"));
    return buildings;
  }, [classrooms]);

  const uniqueTypes = useMemo(() => {
    const types = classrooms
      .map((c) => c.type)
      .filter((t, idx, arr) => t && arr.indexOf(t) === idx)
      .sort((a, b) => a.localeCompare(b, "he"));
    return types;
  }, [classrooms]);

  // Filter classrooms based on selected filters
  const filteredClassrooms = useMemo(() => {
    return classrooms.filter((c) => {
      if (
        selectedBuildings.length > 0 &&
        !selectedBuildings.includes(c.building)
      )
        return false;
      if (selectedTypes.length > 0 && !selectedTypes.includes(c.type))
        return false;
      if (selectedCapacityRanges.length > 0) {
        const capacity = Number(c.capacity);
        const matchesCapacity = selectedCapacityRanges.some((rangeLabel) => {
          const range = capacityRanges.find((r) => r.label === rangeLabel);
          return range && capacity >= range.min && capacity <= range.max;
        });
        if (!matchesCapacity) return false;
      }
      return true;
    });
  }, [classrooms, selectedBuildings, selectedTypes, selectedCapacityRanges]);

  if (!classrooms || classrooms.length === 0) {
    return (
      <div className="ui-card">
        <div className="empty-illustration">
          <svg
            viewBox="0 0 120 90"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <rect x="8" y="20" width="104" height="56" rx="6" fill="#eef2ff" />
            <rect x="18" y="30" width="40" height="8" rx="2" fill="#c7d2fe" />
            <rect x="18" y="44" width="74" height="6" rx="2" fill="#e0e7ff" />
            <rect x="18" y="54" width="30" height="6" rx="2" fill="#e0e7ff" />
          </svg>
          <div style={{ marginTop: 12, fontWeight: 700 }}>
            No classrooms yet
          </div>
          <div style={{ color: "var(--muted)", marginTop: 6 }}>
            Upload an Excel file or add a classroom manually.
          </div>
        </div>
      </div>
    );
  }

  // Determine if any filters are active and calculate the count to display in the title
  const hasActiveFilters =
    selectedBuildings.length > 0 ||
    selectedTypes.length > 0 ||
    selectedCapacityRanges.length > 0;
  const displayCount = hasActiveFilters
    ? filteredClassrooms.length
    : classrooms.length;

  const getSelectedBuildingsText = () => {
    if (selectedBuildings.length === 0) return "All Buildings";
    if (selectedBuildings.length === 1) return selectedBuildings[0];
    return `${selectedBuildings.length} Buildings selected`;
  };

  const getSelectedTypesText = () => {
    if (selectedTypes.length === 0) return "All Types";
    if (selectedTypes.length === 1) return getTypeLabel(selectedTypes[0]);
    return `${selectedTypes.length} Types selected`;
  };

  const getSelectedCapacityText = () => {
    if (selectedCapacityRanges.length === 0) return "All Capacities";
    if (selectedCapacityRanges.length === 1) return selectedCapacityRanges[0];
    return `${selectedCapacityRanges.length} Capacity ranges selected`;
  };

  // Toggle capacity range selection
  const toggleCapacityRange = (rangeLabel) => {
    setSelectedCapacityRanges((current) =>
      current.includes(rangeLabel)
        ? current.filter((item) => item !== rangeLabel)
        : [...current, rangeLabel],
    );
  };

  return (
    <div className="ui-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: "1.05rem",
            background:
              "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "inline-block",
          }}
        >
          {title}
          <span
            style={{
              color: "var(--text)",
              WebkitTextFillColor: "var(--text)",
              marginLeft: "8px",
              fontSize: "0.95rem",
              fontWeight: 600,
              opacity: hasActiveFilters ? 1 : 0.7,
            }}
          >
            ({displayCount}
            {hasActiveFilters ? `/${classrooms.length}` : ""})
          </span>
        </div>
      </div>

      {/* Filter Controls */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
          padding: "16px 16px",
          backgroundColor: "rgba(79, 70, 229, 0.02)",
          borderRadius: "8px",
          border: "1px solid rgba(79, 70, 229, 0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Filters:
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            position: "relative",
          }}
        >
          <span
            className="material-icons"
            style={{ fontSize: "1.1rem", color: "var(--muted)" }}
          >
            apartment
          </span>

          <button
            type="button"
            onClick={() => {
              setIsBuildingsDropdownOpen(!isBuildingsDropdownOpen);
              setIsTypesDropdownOpen(false);
              setIsCapacityDropdownOpen(false);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(15, 23, 36, 0.12)",
              backgroundColor:
                selectedBuildings.length > 0
                  ? "rgba(79, 70, 229, 0.08)"
                  : "white",
              color: "var(--text)",
              fontSize: "0.95rem",
              cursor: "pointer",
              fontWeight: selectedBuildings.length > 0 ? 600 : 500,
              minWidth: "160px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            {getSelectedBuildingsText()}
            <span className="material-icons" style={{ fontSize: "1rem" }}>
              expand_more
            </span>
          </button>

          {isBuildingsDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "110%",
                left: 28,
                zIndex: 20,
                minWidth: "180px",
                backgroundColor: "white",
                border: "1px solid rgba(15, 23, 36, 0.12)",
                borderRadius: "8px",
                boxShadow: "0 8px 24px rgba(15, 23, 36, 0.12)",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {uniqueBuildings.map((building) => (
                <label
                  key={building}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    backgroundColor: selectedBuildings.includes(building)
                      ? "rgba(79, 70, 229, 0.08)"
                      : "transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedBuildings.includes(building)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBuildings([...selectedBuildings, building]);
                      } else {
                        setSelectedBuildings(
                          selectedBuildings.filter((b) => b !== building),
                        );
                      }
                    }}
                  />
                  {building}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Type Filter Dropdown */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            position: "relative",
          }}
        >
          <span
            className="material-icons"
            style={{ fontSize: "1.1rem", color: "var(--muted)" }}
          >
            label
          </span>

          <button
            type="button"
            onClick={() => {
              setIsTypesDropdownOpen(!isTypesDropdownOpen);
              setIsBuildingsDropdownOpen(false);
              setIsCapacityDropdownOpen(false);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(15, 23, 36, 0.12)",
              backgroundColor:
                selectedTypes.length > 0 ? "rgba(79, 70, 229, 0.08)" : "white",
              color: "var(--text)",
              fontSize: "0.95rem",
              cursor: "pointer",
              fontWeight: selectedTypes.length > 0 ? 600 : 500,
              minWidth: "160px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            {getSelectedTypesText()}
            <span className="material-icons" style={{ fontSize: "1rem" }}>
              expand_more
            </span>
          </button>
          {/* Types dropdown menu */}
          {isTypesDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "110%",
                left: 28,
                zIndex: 20,
                minWidth: "200px",
                backgroundColor: "white",
                border: "1px solid rgba(15, 23, 36, 0.12)",
                borderRadius: "8px",
                boxShadow: "0 8px 24px rgba(15, 23, 36, 0.12)",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {uniqueTypes.map((type) => (
                <label
                  key={type}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    backgroundColor: selectedTypes.includes(type)
                      ? "rgba(79, 70, 229, 0.08)"
                      : "transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTypes([...selectedTypes, type]);
                      } else {
                        setSelectedTypes(
                          selectedTypes.filter((t) => t !== type),
                        );
                      }
                    }}
                  />
                  {getTypeLabel(type)}
                </label>
              ))}
            </div>
          )}
        </div>
        {/* Capacity Filter Dropdown */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            position: "relative",
          }}
        >
          <span
            className="material-icons"
            style={{ fontSize: "1.1rem", color: "var(--muted)" }}
          >
            groups
          </span>

          <button
            type="button"
            onClick={() => {
              setIsCapacityDropdownOpen(!isCapacityDropdownOpen);
              setIsBuildingsDropdownOpen(false);
              setIsTypesDropdownOpen(false);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(15, 23, 36, 0.12)",
              backgroundColor:
                selectedCapacityRanges.length > 0
                  ? "rgba(79, 70, 229, 0.08)"
                  : "white",
              color: "var(--text)",
              fontSize: "0.95rem",
              cursor: "pointer",
              fontWeight: selectedCapacityRanges.length > 0 ? 600 : 500,
              minWidth: "180px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            {getSelectedCapacityText()}
            <span className="material-icons" style={{ fontSize: "1rem" }}>
              expand_more
            </span>
          </button>
          {/* Capacity dropdown menu */}
          {isCapacityDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "110%",
                left: 28,
                zIndex: 20,
                minWidth: "200px",
                backgroundColor: "white",
                border: "1px solid rgba(15, 23, 36, 0.12)",
                borderRadius: "8px",
                boxShadow: "0 8px 24px rgba(15, 23, 36, 0.12)",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {/* We use the predefined capacityRanges to render checkboxes for each range */}
              {capacityRanges.map((range) => (
                <label
                  key={range.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    backgroundColor: selectedCapacityRanges.includes(
                      range.label,
                    )
                      ? "rgba(79, 70, 229, 0.08)"
                      : "transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedCapacityRanges.includes(range.label)}
                    onChange={() => toggleCapacityRange(range.label)}
                  />
                  {range.label}
                </label>
              ))}
            </div>
          )}
        </div>
        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSelectedBuildings([]);
              setSelectedTypes([]);
              setSelectedCapacityRanges([]);
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
              gap: "6px",
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
            <span
              className="material-icons"
              style={{ fontSize: "1rem", lineHeight: "1" }}
            >
              close
            </span>
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

/* SelectableTable is a memoized table component that manages selection state internally. It accepts the list of classrooms and handler functions as props, and provides callbacks when selection changes. The table header includes a "select all" checkbox, and each row has its own checkbox for individual selection. The component uses stable keys to avoid resetting selection when the parent re-renders with a new array reference but the same classroom data.*/

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

  console.debug &&
    console.debug("SelectableTable render", {
      count: classrooms.length,
      selected: Object.keys(selectedMap).length,
    });
  // We'll keep the latest handler functions in refs and pass refs to memoized rows
  const onEditRef = React.useRef(onEdit);
  const onDeleteRef = React.useRef(onDelete);
  const onToggleRef = React.useRef();

  useEffect(() => {
    onEditRef.current = onEdit;
    onDeleteRef.current = onDelete;
  }, [onEdit, onDelete]);

  const toggleRow = (c) => {
    const k = keyFor(c);
    const next = { ...selectedMap };
    if (next[k]) delete next[k];
    else next[k] = c;
    setSelectedMap(next);
    onSelectionChange && onSelectionChange(Object.values(next));
    console.debug &&
      console.debug("toggleRow", {
        key: k,
        totalSelected: Object.keys(next).length,
      });
  };

  // keep pointer to latest toggle handler so memoized rows can call it without
  // requiring re-renders when the parent re-creates handler identities
  useEffect(() => {
    onToggleRef.current = toggleRow;
  });

  const allSelected =
    classrooms.length > 0 && classrooms.every((c) => selectedMap[keyFor(c)]);

  // Toggle select all/clear all. We compute the new selected map based on the current classrooms, so it works even if the parent passes a new array reference with the same classroom data.
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
      console.debug &&
        console.debug("toggleSelectAll", {
          action: "selectAll",
          total: Object.keys(map).length,
        });
    }
  };

  return (
    <table
      className="data-table"
      style={{ width: "100%", borderCollapse: "collapse" }}
    >
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
const ClassroomRow = React.memo(
  function ClassroomRow({ c, checked, onToggleRef, onEditRef, onDeleteRef }) {
    const k = `${c.building}||${c.classroomName}`;

    return (
      <tr onClick={() => onToggleRef.current && onToggleRef.current(c)}>
        <td>
          <input
            type="checkbox"
            aria-label={`Select ${c.building} ${c.classroomName}`}
            checked={checked}
            onChange={(e) => {
              e.stopPropagation();
              onToggleRef.current && onToggleRef.current(c);
            }}
            onClick={(e) =>
              e.stopPropagation()
            } /* prevent double toggle when clicking checkbox */
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
              onClick={(e) => {
                e.stopPropagation();
                onEditRef.current && onEditRef.current(c);
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
                onDeleteRef.current && onDeleteRef.current(c);
              }}
            >
              <span className="material-icons">delete</span>
            </button>
          </div>
        </td>
      </tr>
    );
  },
  (prev, next) => {
    // Only re-render when the displayed data or the checked state changes.
    return (
      prev.checked === next.checked &&
      prev.c.building === next.c.building &&
      prev.c.classroomName === next.c.classroomName &&
      prev.c.capacity === next.c.capacity &&
      prev.c.type === next.c.type
    );
  },
);
