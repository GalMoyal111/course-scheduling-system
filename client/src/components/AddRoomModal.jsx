import React, { useState, useEffect } from "react";
import Button from "./ui/Button";
import "./ui/ui.css";
import Modal from "./ui/Modal";

// Simple modal for adding a single classroom (uses app UI styles).
export default function AddRoomModal({ isOpen, onClose, onSave, initialClassroom = null }) {
  const [building, setBuilding] = useState("");
  const [classroomName, setClassroomName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [type, setType] = useState("NORMAL");

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
    }
  }, [isOpen, initialClassroom]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialClassroom);

  const handleSubmit = (e) => {
    e.preventDefault();

    const classroom = {
      building: building.trim(),
      classroomName: classroomName.trim(),
      capacity: parseInt(capacity, 10),
      type,
    };

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