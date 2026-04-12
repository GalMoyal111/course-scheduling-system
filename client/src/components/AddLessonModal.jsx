import React, { useState, useEffect, useMemo } from "react";
import Button from "./ui/Button";
import "./ui/ui.css";
import { useData } from "../context/DataContext"; // שימוש ב-Context
import Modal from "./ui/Modal";

const TYPE_TO_HOUR_FIELD = {
    lecture: "lectureHours",
    practice: "tutorialHours",
    laboratory: "labHours",
    physics_laboratory: "labHours",
    networking_laboratory: "labHours",
    pbl: "projectHours",
  };

export default function AddLessonModal({
  isOpen,
  onClose,
  onSave,
  initialLesson = null,
  mode = "add",
}) {
  const isEdit = mode === "edit";

  const { 
  courses, 
  lecturers, 
  fetchCoursesIfNeeded,
  fetchLecturersIfNeeded 
} = useData();

  const [courseName, setCourseName] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [cluster, setCluster] = useState("");
  const [type, setType] = useState("lecture");
  const [semester, setSemester] = useState("");


  const groupedCourses = useMemo(() => {
    const groups = {};
    courses.forEach(course => {
      const cName = course.clusterName || "אחר";
      if (!groups[cName]) {
        groups[cName] = { clusterName: cName, clusterId: course.cluster, courses: [] };
      }
      groups[cName].courses.push(course);
    });
    return Object.values(groups);
  }, [courses]);

  const allCourses = useMemo(() => groupedCourses.flatMap((c) => c.courses), [groupedCourses]);

  const selectedCourse = useMemo(() => {
    return allCourses.find((c) => c.courseId === initialLesson?.courseId) ||
           allCourses.find((c) => c.courseName === courseName);
  }, [allCourses, initialLesson, courseName]);


  const availableTypes = useMemo(() => {
    if (!selectedCourse) return [];

    const types = [
      { value: "lecture", label: "Lecture" },
      { value: "practice", label: "Practice" },
      { value: "laboratory", label: "Laboratory" },
      { value: "physics_laboratory", label: "Physics Laboratory" },
      { value: "networking_laboratory", label: "Networking Laboratory" },
      { value: "pbl", label: "PBL" },
    ];

    return types.filter(t => {
      const hourField = TYPE_TO_HOUR_FIELD[t.value];
      return (selectedCourse[hourField] || 0) > 0;
    });
  }, [selectedCourse]);


  useEffect(() => {
    if (isOpen) {
      fetchCoursesIfNeeded("AddLessonModal");
      fetchLecturersIfNeeded("AddLessonModal");
    }
  }, [isOpen, fetchCoursesIfNeeded, fetchLecturersIfNeeded]);


  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && initialLesson && groupedCourses.length > 0) {
      const course = allCourses.find(c => c.courseId === initialLesson.courseId);
      const clusterObj = groupedCourses.find(c => c.courses.some(item => item.courseId === course?.courseId));

      setCluster(clusterObj ? clusterObj.clusterName : "");
      setCourseName(initialLesson.courseName || "");
      setLecturer(initialLesson.lecturer || "");
      
      const rawType = initialLesson.type;
      if (rawType === "PHYSICS_LAB") setType("physics_laboratory");
      else if (rawType === "NETWORKING_LAB") setType("networking_laboratory");
      else if (rawType === "LAB") setType("laboratory");
      else setType(rawType?.toLowerCase() || "lecture");
      
      setSemester(initialLesson.semester || "");
    }

    if (!isEdit) {
      setCourseName("");
      setLecturer("");
      setCluster("");
      setType("lecture");
      setSemester("");
    }
  }, [isOpen, isEdit, initialLesson, groupedCourses, allCourses]);


  useEffect(() => {
    if (selectedCourse && !isEdit) {
      const isCurrentTypeValid = availableTypes.some(t => t.value === type);
      if (!isCurrentTypeValid && availableTypes.length > 0) {
        setType(availableTypes[0].value);
      }
    }
  }, [selectedCourse, availableTypes, type, isEdit]);


  useEffect(() => {
    if (selectedCourse && !isEdit) {
      if (selectedCourse.courseId === "61181") setType("physics_laboratory");
      else if (selectedCourse.courseId === "61765") setType("networking_laboratory");
    }
  }, [selectedCourse, isEdit]);

  const clusterOptions = useMemo(() => {
    const getSemesterNum = (str) => {
      if (!str) return 999;
      const cleanStr = String(str).replace("סמסטר", "").trim();
      const num = parseInt(cleanStr, 10);
      return isNaN(num) ? 999 : num; 
    };

    return groupedCourses.map(c => c.clusterName).filter(Boolean).sort((a, b) => {
      const numA = getSemesterNum(a);
      const numB = getSemesterNum(getSemesterNum(b));
      if (numA !== numB) return numA - numB;
      return a.localeCompare(b);
    });
  }, [groupedCourses]);

  const selectedClusterObj = groupedCourses.find((c) => c.clusterName === cluster);
  const courseOptions = selectedClusterObj ? selectedClusterObj.courses : [];

  const computedDuration = useMemo(() => {
    if (!selectedCourse) return "";
    let duration;
    switch (type) {
      case "lecture": duration = selectedCourse.lectureHours || 0; break;
      case "practice": duration = selectedCourse.tutorialHours || 0; break;
      case "laboratory":
      case "physics_laboratory":
      case "networking_laboratory": duration = selectedCourse.labHours || 0; break;
      case "pbl": duration = selectedCourse.projectHours || 0; break;
      default: duration = 1;
    }
    if (isEdit && duration === 4) return 2;
    return duration;
  }, [selectedCourse, type, isEdit]);

  const computedCredits = useMemo(() => {
    if (!computedDuration) return 0;
    const durationNum = parseFloat(computedDuration);
    // הרצאה = 1 ל-1, כל השאר = חצי
    return type === "lecture" ? durationNum : durationNum * 0.5;
  }, [computedDuration, type]);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCourse || !lecturer || !semester || !type) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      ...(initialLesson || {}), 
      courseId: selectedCourse.courseId,
      courseName: selectedCourse.courseName,
      lecturer: lecturer.trim(),
      cluster: selectedClusterObj?.clusterId ?? initialLesson?.cluster ?? 0,
      type: { lecture: "LECTURE", practice: "TUTORIAL", laboratory: "LAB", physics_laboratory: "PHYSICS_LAB", networking_laboratory: "NETWORKING_LAB", pbl: "PBL" }[type] || "LECTURE",
      duration: parseInt(computedDuration || 1, 10),
      semester: semester === "Summer" ? "SUMMER" : semester,
      credits: computedCredits,
    };
    onSave(initialLesson, payload);
  };

  if (!isOpen) return null;


