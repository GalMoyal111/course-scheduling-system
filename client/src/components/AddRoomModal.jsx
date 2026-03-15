import React, { useState, useEffect } from "react";
import Button from "./ui/Button";
import "./ui/ui.css";

// Simple modal for adding a single classroom (uses app UI styles).
export default function AddRoomModal({ isOpen, onClose, onSave, initialClassroom = null }) {
  const [building, setBuilding] = useState("");
  const [classroomName, setClassroomName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [type, setType] = useState("Normal");

  // Initialize fields when modal opens. If initialClassroom provided, pre-fill for edit.
  useEffect(() => {
    if (isOpen) {
      if (initialClassroom) {
        setBuilding(initialClassroom.building || "");
        setClassroomName(initialClassroom.classroomName || "");
        setCapacity(initialClassroom.capacity != null ? String(initialClassroom.capacity) : "");
        setType(initialClassroom.type || "Normal");
      } else {
        setBuilding("");
        setClassroomName("");
        setCapacity("");
        setType("Normal");
      }
    }
  }, [isOpen, initialClassroom]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialClassroom);

  const handleSubmit = (e) => {
    e.preventDefault();

    const cap = parseInt(capacity, 10);
    if (isNaN(cap) || cap < 0) {
      alert("Please enter a valid non-negative number for capacity.");
      return;
    }

    const classroom = {
      building: building.trim(),
      classroomName: classroomName.trim(),
      capacity: cap,
      type,
    };

    onSave(classroom);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3>{isEditing ? "Edit Classroom" : "Add Classroom"}</h3>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
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
              <input className="ui-input" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
            </div>

            <div className="form-field">
              <label>Type</label>
              <select className="ui-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option>Normal</option>
                <option>Laboratory</option>
                <option>Networking Laboratory</option>
                <option>Physics Laboratory</option>
              </select>
            </div>

            <div className="modal-actions">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">Save</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
