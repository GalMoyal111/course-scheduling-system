import React, { useState } from "react";
import Button from "./ui/Button";
import "./ui/ui.css";

// Simple modal for adding a single course (uses app UI styles).
export default function AddCourseModal({ isOpen, onClose, onSave }) {
  const [semesterNumber, setSemesterNumber] = useState("");
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

  if (!isOpen) return null;

  const resetForm = () => {
    setSemesterNumber("");
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
      const course = {
        semesterNumber: semesterNumber.trim(),
        courseCode: courseCode.trim(),
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
          <h3>Add Course</h3>
        </div>

        <div className="modal-body">
          <form className="add-course-form" onSubmit={handleSubmit}>
            <div className="add-course-grid">
            <div className="form-field">
              <label>Semester Number</label>
              <input
                className="ui-input"
                value={semesterNumber}
                onChange={(e) => setSemesterNumber(e.target.value)}
                required
              />
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
              <input
                className="ui-input"
                value={clusterName}
                onChange={(e) => setClusterName(e.target.value)}
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
