import React, { useState, useEffect, useMemo } from "react";
import { useData } from "../context/DataContext";
import Button from "./ui/Button";
import "./ui/ui.css";
import Modal from "./ui/Modal";

// Mapping of day numbers to their Hebrew names for display purposes. This allows us to show user-friendly day names in the dropdown when selecting a day for the manual assignment.
const DAY_NAMES = {
  1: "ראשון",
  2: "שני",
  3: "שלישי",
  4: "רביעי",
  5: "חמישי",
  6: "שישי",
};

// helpful function to convert frame numbers to human-readable start times. This is a simplified mapping and can be adjusted based on the actual schedule structure of the university. For example, if frame 1 starts at 08:30, frame 2 at 09:30, etc., you can create a mapping accordingly. The current implementation assumes each frame is one hour long with a break in between, but this can be modified to fit the specific timing of your institution.
const getStartTimeByFrame = (frame) => {
  const startHour = 7 + parseInt(frame, 10);
  const isHalfPast = startHour === 12 ? "20" : "30";
  const hour = Math.floor(8.5 + (frame - 1));
  const mins = frame % 2 === 0 ? "30" : "30";

  const times = {
    1: "08:30",
    2: "09:30",
    3: "10:30",
    4: "11:30",
    5: "12:50",
    6: "13:50",
    7: "14:50",
    8: "15:50",
    9: "16:50",
    10: "17:50",
    11: "18:50",
    12: "19:50",
  };
  return times[frame] || "Unknown";
};

