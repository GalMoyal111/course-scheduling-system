import React, { useState, useEffect } from "react";
import Button from "./ui/Button";
import "./ui/ui.css";
import Modal from "./ui/Modal";
import { useData } from "../context/DataContext";

// Simple modal for adding a single classroom (uses app UI styles).
export default function AddRoomModal({ isOpen, onClose, onSave, initialClassroom = null }) {
  const [building, setBuilding] = useState("");
  const [classroomName, setClassroomName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [type, setType] = useState("NORMAL");
  const [originalBuilding, setOriginalBuilding] = useState("");
  const [originalClassroomName, setOriginalClassroomName] = useState("");
  const [buildingManuallyEdited, setBuildingManuallyEdited] = useState(false);
  const [validationError, setValidationError] = useState("");
  const { classrooms, fetchClassroomsIfNeeded } = useData();
  const [showCreateBuildingConfirm, setShowCreateBuildingConfirm] = useState(false);
  const [pendingClassroomToSave, setPendingClassroomToSave] = useState(null);

  // Initialize fields when modal opens. If initialClassroom provided, pre-fill for edit.
  useEffect(() => {
    if (isOpen) {
      // Ensure classrooms are loaded so we can validate buildings
      fetchClassroomsIfNeeded("AddRoomModal");

      const nextValues = initialClassroom
        ? {
            building: initialClassroom.building || "",
            originalBuilding: initialClassroom.building || "",
            originalClassroomName: initialClassroom.classroomName || "",
            classroomName: initialClassroom.classroomName || "",
            capacity: initialClassroom.capacity != null ? String(initialClassroom.capacity) : "",
            type: initialClassroom.type || "NORMAL",
          }
        : {
            building: "",
            originalBuilding: "",
            originalClassroomName: "",
            classroomName: "",
            capacity: "",
            type: "NORMAL",
          };

      queueMicrotask(() => {
        setBuilding(nextValues.building);
        setOriginalBuilding(nextValues.originalBuilding);
        setOriginalClassroomName(nextValues.originalClassroomName);
        setBuildingManuallyEdited(false);
        setClassroomName(nextValues.classroomName);
        setCapacity(nextValues.capacity);
        setType(nextValues.type);
        setValidationError("");
        setShowCreateBuildingConfirm(false);
        setPendingClassroomToSave(null);
      });
    }
  }, [isOpen, initialClassroom, fetchClassroomsIfNeeded]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialClassroom);

  // Calculate mismatch warning in real-time
  const nameMatch = classroomName.match(/^([^0-9]+)(?=\d)/);
  const namePrefix = nameMatch ? nameMatch[1].trim() : null;
  const isMismatch = namePrefix && building.trim() && namePrefix !== building.trim();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate building matches classroom name prefix (if prefix exists)
    if (isMismatch) {
      setValidationError(`Building "${building.trim()}" does not match class prefix "${namePrefix}".`);
      return;
    }

    // Prevent duplicate classroom entries (unless editing the same classroom)
    const buildingTrim = building.trim();
    const classroomNameTrim = classroomName.trim();
    const candidateKey = `${buildingTrim.toLowerCase()}||${classroomNameTrim.toLowerCase()}`;
    const originalKey = `${(originalBuilding || "").trim().toLowerCase()}||${(originalClassroomName || "").trim().toLowerCase()}`;
    const duplicate = Array.isArray(classrooms) && classrooms.some(c => {
      const key = `${(c.building || "").trim().toLowerCase()}||${(c.classroomName || "").trim().toLowerCase()}`;
      return key === candidateKey;
    });
    if (duplicate && (!isEditing || candidateKey !== originalKey)) {
      setValidationError("This classroom already exists in the database. To change it, please find and edit the existing classroom.");
      return;
    }

    // Check whether this building already exists in known classrooms
    const buildingExists = Array.isArray(classrooms) && classrooms.some(c => c.building && c.building.trim() === buildingTrim);
    const classroom = {
      building: buildingTrim,
      classroomName: classroomName.trim(),
      capacity: parseInt(capacity, 10),
      type,
    };

    if (!buildingExists) {
      // show UI confirmation modal instead of window.confirm
      setPendingClassroomToSave(classroom);
      setShowCreateBuildingConfirm(true);
      return;
    }

    setValidationError("");
    onSave(classroom);
  };

  // When the classroom name changes, if it contains a building prefix
  // (non-digits before the first digit) update the building field as long
  // as the user hasn't already modified the building (kept original) or
  // the building is empty (new room).
  const handleClassroomNameChange = (e) => {
    const val = e.target.value;
    setClassroomName(val);

    // match any non-digit characters immediately before the first digit
    const match = val.match(/^([^0-9]+)(?=\d)/);
    if (match) {
      const prefix = match[1].trim();
      const isEditing = Boolean(initialClassroom);
      // Only auto-update building while the user hasn't manually edited it.
      if (!buildingManuallyEdited) {
        if (isEditing) {
          // For existing rooms, allow auto-updates until the user touches building.
          if (prefix !== building) setBuilding(prefix);
        } else {
          // For new rooms, update building from prefix while user hasn't typed it.
          if (prefix !== building) setBuilding(prefix);
        }
      }
    }
    // Clear validation error while typing name
    setValidationError("");
  };

  const footerContent = (
    <>
      <Button type="button" variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button
        type="submit"
        form="add-room-form"
        variant="primary"
        disabled={Boolean(validationError || isMismatch)}
      >
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
          <input
            className="ui-input"
            value={building}
            onChange={(e) => {
              setBuilding(e.target.value);
              setBuildingManuallyEdited(true);
            }}
            required
          />
        </div>

        {validationError && (
          <div className="form-error" style={{ color: "#b00020", marginTop: 6 }}>{validationError}</div>
        )}

        {isMismatch && !validationError && (
          <div className="form-warning" style={{ color: "#f57f17", marginTop: 6, padding: 8, backgroundColor: "#fff3e0", borderRadius: 4 }}>
            ⚠️ Building name doesn't match class prefix. "{namePrefix}" expected, but got "{building.trim()}". Save is disabled.
          </div>
        )}

        <div className="form-field">
          <label>Class name (including name of building)</label>
          <input className="ui-input" value={classroomName} onChange={handleClassroomNameChange} required />
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
      {/* Confirmation modal for creating a new building */}
      <Modal
        isOpen={showCreateBuildingConfirm}
        onClose={() => { setShowCreateBuildingConfirm(false); setPendingClassroomToSave(null); }}
        title={`Create building "${building.trim()}"?`}
        variant="warning"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => { setShowCreateBuildingConfirm(false); setPendingClassroomToSave(null); }}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                if (pendingClassroomToSave) {
                  setValidationError("");
                  onSave(pendingClassroomToSave);
                }
                setShowCreateBuildingConfirm(false);
                setPendingClassroomToSave(null);
              }}
            >
              Create & Save
            </Button>
          </>
        }
      >
        <div>
          <p style={{ margin: 0 }}>The building "{building.trim()}" does not exist in the system. Creating it will add a new building record. Are you sure?</p>
        </div>
      </Modal>
    </Modal>
  );
}