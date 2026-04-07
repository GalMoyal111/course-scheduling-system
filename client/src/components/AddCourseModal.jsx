import React, { useState } from "react";
import Button from "./ui/Button";
import "./ui/ui.css";
import Modal from "./ui/Modal";
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
  const [isCreditsEditable, setIsCreditsEditable] = useState(false);
  const [notes, setNotes] = useState("");
  const [clusterName, setClusterName] = useState("");
  const [invalidPrereqWarning, setInvalidPrereqWarning] = useState(null);
  const [pendingPrerequisite, setPendingPrerequisite] = useState(null);
  const [duplicateCourseWarning, setDuplicateCourseWarning] = useState(null);
  const [pendingCourse, setPendingCourse] = useState(null);
  const [creditsEditWarningOpen, setCreditsEditWarningOpen] = useState(false);
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
    setIsCreditsEditable(false);
    setNotes("");
    setClusterName("");
    setInvalidPrereqWarning(null);
    setPendingPrerequisite(null);
    setDuplicateCourseWarning(null);
    setPendingCourse(null);
    setCreditsEditWarningOpen(false);
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
      setIsCreditsEditable(false);
      setNotes(initialCourse.notes || "");
    } else {
      resetForm();
    }
  }, [isOpen, initialCourse]);

  React.useEffect(() => {
    if (isCreditsEditable) {
      return;
    }

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

  const isEditing = Boolean(initialCourse);

  const toNonNegativeInt = (value, fieldName) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0) {
      throw new Error(`Please enter a valid non-negative number for ${fieldName}.`);
    }
    return parsed;
  };

  const toNonNegativeFloat = (value, fieldName) => {
    const parsed = parseFloat(value);
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

  const confirmDuplicateCourse = () => {
    if (pendingCourse) {
      onSave(pendingCourse);
      resetForm();
    }
    setDuplicateCourseWarning(null);
    setPendingCourse(null);
  };

  const cancelDuplicateCourse = () => {
    setDuplicateCourseWarning(null);
    setPendingCourse(null);
  };

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
        credits: toNonNegativeFloat(credits, "credits"),
        notes: notes.trim(),
        clusterName: clusterName.trim(),
      };

      // Check if course code already exists
      const isEditing = Boolean(initialCourse);
      const courseAlreadyExists = allCourses.some(course => course.courseId === normalizedCourseCode);

      if (courseAlreadyExists) {
        // If editing and it's the same course (same ID as original), allow it
        if (isEditing && initialCourse.courseId === normalizedCourseCode) {
          // It's the same course being edited, allow submission
          onSave(course);
          resetForm();
        } else {
          // It's a duplicate - show warning
          setPendingCourse(course);
          setDuplicateCourseWarning(normalizedCourseCode);
        }
      } else {
        // No duplicate, proceed normally
        onSave(course);
        resetForm();
      }
    } catch (err) {
      alert(err.message || "Please enter valid values.");
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  if (duplicateCourseWarning) {
    return (
      <Modal isOpen={true} onClose={cancelDuplicateCourse} title="⚠️ Course Code Already Exists" variant="warning"
        footer={<><Button variant="ghost" onClick={cancelDuplicateCourse}>Cancel</Button><Button variant="primary" onClick={confirmDuplicateCourse}>Replace</Button></>}>
        <p>A course with code <strong>{duplicateCourseWarning}</strong> already exists. Replace it?</p>
      </Modal>
    );
  }

  if (invalidPrereqWarning) {
    return (
      <Modal isOpen={true} onClose={cancelAddPrerequisite} title="⚠️ Prerequisite Not Found" variant="warning"
        footer={<><Button variant="ghost" onClick={cancelAddPrerequisite}>Cancel</Button><Button variant="primary" onClick={confirmAddPrerequisiteWithWarning}>Add Anyway</Button></>}>
        <p>The prerequisite course <strong>{invalidPrereqWarning}</strong> doesn't exist. Add anyway?</p>
      </Modal>
    );
  }

  if (creditsEditWarningOpen) {
    return (
      <Modal isOpen={true} onClose={cancelManualCreditsEdit} title="⚠️ Edit Credits Manually?" variant="warning"
        footer={<><Button variant="ghost" onClick={cancelManualCreditsEdit}>Cancel</Button><Button variant="primary" onClick={confirmManualCreditsEdit}>Yes, Edit Manually</Button></>}>
        <p>Automatic credits calculation will be turned off. Are you sure?</p>
      </Modal>
    );
  }

const footerContent = (
    <>
      <Button type="button" variant="ghost" onClick={onClose}>
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
          <div className="form-field">
            <label>Semester</label>
            <select className="ui-input" value={cluster} onChange={(e) => { const val = e.target.value; setCluster(val); if (val !== "") setClusterName(""); }} disabled={isSemesterDisabled}>
              <option value="">{isSemesterDisabled ? "NOT AVAILABLE" : "Select a semester"}</option>
              {SemesterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="form-field">
            <label>Cluster Name</label>
            <select className="ui-input" value={clusterName} onChange={(e) => { const val = e.target.value; setClusterName(val); if (val !== "") setCluster(""); }} disabled={isClusterNameDisabled}>
              <option value="">{isClusterNameDisabled ? "NOT AVAILABLE" : "Select cluster name"}</option>
              {CLUSTER_NAME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="form-field">
            <label>Course Code</label>
            <input className="ui-input" value={courseCode} onChange={(e) => setCourseCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" pattern="[0-9]{5,6}" required />
          </div>

          <div className="form-field">
            <label>Course Name</label>
            <input className="ui-input" value={courseName} onChange={(e) => setCourseName(e.target.value)} required />
          </div>

          <div className="form-field">
            <label>Prerequisites</label>
            <div className="prereq-input-row">
              <input
                className="ui-input"
                value={prerequisiteInput}
                onChange={(e) => setPrerequisiteInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); try { handleAddPrerequisite(); } catch (err) { alert(err.message); } } }}
                placeholder="5 or 6-digit code"
              />
              <Button type="button" variant="ghost" onClick={() => { try { handleAddPrerequisite(); } catch (err) { alert(err.message); } }}>
                +
              </Button>
            </div>
            {prerequisiteCourseNumbers.length > 0 && (
              <div className="prereq-chips">
                {prerequisiteCourseNumbers.map((code) => (
                  <div key={code} className="prereq-chip">
                    <span>{code}</span>
                    <button type="button" onClick={() => handleRemovePrerequisite(code)} className="prereq-chip-remove">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-field">
            <label>Lecture Hours</label>
            <input className="ui-input" value={lectureHours} onChange={(e) => setLectureHours(keepDigitsOnly(e.target.value))} required />
          </div>

          <div className="form-field">
            <label>Tutorial Hours</label>
            <input className="ui-input" value={tutorialHours} onChange={(e) => setTutorialHours(keepDigitsOnly(e.target.value))} required />
          </div>

          <div className="form-field">
            <label>Lab Hours</label>
            <input className="ui-input" value={labHours} onChange={(e) => setLabHours(keepDigitsOnly(e.target.value))} required />
          </div>

          <div className="form-field">
            <label>Project Hours</label>
            <input className="ui-input" value={projectHours} onChange={(e) => setProjectHours(keepDigitsOnly(e.target.value))} required />
          </div>

          <div className="form-field">
            <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              Credits
              {!isCreditsEditable && (
                <button type="button" onClick={enableManualCreditsEdit} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#4f46e5", display: "inline-flex", padding: 0 }}>
                  <span className="material-icons" style={{ fontSize: 18 }}>edit</span>
                </button>
              )}
            </label>
            <input className="ui-input" value={credits} readOnly={!isCreditsEditable} onChange={(e) => setCredits(e.target.value.replace(/[^\d.]/g, ""))} required />
          </div>

          <div className="form-field" style={{ gridColumn: 'span 2' }}>
            <label>Notes</label>
            <input className="ui-input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
          </div>
        </div>
      </form>
    </Modal>
  );
}