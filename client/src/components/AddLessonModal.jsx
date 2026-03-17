import React, { useState } from "react";
import Button from "./ui/Button";
import "./ui/ui.css";

export default function AddLessonModal({ isOpen, onClose, onSave, initialLesson = null }) {
  const [courseId, setCourseId] = useState("");
  const [courseName, setCourseName] = useState("Stats"); // dropdown default
  const [lecturer, setLecturer] = useState("");
  const [cluster, setCluster] = useState(""); // leave empty options for now
  const [type, setType] = useState("lecture");
  const [duration, setDuration] = useState("1");
  const [semester, setSemester] = useState("");

  React.useEffect(() => {
    if (!isOpen) return;
    if (initialLesson) {
      setCourseId(initialLesson.courseId || "");
      setCourseName(initialLesson.courseName || "Stats");
      setLecturer(initialLesson.lecturer || "");
      setCluster(initialLesson.cluster != null ? String(initialLesson.cluster) : "");
      setType(initialLesson.type || "lecture");
      setDuration(initialLesson.duration != null ? String(initialLesson.duration) : "");
      setSemester(initialLesson.semester != null ? String(initialLesson.semester) : "");
    } else {
      setCourseId("");
      setCourseName("Stats");
      setLecturer("");
      setCluster("");
      setType("lecture");
      setDuration("");
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
      credits: 0,
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
                <select className="ui-select" value={courseName} onChange={(e) => setCourseName(e.target.value)}>
                  <option>Stats</option>
                  <option>Algorithms</option>
                  <option>Deep Learning</option>
                </select>
              </div>

              <div className="form-field">
                <label>Lecturer</label>
                <input className="ui-input" value={lecturer} onChange={(e) => setLecturer(e.target.value)} />
              </div>

              <div className="form-field">
                <label>Cluster</label>
                <select className="ui-select" value={cluster} onChange={(e) => setCluster(e.target.value)}>
                  <option value="">(none)</option>
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
