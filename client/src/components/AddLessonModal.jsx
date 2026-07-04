import React, { useState, useEffect, useMemo } from "react";
import Button from "./ui/Button";
import Toast, { useToast } from "./ui/Toast";
import "./ui/ui.css";
import { useData } from "../context/DataContext";
import Modal from "./ui/Modal";

// Mapping of lesson types to their corresponding hour fields in the course data. This is used to determine which hour field to check when validating the selected type for a course.
const TYPE_TO_HOUR_FIELD = {
  lecture: "lectureHours",
  practice: "tutorialHours",
  laboratory: "labHours",
  physics_laboratory: "labHours",
  networking_laboratory: "labHours",
  pbl: "projectHours",
};

// Renders the AddLessonModal component.
export default function AddLessonModal({
  isOpen,
  onClose,
  onSave,
  initialLesson = null,
  mode = "add",
}) {
  const isEdit = mode === "edit";
  const { showError } = useToast();

  const { courses, lecturers, fetchCoursesIfNeeded, fetchLecturersIfNeeded } =
    useData();

  // Local state for form fields. These are initialized based on the initialLesson when in edit mode, or set to defaults when adding a new lesson.
  const [courseName, setCourseName] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [cluster, setCluster] = useState("");
  const [type, setType] = useState("lecture");
  const [semester, setSemester] = useState("");

  // Group courses by their cluster for easier selection in the form.
  const groupedCourses = useMemo(() => {
    const groups = {};
    courses.forEach((course) => {
      const cName = course.clusterName || "אחר";
      if (!groups[cName]) {
        groups[cName] = {
          clusterName: cName,
          clusterId: course.cluster,
          courses: [],
        };
      }
      groups[cName].courses.push(course);
    });
    return Object.values(groups);
  }, [courses]);

  // Flatten the grouped courses into a single array for easier searching when determining the selected course based on the initial lesson or course name.
  const allCourses = useMemo(
    () => groupedCourses.flatMap((c) => c.courses),
    [groupedCourses],
  );

  // Determine the selected course based on the initial lesson's courseId or courseName. This is used to pre-fill the form fields when editing an existing lesson, and to validate the selected type against the available types for that course.
  const selectedCourse = useMemo(() => {
    return (
      allCourses.find((c) => c.courseId === initialLesson?.courseId) ||
      allCourses.find((c) => c.courseName === courseName)
    );
  }, [allCourses, initialLesson, courseName]);

  // Determine the available lesson types for the selected course based on which hour fields have values greater than 0. This is used to populate the "Type" dropdown and to validate the selected type when adding a new lesson.
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

    return types.filter((t) => {
      const hourField = TYPE_TO_HOUR_FIELD[t.value];
      return (selectedCourse[hourField] || 0) > 0;
    });
  }, [selectedCourse]);

  // When the modal opens, fetch courses and lecturers if they haven't been loaded yet. This ensures that the dropdowns are populated with the latest data when the user tries to add or edit a lesson.
  useEffect(() => {
    if (isOpen) {
      fetchCoursesIfNeeded("AddLessonModal");
      fetchLecturersIfNeeded("AddLessonModal");
    }
  }, [isOpen, fetchCoursesIfNeeded, fetchLecturersIfNeeded]);

  // When the modal opens, if we're in edit mode and have an initial lesson, pre-fill the form fields based on the initial lesson's data. If we're in add mode, reset the form fields to their default values.
  useEffect(() => {
    if (!isOpen) return;

    // In edit mode, pre-fill form fields based on the initial lesson's data. This includes determining the cluster based on the course's cluster, and mapping the lesson type to the corresponding form value.
    if (isEdit && initialLesson && groupedCourses.length > 0) {
      const course = allCourses.find(
        (c) => c.courseId === initialLesson.courseId,
      );
      const clusterObj = groupedCourses.find((c) =>
        c.courses.some((item) => item.courseId === course?.courseId),
      );

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

  // If the selected course changes (e.g. when the user selects a different course from the dropdown), and we're not in edit mode, validate that the currently selected type is still valid for the new course. If it's not valid, reset it to the first available type for that course.
  useEffect(() => {
    if (selectedCourse && !isEdit) {
      const isCurrentTypeValid = availableTypes.some((t) => t.value === type);
      if (!isCurrentTypeValid && availableTypes.length > 0) {
        setType(availableTypes[0].value);
      }
    }
  }, [selectedCourse, availableTypes, type, isEdit]);

  // For specific courses with known IDs, set the type to a specific laboratory type when selected. This is a special case handling based on the course ID, and only applies when not in edit mode to avoid changing the type of an existing lesson.
  useEffect(() => {
    if (selectedCourse && !isEdit) {
      if (selectedCourse.courseId === "61181") setType("physics_laboratory");
      else if (selectedCourse.courseId === "61765")
        setType("networking_laboratory");
    }
  }, [selectedCourse, isEdit]);

  // Builds cluster dropdown options with semester clusters sorted before other clusters.
  const clusterOptions = useMemo(() => {
    // Returns the semester num.
    const getSemesterNum = (str) => {
      if (!str) return 999;
      const cleanStr = String(str).replace("סמסטר", "").trim();
      const num = parseInt(cleanStr, 10);
      return isNaN(num) ? 999 : num;
    };

    return groupedCourses
      .map((c) => c.clusterName)
      .filter(Boolean)
      .sort((a, b) => {
        const numA = getSemesterNum(a);
        const numB = getSemesterNum(getSemesterNum(b));
        if (numA !== numB) return numA - numB;
        return a.localeCompare(b);
      });
  }, [groupedCourses]);

  const selectedClusterObj = groupedCourses.find(
    (c) => c.clusterName === cluster,
  );
  const courseOptions = selectedClusterObj ? selectedClusterObj.courses : [];

  // Compute the duration of the lesson based on the selected course and type. This looks up the corresponding hour field for the selected type in the course data. If we're in edit mode and the duration is 4 hours, it returns 2 instead, which seems to be a special case handling for existing lessons that had a duration of 4 hours.
  const computedDuration = useMemo(() => {
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
      case "physics_laboratory":
      case "networking_laboratory":
        duration = selectedCourse.labHours || 0;
        break;
      case "pbl":
        duration = selectedCourse.projectHours || 0;
        break;
      default:
        duration = 1;
    }
    if (isEdit && duration === 4) return 2;
    return duration;
  }, [selectedCourse, type, isEdit]);

  const computedCredits = useMemo(() => {
    if (!computedDuration) return 0;
    const durationNum = parseFloat(computedDuration);
    return type === "lecture" ? durationNum : durationNum * 0.5;
  }, [computedDuration, type]);

  // Handles the submit action.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCourse || !lecturer || !semester || !type) {
      showError("Please fill all required fields.");
      return;
    }

    const payload = {
      ...(initialLesson || {}),
      courseId: selectedCourse.courseId,
      courseName: selectedCourse.courseName,
      lecturer: lecturer.trim(),
      cluster: selectedClusterObj?.clusterId ?? initialLesson?.cluster ?? 0,
      type:
        {
          lecture: "LECTURE",
          practice: "TUTORIAL",
          laboratory: "LAB",
          physics_laboratory: "PHYSICS_LAB",
          networking_laboratory: "NETWORKING_LAB",
          pbl: "PBL",
        }[type] || "LECTURE",
      duration: parseInt(computedDuration || 1, 10),
      semester: semester,
      credits: computedCredits,
    };
    onSave(initialLesson, payload);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Lesson" : "Add New Lesson"}
      size="wide"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEdit ? "Update Lesson" : "Add Lesson"}
          </Button>
        </>
      }
    >
      {/* The form is wrapped in a <form> element to allow for proper submission handling when the user clicks the "Add Lesson" or "Update Lesson" button. The onSubmit handler is attached to the form, and the button's onClick also triggers the same handleSubmit function to ensure that the form is validated and submitted correctly. */}
      <form onSubmit={handleSubmit}>
        <div className="add-course-grid">
          <div className="form-field">
            <label>Cluster</label>
            <select
              className="ui-select"
              value={cluster}
              disabled={isEdit}
              onChange={(e) => {
                setCluster(e.target.value);
                setCourseName("");
              }}
            >
              <option value="">(none)</option>
              {clusterOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Course</label>
            <select
              className="ui-select"
              value={courseName}
              disabled={isEdit}
              onChange={(e) => setCourseName(e.target.value)}
            >
              <option value="">(select)</option>
              {courseOptions.map((c) => (
                <option key={c.courseId} value={c.courseName}>
                  {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Lecturer</label>
            <select
              className="ui-select"
              value={lecturer}
              onChange={(e) => setLecturer(e.target.value)}
              required
            >
              <option value="">(select lecturer)</option>
              {[...lecturers]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((lec) => (
                  <option key={lec.id} value={lec.name}>
                    {lec.name}
                  </option>
                ))}
            </select>
          </div>

          {/* The "Type" dropdown is populated based on the available types for the selected course. If there are no valid types for the selected course, the dropdown is disabled and shows a message indicating that there are no valid types. */}
          <div className="form-field">
            <label>Type</label>
            <select
              className="ui-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={availableTypes.length === 0}
            >
              {availableTypes.length === 0 && (
                <option value="">No valid types for this course</option>
              )}
              {availableTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Duration (Hours)</label>
            <input
              className="ui-input"
              type="number"
              value={computedDuration}
              readOnly
              style={{ background: "#f1f5f9" }}
            />
          </div>

          <div className="form-field">
            <label>Semester</label>
            <select
              className="ui-select"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              required
            >
              <option value="">(select)</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}