return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Lesson" : "Add New Lesson"} size="wide"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={handleSubmit}>{isEdit ? "Update Lesson" : "Add Lesson"}</Button></>}>
      <form onSubmit={handleSubmit}>
        <div className="add-course-grid">
          <div className="form-field">
            <label>Cluster</label>
            <select className="ui-select" value={cluster} disabled={isEdit} 
                    onChange={(e) => { setCluster(e.target.value); setCourseName(""); }}>
              <option value="">(none)</option>
              {clusterOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-field">
            <label>Course</label>
            <select className="ui-select" value={courseName} disabled={isEdit} 
                    onChange={(e) => setCourseName(e.target.value)}>
              <option value="">(select)</option>
              {courseOptions.map((c) => <option key={c.courseId} value={c.courseName}>{c.courseName}</option>)}
            </select>
          </div>

          <div className="form-field">
            <label>Lecturer</label>
            <select className="ui-select" value={lecturer} onChange={(e) => setLecturer(e.target.value)} required>
              <option value="">(select lecturer)</option>
              {[...lecturers].sort((a,b) => a.name.localeCompare(b.name)).map((lec) => (
                <option key={lec.id} value={lec.name}>{lec.name}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Type</label>
            <select 
              className="ui-select" 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              disabled={availableTypes.length === 0}
            >
              {availableTypes.length === 0 && <option value="">No valid types for this course</option>}
              {availableTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Duration (Hours)</label>
            <input className="ui-input" type="number" value={computedDuration} readOnly style={{ background: "#f1f5f9" }} />
          </div>

          <div className="form-field">
            <label>Semester</label>
            <select className="ui-select" value={semester} onChange={(e) => setSemester(e.target.value)} required>
              <option value="">(select)</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="Summer">Summer</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}