import React, { useState } from "react";
import Button from "./ui/Button";
import "./ui/ui.css";

export default function AddLessonModal({ isOpen, onClose, onSave, initialLesson = null }) {
  const [courseId, setCourseId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [cluster, setCluster] = useState(""); // leave empty options for now
  const [type, setType] = useState("lecture");
  const [duration, setDuration] = useState("1");
  const [credits, setCredits] = useState("");
  const [semester, setSemester] = useState("");

  React.useEffect(() => {
    if (!isOpen) return;
    if (initialLesson) {
      setCourseId(initialLesson.courseId || "");
      setCourseName(initialLesson.courseName || "");
      setLecturer(initialLesson.lecturer || "");
      setCluster(initialLesson.cluster != null ? String(initialLesson.cluster) : "");
      setType(initialLesson.type || "lecture");
      setDuration(initialLesson.duration != null ? String(initialLesson.duration) : "");
      setCredits(initialLesson.credits != null ? String(initialLesson.credits) : "");
      setSemester(initialLesson.semester != null ? String(initialLesson.semester) : "");
    } else {
      setCourseId("");
      setCourseName("");
      setLecturer("");
      setCluster("");
      setType("lecture");
      setDuration("");
      setCredits("");
      setSemester("");
    }
  }, [isOpen, initialLesson]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!courseId.trim()) return alert("Please enter course ID");
    if (!courseName.trim()) return alert("Please select course name");

    const payload = {
      courseId: courseId.trim(),
      courseName: courseName.trim(),
      lecturer: lecturer.trim(),
      cluster: cluster === "" ? 0 : parseInt(cluster, 10) || 0,
      type: type,
      duration: duration === "" ? 1 : parseInt(duration, 10) || 1,
      semester: semester === "" ? null : semester,
      credits: credits === "" ? 0 : parseFloat(credits) || 0,
      index: 0,
    };

    onSave(payload);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-card--wide" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3>Add Lesson</h3>
        </div>

        <div className="modal-body">
          <form className="add-course-form" onSubmit={handleSubmit}>
            <div className="add-course-grid">
              <div className="form-field">
                <label>Course ID</label>
                <input className="ui-input" value={courseId} onChange={(e) => setCourseId(e.target.value)} />
              </div>

              <div className="form-field">
                <label>Course Name</label>
                <input className="ui-input" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
              </div>

              <div className="form-field">
                <label>Lecturer</label>
                <input className="ui-input" value={lecturer} onChange={(e) => setLecturer(e.target.value)} />
              </div>

              <div className="form-field">
                <label>Cluster</label>
                <select className="ui-select" value={cluster} onChange={(e) => setCluster(e.target.value)}>
                  <option value="">(none)</option>
                  <option value="Semester 1">סמסטר 1</option>
                  <option value="Semester 2">סמסטר 2</option>
                  <option value="Semester 3">סמסטר 3</option>
                  <option value="Semester 4">סמסטר 4</option>
                  <option value="Semester 5">סמסטר 5</option>
                  <option value="Semester 6">סמסטר 6</option>
                  <option value="Semester 7">סמסטר 7</option>
                  <option value="Semester 8">סמסטר 8</option>
                  <option value="9">אשכול מדעים</option>
                  <option value="10">אשכול עיבוד אותות ורשתות תקשורת</option>
                  <option value="11">אשכול אלגוריתמים</option>
                  <option value="12">אשכול סמינרים</option>
                  <option value="13">אשכול הנדסת תוכנה</option>
                  <option value="14">אשכול מעבדות</option>
                </select>
              </div>

              <div className="form-field">
                <label>Type</label>
                <select className="ui-select" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="lecture">Lecture</option>
                  <option value="practice">Practice</option>
                  <option value="laboratory">Laboratory</option>
                  <option value="pbl">PBL</option>
                </select>
              </div>

              <div className="form-field">
                <label>Duration</label>
                <input className="ui-input" type="number" value={duration} min="1" onChange={(e) => setDuration(e.target.value)} />
              </div>

              <div className="form-field">
                <label>Credits</label>
                <input className="ui-input" type="number" value={credits} min="0" step="0.5" onChange={(e) => setCredits(e.target.value)} />
              </div>

              <div className="form-field">
                <label>Semester</label>
                <select className="ui-select" value={semester} onChange={(e) => setSemester(e.target.value)}>
                  <option value="">(select)</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary">Save</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
