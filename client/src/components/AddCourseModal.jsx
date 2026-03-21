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
export default function AddCourseModal({ isOpen, onClose, onSave, initialCourse = null }) {
  const [cluster, setCluster] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [prerequisiteCourseNumberOrConditions, setPrerequisiteCourseNumberOrConditions] = useState("");
  const [lectureHours, setLectureHours] = useState("");
  const [tutorialHours, setTutorialHours] = useState("");
  const [labHours, setLabHours] = useState("");
  const [projectHours, setProjectHours] = useState("");
  const [credits, setCredits] = useState("");
  const [notes, setNotes] = useState("");
  const [clusterName, setClusterName] = useState("");
  const isSemesterDisabled = clusterName !== "" && cluster === "";
  const isClusterNameDisabled = cluster !== "" && clusterName === "";

  const resetForm = () => {
    setCluster("");
    setCourseCode("");
    setCourseName("");
    setPrerequisiteCourseNumberOrConditions("");
    setLectureHours("");
    setTutorialHours("");
    setLabHours("");
    setProjectHours("");
    setCredits("");
    setNotes("");
    setClusterName("");
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
      const inferredClusterName = Number.isFinite(initialClusterAsNumber)
        ? CLUSTER_NUMBER_TO_NAME[initialClusterAsNumber]
        : "";

      const resolvedClusterName = initialCourse.clusterName || inferredClusterName || "";
      setCluster(resolvedClusterName ? "" : initialClusterValue);
      setCourseCode(initialCourse.courseCode || initialCourse.courseId || "");
      setCourseName(initialCourse.courseName || "");
      setPrerequisiteCourseNumberOrConditions(initialCourse.prerequisiteCourseNumberOrConditions || "");
      setLectureHours(initialCourse.lectureHours != null ? String(initialCourse.lectureHours) : "");
      setTutorialHours(initialCourse.tutorialHours != null ? String(initialCourse.tutorialHours) : "");
      setLabHours(initialCourse.labHours != null ? String(initialCourse.labHours) : "");
      setProjectHours(initialCourse.projectHours != null ? String(initialCourse.projectHours) : "");
      setCredits(initialCourse.credits != null ? String(initialCourse.credits) : "");
      setNotes(initialCourse.notes || "");
      setClusterName(resolvedClusterName);
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

      const course = {
        cluster: resolvedCluster,
        courseId: courseCode.trim(),
        // courseCode: courseCode.trim(),
        courseName: courseName.trim(),
        prerequisiteCourseNumberOrConditions: prerequisiteCourseNumberOrConditions.trim(),
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
              <label>Course Code</label>
              <input
                className="ui-input"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
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
              <label>Prerequisites / Conditions</label>
              <input
                className="ui-input"
                value={prerequisiteCourseNumberOrConditions}
                onChange={(e) => setPrerequisiteCourseNumberOrConditions(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Lecture Hours</label>
              <input
                className="ui-input"
                value={lectureHours}
                onChange={(e) => setLectureHours(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Tutorial Hours</label>
              <input
                className="ui-input"
                value={tutorialHours}
                onChange={(e) => setTutorialHours(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Lab Hours</label>
              <input
                className="ui-input"
                value={labHours}
                onChange={(e) => setLabHours(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Project Hours</label>
              <input
                className="ui-input"
                value={projectHours}
                onChange={(e) => setProjectHours(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Credits</label>
              <input
                className="ui-input"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Notes</label>
              <input
                className="ui-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
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
