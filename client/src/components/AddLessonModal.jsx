import React, { useState, useEffect, useMemo } from "react";
import Button from "./ui/Button";
import "./ui/ui.css";
import { useData } from "../context/DataContext"; // שימוש ב-Context
import { getAllLecturers, getAllCourses } from "../services/api"; // רק לגיבוי
import Modal from "./ui/Modal";

export default function AddLessonModal({
  isOpen,
  onClose,
  onSave,
  initialLesson = null,
  mode = "add",
}) {
  const isEdit = mode === "edit";

  // שימוש ב-Context לביצועים
  const { 
    courses, setCourses, coursesTimestamp,
    lecturers, setLecturers, lecturersTimestamp, 
    isCacheValid, setCoursesTimestamp, setLecturersTimestamp 
  } = useData();

  const [courseName, setCourseName] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [cluster, setCluster] = useState("");
  const [type, setType] = useState("lecture");
  const [semester, setSemester] = useState("");

  // 1. טעינת נתונים ל-Context (במקום טעינה מקומית כל פעם)
  useEffect(() => {
    if (!isOpen) return;

    if (courses.length === 0 || !isCacheValid(coursesTimestamp)) {
      getAllCourses().then(data => {
        setCourses(data || []);
        setCoursesTimestamp(Date.now());
      });
    }

    if (lecturers.length === 0 || !isCacheValid(lecturersTimestamp)) {
      getAllLecturers().then(data => {
        setLecturers(data || []);
        setLecturersTimestamp(Date.now());
      });
    }
  }, [isOpen]);

  // 2. קיבוץ הקורסים לפי אשכולות (Grouping) - מתבצע מקומית מה-Context
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

  // איתחול הסטייט (כמו בקוד המקורי שלך)
  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && initialLesson && groupedCourses.length > 0) {
      const allCourses = groupedCourses.flatMap(c => c.courses);
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
  }, [isOpen, isEdit, initialLesson, groupedCourses]);

  const allCourses = groupedCourses.flatMap((c) => c.courses);

  // מיון האשכולות לפי סדר סמסטרים (כמו שביקשת)
  const clusterOptions = useMemo(() => {
    const getSemesterNumber = (str) => {
      const match = str.match(/סמסטר\s*(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    };

    return groupedCourses.map((c) => c.clusterName).filter(Boolean).sort((a, b) => {
      const aSem = getSemesterNumber(a);
      const bSem = getSemesterNumber(b);
      if (aSem !== null && bSem !== null) return aSem - bSem;
      if (aSem !== null) return -1;
      if (bSem !== null) return 1;
      return a.localeCompare(b);
    });
  }, [groupedCourses]);

  const selectedClusterObj = groupedCourses.find((c) => c.clusterName === cluster);
  const courseOptions = selectedClusterObj ? selectedClusterObj.courses : [];
  const selectedCourse = allCourses.find((c) => c.courseId === initialLesson?.courseId) ||
                         allCourses.find((c) => c.courseName === courseName);

  // לוגיקת מעבדות אוטומטית (כמו במקור)
  useEffect(() => {
    if (selectedCourse && !isEdit) {
      if (selectedCourse.courseId === "61181") setType("physics_laboratory");
      else if (selectedCourse.courseId === "61765") setType("networking_laboratory");
    }
  }, [selectedCourse, isEdit]);

  // חישוב שעות (כמו במקור)
  const computedDuration = (() => {
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
  })();

  const mapType = (type) => {
    const types = { lecture: "LECTURE", practice: "TUTORIAL", laboratory: "LAB", physics_laboratory: "PHYSICS_LAB", networking_laboratory: "NETWORKING_LAB", pbl: "PBL" };
    return types[type] || "LECTURE";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      alert("Please select a course.");
      return;
    }
    if (!lecturer || lecturer.trim() === "") {
      alert("Please select a lecturer.");
      return;
    }
    if (!semester) {
      alert("Please select a semester.");
      return;
    }
    if (!type) {
      alert("Please select a lesson type.");
      return;
    }

    const payload = {
      ...(initialLesson || {}), 
      courseId: selectedCourse.courseId,
      courseName: selectedCourse.courseName,
      lecturer: lecturer.trim(),
      cluster: selectedClusterObj?.clusterId ?? initialLesson?.cluster ?? 0,
      type: mapType(type),
      duration: parseInt(computedDuration || 1, 10),
      semester: semester === "Summer" ? "SUMMER" : semester,
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
            <select className="ui-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="lecture">Lecture</option>
              <option value="practice">Practice</option>
              <option value="laboratory">Laboratory</option>
              <option value="physics_laboratory">Physics Laboratory</option>
              <option value="networking_laboratory">Networking Laboratory</option>
              <option value="pbl">PBL</option>
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