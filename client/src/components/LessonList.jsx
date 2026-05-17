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

export default function LessonList({
  lessons = [],
  clusters = [],
  onEdit,
  onDelete,
  onSelectionChange,
  title = "Lessons",
}) {
  const [selectedCourseNames, setSelectedCourseNames] = useState([]);
  const [selectedLecturers, setSelectedLecturers] = useState([]);
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedSemesters, setSelectedSemesters] = useState([]);
  const [selectedCredits, setSelectedCredits] = useState([]);

  const [openFilter, setOpenFilter] = useState(null);

  // Create a mapping from cluster number to cluster name for easy lookup
  const clusterNameByNumber = useMemo(() => {
    return new Map(
      clusters.map((cluster) => [Number(cluster.number), cluster.name]),
    );
  }, [clusters]);

  // Enrich lessons with cluster names using the mapping. If a lesson already has a clusterName, use it; otherwise, look it up using the cluster number. If no name is found, fallback to using the cluster number as a string.
  const lessonsWithClusterNames = useMemo(() => {
    return lessons.map((lesson) => ({
      ...lesson,
      clusterName:
        lesson.clusterName ||
        clusterNameByNumber.get(Number(lesson.cluster)) ||
        String(lesson.cluster),
    }));
  }, [lessons, clusterNameByNumber]);

  // Extract unique values for each filter
  const uniqueCourseNames = useMemo(() => {
    const names = Array.from(
      new Set(lessons.map((l) => l.courseName).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b, "he"));
    return names;
  }, [lessons]);

  // For lecturers, we also filter out any falsy values (like null or empty strings) to avoid showing them as filter options. The same is done for course names and types.
  const uniqueLecturers = useMemo(() => {
    const lecturers = Array.from(
      new Set(lessonsWithClusterNames.map((l) => l.lecturer).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b, "he"));
    return lecturers;
  }, [lessonsWithClusterNames]);

  // For clusters, we first extract the cluster names from the enriched lessons. We filter out any null or empty values to avoid showing them as filter options. Then we create a unique set of cluster names and sort them alphabetically.
  const uniqueClusters = useMemo(() => {
    const clusters = Array.from(
      new Set(
        lessonsWithClusterNames
          .map((l) => l.clusterName)
          .filter((name) => name != null && name !== ""),
      ),
    ).sort((a, b) => a.localeCompare(b, "he"));

    return clusters;
  }, [lessonsWithClusterNames]);

  const uniqueTypes = useMemo(() => {
    const types = Array.from(
      new Set(lessons.map((l) => l.type).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b, "he"));
    return types;
  }, [lessons]);

  const uniqueSemesters = useMemo(() => {
    const semesters = Array.from(
      new Set(lessons.map((l) => l.semester).filter((s) => s != null)),
    ).sort((a, b) => {
      // Define semester order: A, B
      const semesterOrder = { A: 1, B: 2 };
      return (semesterOrder[a] || 99) - (semesterOrder[b] || 99);
    });
    return semesters;
  }, [lessons]);

  const uniqueCreditsValues = useMemo(() => {
    const credits = Array.from(
      new Set(lessons.map((l) => l.credits).filter((c) => c != null)),
    ).sort((a, b) => a - b);
    return credits;
  }, [lessons]);

  // Filter lessons based on selected filters
  const filteredLessons = useMemo(() => {
    return lessonsWithClusterNames.filter((l) => {
      if (
        selectedCourseNames.length > 0 &&
        !selectedCourseNames.includes(l.courseName)
      ) {
        return false;
      }
      if (
        selectedLecturers.length > 0 &&
        !selectedLecturers.includes(l.lecturer)
      ) {
        return false;
      }
      if (
        selectedClusters.length > 0 &&
        !selectedClusters.includes(l.clusterName)
      ) {
        return false;
      }
      if (selectedTypes.length > 0 && !selectedTypes.includes(l.type)) {
        return false;
      }
      if (
        selectedSemesters.length > 0 &&
        !selectedSemesters.includes(l.semester)
      ) {
        return false;
      }
      if (selectedCredits.length > 0 && !selectedCredits.includes(l.credits)) {
        return false;
      }
      return true;
    });
  }, [
    lessonsWithClusterNames,
    selectedCourseNames,
    selectedLecturers,
    selectedClusters,
    selectedTypes,
    selectedSemesters,
    selectedCredits,
  ]);

  // If there are no lessons, show an empty state with an illustration and a message prompting the user to add lessons.
  if (!lessons || lessons.length === 0) {
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
          <div style={{ marginTop: 12, fontWeight: 700 }}>No lessons yet</div>
          <div style={{ color: "var(--muted)", marginTop: 6 }}>
            Upload an Excel file or add a lesson manually.
          </div>
        </div>
      </div>
    );
  }

  const hasActiveFilters =
    selectedCourseNames.length > 0 ||
    selectedLecturers.length > 0 ||
    selectedClusters.length > 0 ||
    selectedTypes.length > 0 ||
    selectedSemesters.length > 0 ||
    selectedCredits.length > 0;
  const displayCount = hasActiveFilters
    ? filteredLessons.length
    : lessons.length;

  const clearAllFilters = () => {
    setSelectedCourseNames([]);
    setSelectedLecturers([]);
    setSelectedClusters([]);
    setSelectedTypes([]);
    setSelectedSemesters([]);
    setSelectedCredits([]);
    setOpenFilter(null);
  };

  const toggleValue = (value, setter) => {
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  return (
    <div className="ui-card">
      {/* Header with title and count */}
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
            {hasActiveFilters ? `/${lessons.length}` : ""})
          </span>
        </div>
      </div>

      {/* Filter Controls */}
      <div
        style={{
          display: "flex",
          gap: 16,
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

        <DropdownFilter
          icon="book"
          label="Courses"
          filterKey="course"
          openFilter={openFilter}
          setOpenFilter={setOpenFilter}
          options={uniqueCourseNames}
          selectedValues={selectedCourseNames}
          onToggle={(value) => toggleValue(value, setSelectedCourseNames)}
        />

        <DropdownFilter
          icon="person"
          label="Lecturers"
          filterKey="lecturer"
          openFilter={openFilter}
          setOpenFilter={setOpenFilter}
          options={uniqueLecturers}
          selectedValues={selectedLecturers}
          onToggle={(value) => toggleValue(value, setSelectedLecturers)}
        />

        <DropdownFilter
          icon="layers"
          label="Clusters"
          filterKey="cluster"
          openFilter={openFilter}
          setOpenFilter={setOpenFilter}
          options={uniqueClusters}
          selectedValues={selectedClusters}
          onToggle={(value) => toggleValue(value, setSelectedClusters)}
        />

        <DropdownFilter
          icon="label"
          label="Types"
          filterKey="type"
          openFilter={openFilter}
          setOpenFilter={setOpenFilter}
          options={uniqueTypes}
          selectedValues={selectedTypes}
          onToggle={(value) => toggleValue(value, setSelectedTypes)}
          getOptionLabel={getTypeLabel}
        />

        <DropdownFilter
          icon="event"
          label="Semesters"
          filterKey="semester"
          openFilter={openFilter}
          setOpenFilter={setOpenFilter}
          options={uniqueSemesters}
          selectedValues={selectedSemesters}
          onToggle={(value) => toggleValue(value, setSelectedSemesters)}
          getOptionLabel={(semester) => {
            const semesterLabels = { A: "Semester A", B: "Semester B" };
            return semesterLabels[semester] || semester;
          }}
        />

        <DropdownFilter
          icon="star"
          label="Credits"
          filterKey="credits"
          openFilter={openFilter}
          setOpenFilter={setOpenFilter}
          options={uniqueCreditsValues}
          selectedValues={selectedCredits}
          onToggle={(value) => toggleValue(value, setSelectedCredits)}
          getOptionLabel={(credit) => `${credit} Credits`}
        />

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
          lessons={filteredLessons}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelectionChange={onSelectionChange}
        />
      </div>
    </div>
  );
}

// DropdownFilter component for reusable filter dropdowns in the header. It displays a button with the filter label and an icon, and when clicked, shows a dropdown with options that can be toggled on or off. The button text updates based on the selected options, and the dropdown is positioned relative to the button.
function DropdownFilter({
  icon,
  label,
  filterKey,
  openFilter,
  setOpenFilter,
  options,
  selectedValues,
  onToggle,
  getOptionLabel = (value) => value,
}) {
  const isOpen = openFilter === filterKey;

  const getButtonText = () => {
    if (selectedValues.length === 0) return `All ${label}`;
    if (selectedValues.length === 1) return getOptionLabel(selectedValues[0]);
    return `${selectedValues.length} selected`;
  };

  return (
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
        {icon}
      </span>

      <button
        type="button"
        onClick={() => setOpenFilter(isOpen ? null : filterKey)}
        style={{
          padding: "8px 12px",
          borderRadius: "6px",
          border: "1px solid rgba(15, 23, 36, 0.12)",
          backgroundColor:
            selectedValues.length > 0 ? "rgba(79, 70, 229, 0.08)" : "white",
          color: "var(--text)",
          fontSize: "0.95rem",
          cursor: "pointer",
          fontWeight: selectedValues.length > 0 ? 600 : 500,
          minWidth: "150px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        {getButtonText()}
        <span className="material-icons" style={{ fontSize: "1rem" }}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: 28,
            zIndex: 20,
            minWidth: "220px",
            maxHeight: "260px",
            overflowY: "auto",
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
          {options.map((option) => (
            <label
              key={option}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 8px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.9rem",
                backgroundColor: selectedValues.includes(option)
                  ? "rgba(79, 70, 229, 0.08)"
                  : "transparent",
              }}
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={() => onToggle(option)}
              />
              {getOptionLabel(option)}
            </label>
          ))}
        </div>
      )}
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

  const allSelected =
    lessons.length > 0 && lessons.every((c) => selectedMap[keyFor(c)]);

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
    <table
      className="data-table"
      style={{ width: "100%", borderCollapse: "collapse" }}
    >
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
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleRow(l);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              <td>{l.courseId}</td>
              <td>{l.courseName}</td>
              <td>{l.lecturer}</td>
              <td>{l.clusterName || l.cluster}</td>
              <td>{typeBadge(l.type)}</td>
              <td>{l.duration}</td>
              <td>{l.semester ? String(l.semester) : ""}</td>
              <td>{l.credits}</td>
              <td>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    className="icon-btn icon-btn--edit"
                    title="Edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit && onEdit(l);
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
                      onDelete && onDelete(l);
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