// Renders the ManualAssignmentModal component.
export default function ManualAssignmentModal({
  isOpen,
  onClose,
  onSave,
  currentSemester,
}) {
  const { lessons, classrooms, lecturers, clusterMappings } = useData();

  // Build dynamic cluster mapping from DataContext
  const clusterMapping = clusterMappings.numToName;

  const [selectedCluster, setSelectedCluster] = useState("");
  const [selectedCourseName, setSelectedCourseName] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");

  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedClassroomName, setSelectedClassroomName] = useState("");

  const [selectedDay, setSelectedDay] = useState("");
  const [selectedFrame, setSelectedFrame] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedCluster("");
      setSelectedCourseName("");
      setSelectedLessonId("");
      setSelectedBuilding("");
      setSelectedClassroomName("");
      setSelectedDay("");
      setSelectedFrame("");
      setError("");
    }
  }, [isOpen]);

  // Filter lessons for the current semester. This is the base dataset we will work with for all subsequent filtering based on cluster, course, etc.
  const semesterLessons = useMemo(() => {
    if (!lessons || !currentSemester) return [];
    return lessons.filter((l) => l.semester === currentSemester);
  }, [lessons, currentSemester]);

  // Get unique clusters from the semester lessons to populate the cluster dropdown. We use a Set to ensure uniqueness, and then convert it back to an array and sort it for better UX.
  const availableClusters = useMemo(() => {
    const clusters = new Set();
    semesterLessons.forEach((l) => {
      // Use the filtered semester lessons here.
      if (l.cluster) clusters.add(l.cluster);
    });
    return Array.from(clusters).sort((a, b) => a - b);
  }, [semesterLessons]); // Recompute when semester lessons change.

  // Get unique course names for the selected cluster to populate the course dropdown. Again, we use a Set for uniqueness and sort the results.
  const filteredCourseNames = useMemo(() => {
    if (!selectedCluster) return [];
    const courseNames = new Set();
    semesterLessons // Use the filtered semester lessons here.
      .filter((l) => l.cluster.toString() === selectedCluster.toString())
      .forEach((l) => courseNames.add(l.courseName));
    return Array.from(courseNames).sort();
  }, [semesterLessons, selectedCluster]); // Recompute when semester lessons or selected cluster changes.

  // Filter lessons based on the selected cluster and course to populate the specific lesson dropdown. This allows the user to select a specific lesson (with its type and lecturer) after choosing the cluster and course.
  const filteredLessons = useMemo(() => {
    if (!selectedCluster || !selectedCourseName) return [];
    return semesterLessons.filter(
      (
        l, // Use each filtered semester lesson.
      ) =>
        l.cluster.toString() === selectedCluster.toString() &&
        l.courseName === selectedCourseName,
    );
  }, [semesterLessons, selectedCluster, selectedCourseName]);

  // Get unique buildings from the classrooms data to populate the building dropdown. We use a Set for uniqueness and sort the results for better UX.
  const availableBuildings = useMemo(() => {
    const buildings = new Set();
    classrooms.forEach((c) => {
      if (c.building) buildings.add(c.building);
    });
    return Array.from(buildings).sort();
  }, [classrooms]);

  const filteredClassrooms = useMemo(() => {
    if (!selectedBuilding) return [];
    return classrooms
      .filter((c) => c.building === selectedBuilding)
      .sort((a, b) => a.classroomName.localeCompare(b.classroomName));
  }, [classrooms, selectedBuilding]);

  //find the duration of the selected lesson to calculate end time for display
  const selectedLessonDuration = useMemo(() => {
    if (!selectedLessonId) return 0;
    const lesson = lessons.find((l) => l.lessonId === selectedLessonId);
    return lesson ? lesson.duration : 0;
  }, [selectedLessonId, lessons]);

  // Handle the save action when the user clicks the "Add Assignment" button. This function performs validation to ensure all fields are filled, checks for scheduling conflicts with the lecturer's unavailable slots, and then calls the onSave callback with the new assignment details if everything is valid. If there are any issues (e.g., missing fields, scheduling conflicts), it sets an appropriate error message to inform the user.
  const handleSave = (e) => {
    if (e) e.preventDefault();
    setError("");

    if (
      !selectedLessonId ||
      !selectedDay ||
      !selectedFrame ||
      !selectedClassroomName ||
      !selectedBuilding
    ) {
      setError("Please fill in all fields completely.");
      return;
    }

    const lesson = semesterLessons.find((l) => l.lessonId === selectedLessonId);
    if (!lesson) return;

    const duration = lesson.duration;
    const startFrame = parseInt(selectedFrame, 10);
    const day = parseInt(selectedDay, 10);

    const maxFrame = day === 6 ? 4 : 12;
    if (startFrame + duration - 1 > maxFrame) {
      setError(
        `The lesson is ${duration} hours long and exceeds the day's limit.`,
      );
      return;
    }

    const lecturer = lecturers.find((l) => l.name === lesson.lecturer);
    if (lecturer && lecturer.unavailableSlots) {
      for (let t = 0; t < duration; t++) {
        const currentFrame = startFrame + t;
        const isUnavailable = lecturer.unavailableSlots.some(
          (slot) => slot.day === day && slot.startFrame === currentFrame,
        );

        if (isUnavailable) {
          setError(
            `Lecturer ${lecturer.name} is not available on day ${day} at time ${getStartTimeByFrame(currentFrame)}.`,
          );
          return;
        }
      }
    }

    onSave({
      lessonId: lesson.lessonId,
      courseName: lesson.courseName,
      type: lesson.type,
      lecturer: lesson.lecturer,
      day: day,
      startFrame: startFrame,
      duration: duration,
      building: selectedBuilding,
      classroomName: selectedClassroomName,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Manual Assignment"
      size="wide"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Add Assignment
          </Button>
        </>
      }
    >
      <form onSubmit={handleSave}>
        {error && (
          <div
            style={{
              color: "red",
              fontSize: "14px",
              background: "#fee2e2",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "15px",
            }}
          >
            {error}
          </div>
        )}

        <h4
          style={{
            margin: "0 0 15px 0",
            color: "#334155",
            fontSize: "15px",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "5px",
          }}
        >
          1. Select Lesson
        </h4>
        <div className="add-course-grid" style={{ marginBottom: "25px" }}>
          <div className="form-field">
            <label>Cluster</label>
            <select
              className="ui-select"
              value={selectedCluster}
              onChange={(e) => {
                setSelectedCluster(e.target.value);
                setSelectedCourseName("");
                setSelectedLessonId("");
              }}
            >
              <option value="">-- Select Cluster --</option>
              {availableClusters.map((cluster) => (
                <option key={cluster} value={cluster}>
                  {clusterMapping[cluster] || `Cluster ${cluster}`}
                </option>
              ))}
            </select>
          </div>

          <div
            className="form-field"
            style={{ opacity: selectedCluster ? 1 : 0.5 }}
          >
            <label>Course</label>
            <select
              className="ui-select"
              value={selectedCourseName}
              onChange={(e) => {
                setSelectedCourseName(e.target.value);
                setSelectedLessonId("");
              }}
              disabled={!selectedCluster}
            >
              <option value="">-- Select Course --</option>
              {filteredCourseNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div
            className="form-field"
            style={{
              opacity: selectedCourseName ? 1 : 0.5,
              gridColumn: "1 / -1",
            }}
          >
            <label>Specific Lesson (Type & Lecturer)</label>
            <select
              className="ui-select"
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              disabled={!selectedCourseName}
            >
              <option value="">-- Select Specific Lesson --</option>
              {filteredLessons.map((l) => (
                <option key={l.lessonId} value={l.lessonId}>
                  {l.type} - {l.lecturer} [{l.duration} hrs]
                </option>
              ))}
            </select>
          </div>
        </div>

        <h4
          style={{
            margin: "0 0 15px 0",
            color: "#334155",
            fontSize: "15px",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "5px",
          }}
        >
          2. Select Room & Time
        </h4>
        <div className="add-course-grid">
          <div className="form-field">
            <label>Building</label>
            <select
              className="ui-select"
              value={selectedBuilding}
              onChange={(e) => {
                setSelectedBuilding(e.target.value);
                setSelectedClassroomName("");
              }}
            >
              <option value="">-- Building --</option>
              {availableBuildings.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div
            className="form-field"
            style={{ opacity: selectedBuilding ? 1 : 0.5 }}
          >
            <label>Room</label>
            <select
              className="ui-select"
              value={selectedClassroomName}
              onChange={(e) => setSelectedClassroomName(e.target.value)}
              disabled={!selectedBuilding}
            >
              <option value="">-- Room --</option>
              {filteredClassrooms.map((c) => (
                <option key={c.classroomName} value={c.classroomName}>
                  {c.classroomName} (Cap: {c.capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Day</label>
            <select
              className="ui-select"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              <option value="">-- Day --</option>
              {[1, 2, 3, 4, 5, 6].map((d) => (
                <option key={d} value={d}>
                  {DAY_NAMES[d]} (Day {d})
                </option>
              ))}
            </select>
          </div>

          <div className="form-field" style={{ position: "relative" }}>
            <label>Start Time</label>
            <select
              className="ui-select"
              value={selectedFrame}
              onChange={(e) => setSelectedFrame(e.target.value)}
            >
              <option value="">-- Time --</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((f) => (
                <option key={f} value={f}>
                  {getStartTimeByFrame(f)} (Frame {f})
                </option>
              ))}
            </select>
            {selectedFrame && selectedLessonDuration > 0 && (
              <div
                style={{
                  position: "absolute",
                  bottom: "-20px",
                  left: "5px",
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                Ends at{" "}
                {getStartTimeByFrame(
                  parseInt(selectedFrame) + selectedLessonDuration,
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
