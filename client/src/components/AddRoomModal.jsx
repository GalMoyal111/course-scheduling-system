import React, { useState, useEffect } from "react";
import Button from "./ui/Button";
import "./ui/ui.css";
import Modal from "./ui/Modal";

// Simple modal for adding a single classroom (uses app UI styles).
export default function AddRoomModal({ isOpen, onClose, onSave, initialClassroom = null, existingClassrooms = [] }) {
  const [building, setBuilding] = useState("");
  const [classroomName, setClassroomName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [type, setType] = useState("NORMAL");
  const [validationError, setValidationError] = useState("");

  // Initialize fields when modal opens. If initialClassroom provided, pre-fill for edit.
  useEffect(() => {
    if (isOpen) {
      if (initialClassroom) {
        setBuilding(initialClassroom.building || "");
        setClassroomName(initialClassroom.classroomName || "");
        setCapacity(initialClassroom.capacity != null ? String(initialClassroom.capacity) : "");
        setType(initialClassroom.type || "NORMAL");
      } else {
        setBuilding("");
        setClassroomName("");
        setCapacity("");
        setType("NORMAL");
      }
      setValidationError("");
    }
  }, [isOpen, initialClassroom]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialClassroom);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    const trimmedBuilding = building.trim();
    const trimmedClassroomName = classroomName.trim();

    // Validation 1: Check if building name matches the classroom name
    if (!trimmedClassroomName.includes(trimmedBuilding)) {
      setValidationError("The classroom name must be the same as the building name."); 
      return;
    }

    const classroom = {
      building: trimmedBuilding,
      classroomName: trimmedClassroomName,
      capacity: parseInt(capacity, 10),
      type,
    };

    // Validation 2: Check if classroom already exists
    // When editing, allow saving if the name stays the same for the classroom being edited,
    // but prevent changing to a name that belongs to a different existing classroom.
    const normalize = (value) =>
      String(value || "").trim().toLowerCase();

    const classroomExists = existingClassrooms.some((c) => {
      const isSameOriginalClassroom =
        initialClassroom &&
        normalize(c.classroomName) === normalize(initialClassroom.classroomName);

      return (
        normalize(c.classroomName) === normalize(trimmedClassroomName) &&
        !isSameOriginalClassroom
      );
    });

    if (classroomExists) {
      setValidationError("This classroom already exists in the system, you cannot save.");
      return;
    }

    onSave(classroom);
  };

  const footerContent = (
    <>
      <Button type="button" variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" form="add-room-form" variant="primary">
        Save
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialClassroom ? "Edit Classroom" : "Add Classroom"}
      footer={footerContent}
    >
      {/* Error message display */}
      {validationError && (
        <div style={{
          backgroundColor: "#fee2e2",
          border: "1px solid #fca5a5",
          borderRadius: "6px",
          padding: "12px",
          marginBottom: "16px",
          color: "#991b1b",
          fontSize: "0.95rem",
          fontWeight: 500
        }}>
          {validationError}
        </div>
      )}
      
      {/* נתנו לטופס id כדי שהכפתור בחוץ יוכל לדבר איתו */}
      <form id="add-room-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Building name</label>
          <input className="ui-input" value={building} onChange={(e) => setBuilding(e.target.value)} required />
        </div>

        <div className="form-field">
          <label>Class name (including name of building)</label>
          <input className="ui-input" value={classroomName} onChange={(e) => setClassroomName(e.target.value)} required />
        </div>

        <div className="form-field">
          <label>Capacity</label>
          {/* הוספנו type="number" ו-min="1" כדי שהדפדפן ימנע אוטומטית שגיאות */}
          <input 
            className="ui-input" 
            type="number" 
            min="1" 
            value={capacity} 
            onChange={(e) => setCapacity(e.target.value)} 
            required 
          />
        </div>

        <div className="form-field">
          <label>Type</label>
          <select className="ui-select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="NORMAL">Normal Classroom</option>
            <option value="LAB">General Laboratory</option>
            <option value="NETWORKING_LAB">Networking Laboratory</option>
            <option value="PHYSICS_LAB">Physics Laboratory</option>
            <option value="AUDITORIUM">Auditorium</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}