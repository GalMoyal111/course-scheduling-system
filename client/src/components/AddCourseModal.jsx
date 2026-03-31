import React, { useState } from "react";
import Button from "./ui/Button";
import "./ui/ui.css";

const CLUSTER_NAME_OPTIONS = [
  "מדעים",
  "עיבוד אותות ורשתות תקשורת",
  "אלגוריתמים",
  "סמינרים",
  "הנדסת תוכנה",
  "מעבדות",
];

const CLUSTER_NAME_TO_NUMBER = {
  "מדעים": 9,
  "עיבוד אותות ורשתות תקשורת": 10,
  "אלגוריתמים": 11,
  "סמינרים": 12,
  "הנדסת תוכנה": 13,
  "מעבדות": 14,
};

const CLUSTER_NUMBER_TO_NAME = {
  9: "מדעים",
  10: "עיבוד אותות ורשתות תקשורת",
  11: "אלגוריתמים",
  12: "סמינרים",
  13: "הנדסת תוכנה",
  14: "מעבדות",
};

const SemesterOptions = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8"];

// Simple modal for adding a single course (uses app UI styles).
export default function AddCourseModal({ isOpen, onClose, onSave, initialCourse = null, allCourses = [] }) {
  const [cluster, setCluster] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [prerequisiteCourseNumbers, setPrerequisiteCourseNumbers] = useState([]);
  const [prerequisiteInput, setPrerequisiteInput] = useState("");
  const [lectureHours, setLectureHours] = useState("");
  const [tutorialHours, setTutorialHours] = useState("");
  const [labHours, setLabHours] = useState("");
  const [projectHours, setProjectHours] = useState("");
  const [credits, setCredits] = useState("");
  const [notes, setNotes] = useState("");
  const [clusterName, setClusterName] = useState("");
  const [invalidPrereqWarning, setInvalidPrereqWarning] = useState(null);
  const [pendingPrerequisite, setPendingPrerequisite] = useState(null);
  // Disable semester selection if the cluster is between 9-14, otherwise disable cluster name selection. This ensures users can't select both a semester and a cluster name at the same time.
  const selectedClusterNumber =cluster.trim() !== "" ? Number(cluster) : CLUSTER_NAME_TO_NUMBER[clusterName.trim()];
  const isSemesterDisabled = Number.isInteger(selectedClusterNumber) && selectedClusterNumber >= 9 && selectedClusterNumber <= 14;
  // const isSemesterDisabled = clusterName !== "" && cluster === "";
  const isClusterNameDisabled = cluster !== "" && clusterName === "";

  const resetForm = () => {
    setCluster("");
    setCourseCode("");
    setCourseName("");
    setPrerequisiteCourseNumbers([]);
    setPrerequisiteInput("");
    setLectureHours("");
    setTutorialHours("");
    setLabHours("");
    setProjectHours("");
    setCredits("");
    setNotes("");
    setClusterName("");
    setInvalidPrereqWarning(null);
    setPendingPrerequisite(null);
  };
  
  // Initialize fields when modal opens or when initialCourse changes
  React.useEffect(() => {
    if (!isOpen) return;
    if (initialCourse) {
      const initialClusterValue =
        initialCourse.semesterNumber != null
          ? String(initialCourse.semesterNumber)
          : initialCourse.cluster != null
          ? String(initialCourse.cluster)
          : "";

      const initialClusterAsNumber = Number(initialClusterValue);
      if (
        Number.isInteger(initialClusterAsNumber) &&
        initialClusterAsNumber >= 1 &&
        initialClusterAsNumber <= 8
      ) {
        setCluster(String(initialClusterAsNumber));
        setClusterName("");
      } else if (
        Number.isInteger(initialClusterAsNumber) &&
        initialClusterAsNumber >= 9 &&
        initialClusterAsNumber <= 14
      ) {
        const inferredClusterName = CLUSTER_NUMBER_TO_NAME[initialClusterAsNumber] || "";
        setCluster("");
        setClusterName(initialCourse.clusterName || inferredClusterName);
      } else {
        setCluster("");
        setClusterName("");
      }

      setCourseCode(initialCourse.courseCode || initialCourse.courseId || "");
      setCourseName(initialCourse.courseName || "");
      const parsedPrerequisites = (initialCourse.prerequisiteCourseNumber || "")
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value !== "");
      setPrerequisiteCourseNumbers(parsedPrerequisites);
      setPrerequisiteInput("");
      setLectureHours(initialCourse.lectureHours != null ? String(initialCourse.lectureHours) : "");
      setTutorialHours(initialCourse.tutorialHours != null ? String(initialCourse.tutorialHours) : "");
      setLabHours(initialCourse.labHours != null ? String(initialCourse.labHours) : "");
      setProjectHours(initialCourse.projectHours != null ? String(initialCourse.projectHours) : "");
      setCredits(initialCourse.credits != null ? String(initialCourse.credits) : "");
      setNotes(initialCourse.notes || "");
    } else {
      resetForm();
    }
  }, [isOpen, initialCourse]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialCourse);

  const toNonNegativeInt = (value, fieldName) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0) {
      throw new Error(`Please enter a valid non-negative number for ${fieldName}.`);
    }
    return parsed;
  };

  // Validates that the prerequisite course code is 5 or 6 digits (e.g., "12345").
  const validatePrerequisiteCode = (code) => /^\d{5,6}$/.test(code);
  const validateCourseCode = (code) => /^\d{5,6}$/.test(code);
  const keepDigitsOnly = (value) => value.replace(/\D/g, "");
  // const validatePrerequisiteCode = (code) => /^\d{5}$/.test(code);

  const handleAddPrerequisite = () => {
    const nextCode = prerequisiteInput.trim();
    if (nextCode === "") {
      return;
    }
    if (!validatePrerequisiteCode(nextCode)) {
      throw new Error("Prerequisite course code must contain exactly 5 or 6 digits.");
    }
    if (prerequisiteCourseNumbers.includes(nextCode)) {
      throw new Error("This prerequisite course code is already added.");
    }

    // Check if the prerequisite course exists in the system
    const courseExists = allCourses.some(course => course.courseId === nextCode);
    
    if (!courseExists) {
      // Show warning modal
      setPendingPrerequisite(nextCode);
      setInvalidPrereqWarning(nextCode);
    } else {
      // Course exists, add it directly
      setPrerequisiteCourseNumbers((prev) => [...prev, nextCode]);
      setPrerequisiteInput("");
    }
  };

  const confirmAddPrerequisiteWithWarning = () => {
    if (pendingPrerequisite) {
      setPrerequisiteCourseNumbers((prev) => [...prev, pendingPrerequisite]);
      setPrerequisiteInput("");
    }
    setInvalidPrereqWarning(null);
    setPendingPrerequisite(null);
  };

  const cancelAddPrerequisite = () => {
    setInvalidPrereqWarning(null);
    setPendingPrerequisite(null);
  };

  const handleRemovePrerequisite = (codeToRemove) => {
    setPrerequisiteCourseNumbers((prev) => prev.filter((code) => code !== codeToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      if (cluster.trim() === "" && clusterName.trim() === "") {
        throw new Error("Please choose a semester number or a cluster name.");
      }

      const mappedClusterFromName = CLUSTER_NAME_TO_NUMBER[clusterName.trim()];
      const resolvedCluster =
        cluster.trim() !== ""
          ? toNonNegativeInt(cluster, "cluster")
          : mappedClusterFromName;

      if (resolvedCluster == null) {
        throw new Error("Please choose a valid cluster name.");
      }

      const normalizedCourseCode = courseCode.trim();
      if (!validateCourseCode(normalizedCourseCode)) {
        throw new Error("Course code must contain exactly 5 or 6 digits.");
      }

      if (prerequisiteInput.trim() !== "") {
        throw new Error("Please click + to add the prerequisite code before saving.");
      }

      const course = {
        cluster: resolvedCluster,
        courseId: normalizedCourseCode,
        // courseCode: courseCode.trim(),
        courseName: courseName.trim(),
        prerequisiteCourseNumber: prerequisiteCourseNumbers.join(","),
        lectureHours: toNonNegativeInt(lectureHours, "lecture hours"),
        tutorialHours: toNonNegativeInt(tutorialHours, "tutorial hours"),
        labHours: toNonNegativeInt(labHours, "lab hours"),
        projectHours: toNonNegativeInt(projectHours, "project hours"),
        credits: toNonNegativeInt(credits, "credits"),
        notes: notes.trim(),
        clusterName: clusterName.trim(),
      };

      onSave(course);
      resetForm();
    } catch (err) {
      alert(err.message || "Please enter valid values.");
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (invalidPrereqWarning) {
    return (
      <div className="modal-overlay">
        <div className="modal-card" role="dialog" aria-modal="true">
          <div className="modal-header">
            <h3>⚠️ Prerequisite Course Not Found</h3>
          </div>

          <div className="modal-body" style={{ paddingBottom: "1rem" }}>
            <p style={{ marginBottom: "0.5rem" }}>
              The prerequisite course <strong>{invalidPrereqWarning}</strong> does not exist in the system.
            </p>
            <p>Would you like to add it anyway?</p>
          </div>

          <div className="modal-actions">
            <Button variant="ghost" onClick={cancelAddPrerequisite}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmAddPrerequisiteWithWarning}>
              Add Anyway
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-card--wide" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3>{isEditing ? "Edit Course" : "Add Course"}</h3>
        </div>

        <div className="modal-body">
          <form className="add-course-form" onSubmit={handleSubmit}>
            <div className="add-course-grid">
            <div className="form-field">
              <label>Semester</label>
                <select
                  className="ui-input"
                  value={cluster}
                  onChange={(e) => {
                    const selectedCluster = e.target.value;
                    setCluster(selectedCluster);
                    if (selectedCluster !== "") {
                      setClusterName("");
                    }
                  }}
                  disabled={isSemesterDisabled}
              >
                {isSemesterDisabled ? (
                  <option value="">NOT AVAILABLE - CHOSE CLUSTER NAME</option>
                ) : (
                  <>
                    <option value="">Select a semester</option>
                    {SemesterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="form-field">
              <label>Cluster Name</label>
              <select
                className="ui-input"
                value={clusterName}
                onChange={(e) => {
                  const selectedClusterName = e.target.value;
                  setClusterName(selectedClusterName);
                  if (selectedClusterName !== "") {
                    setCluster("");
                  }
                }}
                disabled={isClusterNameDisabled}
              >
                {isClusterNameDisabled ? (
                  <option value="">NOT AVAILABLE - CHOSE SEMSTER NUMBER</option>
                ) : (
                  <>
                    <option value="">Select cluster name</option>
                    {CLUSTER_NAME_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="form-field">
              <label>Course Code</label>
              <input
                className="ui-input"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                pattern="[0-9]{5,6}"
                minLength={5}
                maxLength={6}
                title="Course code must contain exactly 5 or 6 digits"
                placeholder="5 or 6-digit course code"
                required
              />
            </div>

            <div className="form-field">
              <label>Course Name</label>
              <input
                className="ui-input"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Prerequisites</label>
              <div className="prereq-input-row">
                <input
                  className="ui-input"
                  value={prerequisiteInput}
                  onChange={(e) => setPrerequisiteInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      try {
                        handleAddPrerequisite();
                      } catch (err) {
                        alert(err.message || "Invalid prerequisite course code.");
                      }
                    }
                  }}
                  placeholder="5 or 6-digit course code"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    try {
                      handleAddPrerequisite();
                    } catch (err) {
                      alert(err.message || "Invalid prerequisite course code.");
                    }
                  }}
                >
                  +
                </Button>
              </div>
              {prerequisiteCourseNumbers.length > 0 && (
                <div className="prereq-chips">
                  {prerequisiteCourseNumbers.map((code) => (
                    <div key={code} className="prereq-chip">
                      <span>{code}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePrerequisite(code)}
                        className="prereq-chip-remove"
                        aria-label={`Remove prerequisite ${code}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-field">
              <label>Lecture Hours</label>
              <input
                className="ui-input"
                value={lectureHours}
                onChange={(e) => setLectureHours(keepDigitsOnly(e.target.value))}
                inputMode="numeric"
                required
              />
            </div>

            <div className="form-field">
              <label>Tutorial Hours</label>
              <input
                className="ui-input"
                value={tutorialHours}
                onChange={(e) => setTutorialHours(keepDigitsOnly(e.target.value))}
                inputMode="numeric"
                required
              />
            </div>

            <div className="form-field">
              <label>Lab Hours</label>
              <input
                className="ui-input"
                value={labHours}
                onChange={(e) => setLabHours(keepDigitsOnly(e.target.value))}
                inputMode="numeric"
                required
              />
            </div>

            <div className="form-field">
              <label>Project Hours</label>
              <input
                className="ui-input"
                value={projectHours}
                onChange={(e) => setProjectHours(keepDigitsOnly(e.target.value))}
                inputMode="numeric"
                required
              />
            </div>

            <div className="form-field">
              <label>Credits</label>
              <input
                className="ui-input"
                value={credits}
                onChange={(e) => setCredits(keepDigitsOnly(e.target.value))}
                inputMode="numeric"
                required
              />
            </div>

            <div className="form-field">
              <label>Notes</label>
              <input
                className="ui-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes about the course"
              />
            </div>
            </div>

            <div className="modal-actions">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">Save</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
