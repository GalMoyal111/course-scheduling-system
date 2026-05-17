import React, { useState, useMemo, useEffect } from "react";
import Button from "./ui/Button";
import "./ui/ui.css";
import Modal from "./ui/Modal";
import { useData } from "../context/DataContext";
import Toast, { useToast } from "./ui/Toast";

// Simple modal for adding a single course (uses app UI styles).
export default function AddCourseModal({
  isOpen,
  onClose,
  onSave,
  initialCourse = null,
  allCourses = [],
}) {
  const { clusters, fetchClustersIfNeeded } = useData();
  const { toast, showSuccess, showError, closeToast } = useToast();

  // Initialize clusters on mount
  useEffect(() => {
    fetchClustersIfNeeded("AddCourseModal");
  }, [fetchClustersIfNeeded]);

  // Build dynamic cluster mappings from DataContext
  const clusterMappings = useMemo(() => {
    const nameToNum = {};
    const numToName = {};

    clusters.forEach((c) => {
      if (c.number && c.name) {
        nameToNum[c.name] = c.number;
        numToName[c.number] = c.name;
      }
    });

    return { nameToNum, numToName, clusterNames: clusters.map((c) => c.name) };
  }, [clusters]);

  // Form state variables
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [prerequisiteCourseNumbers, setPrerequisiteCourseNumbers] = useState(
    [],
  );
  const [prerequisiteInput, setPrerequisiteInput] = useState("");
  const [lectureHours, setLectureHours] = useState("");
  const [tutorialHours, setTutorialHours] = useState("");
  const [labHours, setLabHours] = useState("");
  const [projectHours, setProjectHours] = useState("");
  const [credits, setCredits] = useState("");
  const [isCreditsEditable, setIsCreditsEditable] = useState(false);
  const [clusterName, setClusterName] = useState("");
  const [invalidPrereqWarning, setInvalidPrereqWarning] = useState(null);
  const [pendingPrerequisite, setPendingPrerequisite] = useState(null);
  const [duplicateCourseWarning, setDuplicateCourseWarning] = useState(null);
  const [pendingCourse, setPendingCourse] = useState(null);
  const [creditsEditWarningOpen, setCreditsEditWarningOpen] = useState(false);

  // Helper function to reset form state to initial values
  const resetForm = () => {
    setCourseCode("");
    setCourseName("");
    setPrerequisiteCourseNumbers([]);
    setPrerequisiteInput("");
    setLectureHours("");
    setTutorialHours("");
    setLabHours("");
    setProjectHours("");
    setCredits("");
    setIsCreditsEditable(false);
    setClusterName("");
    setInvalidPrereqWarning(null);
    setPendingPrerequisite(null);
    setDuplicateCourseWarning(null);
    setPendingCourse(null);
    setCreditsEditWarningOpen(false);
  };

  // Initialize fields when modal opens or when initialCourse changes
  useEffect(() => {
    if (!isOpen) return;
    if (initialCourse) {
      // retrieve cluster name from mappings, fallback to initialCourse.clusterName or empty string
      const initialClusterAsNumber = Number(
        initialCourse.cluster ?? initialCourse.semesterNumber,
      );
      const name =
        clusterMappings.numToName[initialClusterAsNumber] ||
        initialCourse.clusterName ||
        "";
      setClusterName(name);

      // retrieve course code, name, prerequisites, hours, and credits from initialCourse
      setCourseCode(initialCourse.courseCode || initialCourse.courseId || "");
      setCourseName(initialCourse.courseName || "");
      const parsedPrerequisites = (initialCourse.prerequisiteCourseNumber || "")
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value !== "");
      setPrerequisiteCourseNumbers(parsedPrerequisites);
      setPrerequisiteInput("");
      setLectureHours(
        initialCourse.lectureHours != null
          ? String(initialCourse.lectureHours)
          : "",
      );
      setTutorialHours(
        initialCourse.tutorialHours != null
          ? String(initialCourse.tutorialHours)
          : "",
      );
      setLabHours(
        initialCourse.labHours != null ? String(initialCourse.labHours) : "",
      );
      setProjectHours(
        initialCourse.projectHours != null
          ? String(initialCourse.projectHours)
          : "",
      );
      setCredits(
        initialCourse.credits != null ? String(initialCourse.credits) : "",
      );
      setIsCreditsEditable(false);
    } else {
      resetForm();
    }
  }, [isOpen, initialCourse, clusterMappings]);

  // Automatically calculate credits when hours change, unless user has chosen to edit credits manually
  useEffect(() => {
    if (isCreditsEditable) {
      return;
    }

    // Formula: 1 credit per lecture hour, plus 0.5 credits for each tutorial, lab, or project hour
    const lecture = Number(lectureHours || 0);
    const tutorial = Number(tutorialHours || 0);
    const lab = Number(labHours || 0);
    const project = Number(projectHours || 0);
    const calculatedCredits = lecture + 0.5 * (tutorial + lab + project);
    const formattedCredits = Number.isInteger(calculatedCredits)
      ? String(calculatedCredits)
      : calculatedCredits.toFixed(1);

    setCredits(formattedCredits);
  }, [lectureHours, tutorialHours, labHours, projectHours, isCreditsEditable]);

  if (!isOpen) return null;

  // Validation helper functions
  const toNonNegativeInt = (value, fieldName) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0) {
      throw new Error(
        `Please enter a valid non-negative number for ${fieldName}.`,
      );
    }
    return parsed;
  };

  // Allows non-negative floats for credits (e.g., 3.5)
  const toNonNegativeFloat = (value, fieldName) => {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 0) {
      throw new Error(
        `Please enter a valid non-negative number for ${fieldName}.`,
      );
    }
    return parsed;
  };

  // Validates that the code consists of exactly 5 or 6 digits
  const validatePrerequisiteCode = (code) => /^\d{5,6}$/.test(code);
  const validateCourseCode = (code) => /^\d{5,6}$/.test(code);
  const keepDigitsOnly = (value) => value.replace(/\D/g, "");

  // Handler for adding a prerequisite course code
  const handleAddPrerequisite = () => {
    const nextCode = prerequisiteInput.trim();
    if (nextCode === "") {
      return;
    }
    if (!validatePrerequisiteCode(nextCode)) {
      throw new Error(
        "Prerequisite course code must contain exactly 5 or 6 digits.",
      );
    }
    if (prerequisiteCourseNumbers.includes(nextCode)) {
      throw new Error("This prerequisite course code is already added.");
    }

    const courseExists = allCourses.some(
      (course) => course.courseId === nextCode,
    );

    if (!courseExists) {
      setPendingPrerequisite(nextCode);
      setInvalidPrereqWarning(nextCode);
    } else {
      setPrerequisiteCourseNumbers((prev) => [...prev, nextCode]);
      setPrerequisiteInput("");
    }
  };

  // Handlers for confirming or canceling the addition of a prerequisite that doesn't exist in the system
  const confirmAddPrerequisiteWithWarning = () => {
    if (pendingPrerequisite) {
      setPrerequisiteCourseNumbers((prev) => [...prev, pendingPrerequisite]);
      setPrerequisiteInput("");
    }
    setInvalidPrereqWarning(null);
    setPendingPrerequisite(null);
  };

  // Handlers for confirming or canceling the addition of a course with a duplicate code
  const cancelAddPrerequisite = () => {
    setInvalidPrereqWarning(null);
    setPendingPrerequisite(null);
  };

  // Handlers for confirming or canceling the replacement of an existing course with a duplicate code
  const confirmDuplicateCourse = () => {
    if (pendingCourse) {
      onSave(pendingCourse);
      resetForm();
    }
    setDuplicateCourseWarning(null);
    setPendingCourse(null);
  };

  // Handler for canceling the replacement of an existing course with a duplicate code
  const cancelDuplicateCourse = () => {
    setDuplicateCourseWarning(null);
    setPendingCourse(null);
  };

  /* Handler for enabling manual credits editing. Shows a warning modal before allowing the user to edit credits manually, since it will turn off automatic credits calculation based on hours. */
  const enableManualCreditsEdit = () => {
    setCreditsEditWarningOpen(true);
  };

  const confirmManualCreditsEdit = () => {
    setIsCreditsEditable(true);
    setCreditsEditWarningOpen(false);
  };

  const cancelManualCreditsEdit = () => {
    setCreditsEditWarningOpen(false);
  };

  const handleRemovePrerequisite = (codeToRemove) => {
    setPrerequisiteCourseNumbers((prev) =>
      prev.filter((code) => code !== codeToRemove),
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      if (clusterName.trim() === "") {
        throw new Error("Please select a cluster or semester.");
      }

      // convert the selected cluster name to its corresponding number using the mappings, for saving in the database. The cluster name is what the user sees and selects, while the number is what we store in the backend for consistency and easier querying. This way we maintain a clear separation between user-friendly display values and internal identifiers.
      const resolvedCluster = clusterMappings.nameToNum[clusterName.trim()];

      if (resolvedCluster == null) {
        throw new Error("Please choose a valid cluster name from the list.");
      }

      // Validate and normalize course code
      const normalizedCourseCode = courseCode.trim();
      if (!validateCourseCode(normalizedCourseCode)) {
        throw new Error("Course code must contain exactly 5 or 6 digits.");
      }

      if (prerequisiteInput.trim() !== "") {
        throw new Error(
          "Please click + to add the prerequisite code before saving.",
        );
      }

      // Validate that all prerequisite codes are valid
      const course = {
        cluster: resolvedCluster,
        courseId: normalizedCourseCode,
        courseName: courseName.trim(),
        prerequisiteCourseNumber: prerequisiteCourseNumbers.join(","),
        lectureHours: toNonNegativeInt(lectureHours, "lecture hours"),
        tutorialHours: toNonNegativeInt(tutorialHours, "tutorial hours"),
        labHours: toNonNegativeInt(labHours, "lab hours"),
        projectHours: toNonNegativeInt(projectHours, "project hours"),
        credits: toNonNegativeFloat(credits, "credits"),
        clusterName: clusterName.trim(), // <--- השם של האשכול (סמסטר 1, מדעים וכו')
      };

      // When saving, check if a course with the same code already exists. If we're editing an existing course, allow saving if the code is unchanged or if it doesn't belong to another course. But if the code belongs to a different existing course, show a warning before allowing the user to replace it.
      const isEditing = Boolean(initialCourse);
      const courseAlreadyExists = allCourses.some(
        (course) => course.courseId === normalizedCourseCode,
      );

      if (courseAlreadyExists) {
        if (isEditing && initialCourse.courseId === normalizedCourseCode) {
          onSave(course);
          resetForm();
        } else {
          setPendingCourse(course);
          setDuplicateCourseWarning(normalizedCourseCode);
        }
      } else {
        onSave(course);
        resetForm();
      }
    } catch (err) {
      showError(err.message || "Please enter valid values.");
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Show warning modals if there are any warnings to display, before showing the main form modal. This way we ensure that the user addresses the warnings first before proceeding with editing or adding a course.
  if (duplicateCourseWarning) {
    return (
      <Modal
        isOpen={true}
        onClose={cancelDuplicateCourse}
        title="⚠️ Course Code Already Exists"
        variant="warning"
        footer={
          <>
            <Button variant="ghost" onClick={cancelDuplicateCourse}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmDuplicateCourse}>
              Replace
            </Button>
          </>
        }
      >
        <p>
          A course with code <strong>{duplicateCourseWarning}</strong> already
          exists. Replace it?
        </p>
      </Modal>
    );
  }

  // Show warning modal if the user tries to add a prerequisite course code that doesn't exist in the system, asking them to confirm if they want to add it anyway.
  if (invalidPrereqWarning) {
    return (
      <Modal
        isOpen={true}
        onClose={cancelAddPrerequisite}
        title="⚠️ Prerequisite Not Found"
        variant="warning"
        footer={
          <>
            <Button variant="ghost" onClick={cancelAddPrerequisite}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmAddPrerequisiteWithWarning}
            >
              Add Anyway
            </Button>
          </>
        }
      >
        <p>
          The prerequisite course <strong>{invalidPrereqWarning}</strong>{" "}
          doesn't exist. Add anyway?
        </p>
      </Modal>
    );
  }

  // Show warning modal if the user tries to enable manual credits editing, since it will turn off automatic credits calculation based on hours.
  if (creditsEditWarningOpen) {
    return (
      <Modal
        isOpen={true}
        onClose={cancelManualCreditsEdit}
        title="⚠️ Edit Credits Manually?"
        variant="warning"
        footer={
          <>
            <Button variant="ghost" onClick={cancelManualCreditsEdit}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmManualCreditsEdit}>
              Yes, Edit Manually
            </Button>
          </>
        }
      >
        <p>Automatic credits calculation will be turned off. Are you sure?</p>
      </Modal>
    );
  }

  // Main form modal content
  const footerContent = (
    <>
      <Button type="button" variant="ghost" onClick={handleClose}>
        Cancel
      </Button>
      <Button type="submit" variant="primary" onClick={handleSubmit}>
        Save Course
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={initialCourse ? "Edit Course" : "Add Course"}
      size="wide"
      footer={footerContent}
    >
      <form className="add-course-form" onSubmit={handleSubmit}>
        <div className="add-course-grid">
          {/* one simple field for selecting the cluster/semester */}
          <div className="form-field">
            <label>Cluster / Semester</label>
            <select
              className="ui-input"
              value={clusterName}
              onChange={(e) => setClusterName(e.target.value)}
              required
            >
              <option value="">Select a cluster or semester</option>
              {clusterMappings.clusterNames.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/*empty field to keep the grid layout consistent, or we could choose to remove it and adjust the grid styling accordingly */}
          <div></div>

          <div className="form-field">
            <label>Course Code</label>
            <input
              className="ui-input"
              value={courseCode}
              onChange={(e) =>
                setCourseCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              inputMode="numeric"
              pattern="[0-9]{5,6}"
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
                onChange={(e) =>
                  setPrerequisiteInput(
                    e.target.value.replace(/\D/g, "").slice(0, 6),
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    try {
                      handleAddPrerequisite();
                    } catch (err) {
                      showError(err.message);
                    }
                  }
                }}
                placeholder="5 or 6-digit code"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  try {
                    handleAddPrerequisite();
                  } catch (err) {
                    showError(err.message);
                  }
                }}
              >
                +
              </Button>
            </div>
            {/* Display added prerequisite course codes as chips with remove buttons */}
            {prerequisiteCourseNumbers.length > 0 && (
              <div className="prereq-chips">
                {prerequisiteCourseNumbers.map((code) => (
                  <div key={code} className="prereq-chip">
                    <span>{code}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePrerequisite(code)}
                      className="prereq-chip-remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Separate fields for lecture, tutorial, lab, and project hours, to allow more flexible credit calculation and better reflect the actual course structure. The user can enter 0 for any type of hours that doesn't apply to the course. */}
          <div className="form-field">
            <label>Lecture Hours</label>
            <input
              className="ui-input"
              value={lectureHours}
              onChange={(e) => setLectureHours(keepDigitsOnly(e.target.value))}
              required
            />
          </div>

          <div className="form-field">
            <label>Tutorial Hours</label>
            <input
              className="ui-input"
              value={tutorialHours}
              onChange={(e) => setTutorialHours(keepDigitsOnly(e.target.value))}
              required
            />
          </div>

          <div className="form-field">
            <label>Lab Hours</label>
            <input
              className="ui-input"
              value={labHours}
              onChange={(e) => setLabHours(keepDigitsOnly(e.target.value))}
              required
            />
          </div>

          <div className="form-field">
            <label>Project Hours</label>
            <input
              className="ui-input"
              value={projectHours}
              onChange={(e) => setProjectHours(keepDigitsOnly(e.target.value))}
              required
            />
          </div>

          {/* Credits field is automatically calculated based on hours, but can be manually edited if the user clicks the edit button. When manually editing credits, a warning modal is shown to inform the user that automatic calculation will be turned off. */}
          <div className="form-field">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              Credits
              {!isCreditsEditable && (
                <button
                  type="button"
                  onClick={enableManualCreditsEdit}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "#4f46e5",
                    display: "inline-flex",
                    padding: 0,
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 18 }}>
                    edit
                  </span>
                </button>
              )}
            </label>
            <input
              className="ui-input"
              value={credits}
              readOnly={!isCreditsEditable}
              onChange={(e) =>
                setCredits(e.target.value.replace(/[^\d.]/g, ""))
              }
              required
            />
          </div>
        </div>
      </form>

      <Toast toast={toast} onClose={closeToast} />
    </Modal>
  );
}
