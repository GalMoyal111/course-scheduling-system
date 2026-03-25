import React, { useState, useEffect } from "react";
import Button from "./ui/Button";
import "./ui/ui.css";
import { getAllCoursesGrouped } from "../services/api";

export default function AddLessonModal({
  isOpen,
  onClose,
  onSave,
  initialLesson = null,
  mode = "add",
}) {
  const isEdit = mode === "edit";

  const [courseName, setCourseName] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [cluster, setCluster] = useState("");
  const [type, setType] = useState("lecture");
  const [semester, setSemester] = useState("");
  const [groupedCourses, setGroupedCourses] = useState([]);

  // load courses
  useEffect(() => {
    if (!isOpen) return;

    getAllCoursesGrouped()
      .then((data) => {
        setGroupedCourses(data || []);
      })
      .catch(() => setGroupedCourses([]));
  }, [isOpen]);

  // init state
  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && initialLesson && groupedCourses.length > 0) {
      const allCourses = groupedCourses.flatMap(c => c.courses);

      const course = allCourses.find(
        c => c.courseId === initialLesson.courseId
      );

      const clusterObj = groupedCourses.find(
        c => c.courses.some(courseItem => courseItem.courseId === course?.courseId)
      );

      setCluster(clusterObj ? clusterObj.clusterName : "");

      setCluster(clusterObj ? clusterObj.clusterName : "");
      setCourseName(initialLesson.courseName || "");
      setLecturer(initialLesson.lecturer || "");
      setType(initialLesson.type?.toLowerCase() || "lecture");
      setSemester(initialLesson.semester || "");
    }

    if (!isEdit) {
      setCourseName("");
      setLecturer("");
      setCluster("");
      setType("lecture");
      setSemester("");
    }
  }, [isOpen, isEdit, initialLesson, groupedCourses]);

  const allCourses = groupedCourses.flatMap((c) => c.courses);

  const clusterOptions = groupedCourses.map((c) => c.clusterName);

  const selectedClusterObj = groupedCourses.find(
    (c) => c.clusterName === cluster
  );

  const courseOptions = selectedClusterObj
    ? selectedClusterObj.courses
    : [];

  const selectedCourse =
    allCourses.find((c) => c.courseId === initialLesson?.courseId) ||
    allCourses.find((c) => c.courseName === courseName);

  const computedDuration = (() => {
    if (!selectedCourse) return "";
    let duration;
    switch (type) {
      case "lecture":
        duration = selectedCourse.lectureHours || 0;
        break;
      case "practice":
        duration = selectedCourse.tutorialHours || 0;
        break;
      case "laboratory":
        duration = selectedCourse.labHours || 0;
        break;
      case "pbl":
        duration = selectedCourse.projectHours || 0;
        break;
      default:
        duration = 1;
    }
    if (isEdit && duration === 4) {
      return 2;
    }

  return duration;
  })();

  if (!isOpen) return null;

  const mapType = (type) => {
    switch (type) {
      case "lecture":
        return "LECTURE";
      case "practice":
        return "TUTORIAL";
      case "laboratory":
        return "LAB";
      case "pbl":
        return "PBL";
      default:
        return "LECTURE";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedCourse) {
      alert("Course not found");
      return;
    }

    const payload = {
    ...(initialLesson || {}), 

      courseId: selectedCourse.courseId,
      courseName: selectedCourse.courseName,
      lecturer: lecturer.trim(),
      cluster:
        selectedClusterObj?.clusterId ??
        initialLesson?.cluster ??
        0,
      type: mapType(type),
      duration: parseInt(computedDuration || 1, 10),
      semester: semester === "Summer" ? "SUMMER" : semester,
    };

    onSave(initialLesson, payload);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-card--wide">
        <div className="modal-header">
          <h3>{isEdit ? "Edit Lesson" : "Add Lesson"}</h3>
        </div>

        <div className="modal-body">
          <form className="add-course-form" onSubmit={handleSubmit}>
            <div className="add-course-grid">

              <div className="form-field">
                <label>Cluster</label>
                <select
                  className="ui-select"
                  value={cluster}
                  disabled={isEdit}
                  onChange={(e) => {
                    if (isEdit) return;
                    setCluster(e.target.value);
                    setCourseName("");
                  }}
                >
                  <option value="">(none)</option>         
                    {isEdit && cluster && (
                      <option value={cluster}>{cluster}</option>
                    )}

                    {clusterOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Course</label>
                <select
                  className="ui-select"
                  value={courseName}
                  disabled={isEdit}
                  onChange={(e) => {
                    if (isEdit) return;
                    setCourseName(e.target.value);
                  }}
                >
                <option value="">(select)</option>
                  {isEdit && courseName && (
                  <option value={courseName}>{courseName}</option>
                    )}

                    {courseOptions.map((c) => (
                    <option key={c.courseId} value={c.courseName}>
                      {c.courseName}
                  </option>
                ))}
                </select>
              </div>

              <div className="form-field">
                <label>Lecturer</label>
                <input
                  className="ui-input"
                  value={lecturer}
                  onChange={(e) => setLecturer(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Type</label>
                <select
                  className="ui-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="lecture">Lecture</option>
                  <option value="practice">Practice</option>
                  <option value="laboratory">Laboratory</option>
                  <option value="pbl">PBL</option>
                </select>
              </div>

              <div className="form-field">
                <label>Duration</label>
                <input
                  className="ui-input"
                  type="number"
                  value={computedDuration}
                  readOnly
                />
              </div>

              <div className="form-field">
                <label>Semester</label>
                <select
                  className="ui-select"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                >
                  <option value="">(select)</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>

            </div>

            <div className="modal-actions">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}