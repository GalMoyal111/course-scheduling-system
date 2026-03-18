import React, { useState } from "react";
import Button from "./ui/Button";
import "./ui/ui.css";

export default function AddLessonModal({ isOpen, onClose, onSave, initialLesson = null, clusters = [], courses = [] }) {
  const [courseName, setCourseName] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [cluster, setCluster] = useState("");
  const [type, setType] = useState("lecture");
  const [duration, setDuration] = useState("1");
  const [semester, setSemester] = useState("");

  React.useEffect(() => {
    if (!isOpen) return;
    if (initialLesson) {
      setCourseName(initialLesson.courseName || "");
      setLecturer(initialLesson.lecturer || "");
      setCluster(initialLesson.cluster != null ? String(initialLesson.cluster) : "");
      setType(initialLesson.type || "lecture");
      setDuration(initialLesson.duration != null ? String(initialLesson.duration) : "");
      setSemester(initialLesson.semester != null ? String(initialLesson.semester) : "");
    } else {
      setCourseName("");
      setLecturer("");
      setCluster("");
      setType("lecture");
      setDuration("");
      setSemester("");
    }
  }, [isOpen, initialLesson]);

  if (!isOpen) return null;

  // Use provided lists if available, otherwise sensible defaults
  const courseOptions = (courses && courses.length) ? courses : ["Stats", "Algorithms", "Deep Learning"];
  const clusterOptions = (clusters && clusters.length) ? clusters : ["Semester 1", "Semester 2", "Semester 3"];

  const handleSubmit = (e) => {
    e.preventDefault();

  // Basic validation
  if (!courseName.trim()) return alert("Please select course name");

    const payload = {
      courseName: courseName.trim(),
      lecturer: lecturer.trim(),
      // send cluster as string (empty or selected value)
      cluster: cluster === "" ? "" : cluster,
      type: type,
      duration: duration === "" ? 1 : parseInt(duration, 10) || 1,
      semester: semester === "" ? null : semester,
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
                <label>Cluster</label>
                <select className="ui-select" value={cluster} onChange={(e) => setCluster(e.target.value)}>
                  <option value="">(none)</option>
                  {clusterOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Course</label>
                <select className="ui-select" value={courseName} onChange={(e) => setCourseName(e.target.value)}>
                  <option value="">(select)</option>
                  {courseOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Lecturer</label>
                <input className="ui-input" value={lecturer} onChange={(e) => setLecturer(e.target.value)} />
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
