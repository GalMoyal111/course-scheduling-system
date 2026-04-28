import React, { useState, useEffect, useMemo } from "react";
import { useData } from "../context/DataContext";
import Button from "./ui/Button";
import Modal from "./ui/Modal";


export default function HardCourseModal({ isOpen, onClose, onSave, currentSemester }) {
  const { lessons, clusterMappings } = useData();

  const clusterMapping = clusterMappings.numToName;
  const [selectedCluster, setSelectedCluster] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // סינון שיעורים לפי סמסטר
  const semesterLessons = useMemo(() => 
    lessons.filter(l => l.semester === currentSemester), 
  [lessons, currentSemester]);

  // רשימת אשכולות
  const availableClusters = useMemo(() => {
    const clusters = new Set();
    semesterLessons.forEach(l => clusters.add(l.cluster));
    return Array.from(clusters).sort((a, b) => a - b);
  }, [semesterLessons]);

  // רשימת קורסים (ייחודיים) לפי אשכול
  const filteredCourses = useMemo(() => {
    if (!selectedCluster) return [];
    const coursesMap = new Map();
    semesterLessons
      .filter(l => l.cluster.toString() === selectedCluster.toString())
      .forEach(l => coursesMap.set(l.courseId, l.courseName));
    return Array.from(coursesMap.entries()).map(([id, name]) => ({ id, name }));
  }, [semesterLessons, selectedCluster]);

  useEffect(() => {
    if (isOpen) {
      setSelectedCluster("");
      setSelectedCourseId("");
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!selectedCourseId) return;
    const course = filteredCourses.find(c => c.id === selectedCourseId);
    onSave({ courseId: course.id, courseName: course.name });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Define Hard Course (Morning Priority)">
      <div className="modal-body" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
        <p style={{ fontSize: "14px", color: "#64748b" }}>
          Selected courses will have their <strong>Lectures</strong> prioritized for morning slots (8:30 - 12:30).
        </p>
        
        <div className="form-field">
          <label>Cluster</label>
          <select className="ui-select" value={selectedCluster} onChange={(e) => setSelectedCluster(e.target.value)}>
            <option value="">-- Select Cluster --</option>
            {availableClusters.map(c => (
              <option key={c} value={c}>{clusterMapping[c] || `Cluster ${c}`}</option>
            ))}
          </select>
        </div>

        <div className="form-field" style={{ opacity: selectedCluster ? 1 : 0.5 }}>
          <label>Course</label>
          <select className="ui-select" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} disabled={!selectedCluster}>
            <option value="">-- Select Course --</option>
            {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div className="modal-actions" style={{ padding: "15px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} disabled={!selectedCourseId}>Mark as Hard</Button>
      </div>
    </Modal>
  );
}