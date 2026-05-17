import React, { useState, useEffect } from "react";
import Button from "./ui/Button";
import Modal from "./ui/Modal";

export default function AddLecturerModal({
  isOpen,
  onClose,
  onSave,
  initialLecturer = null,
}) {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});

  // When the modal opens, if there's an initial lecturer (for editing), pre-fill the form. Otherwise, reset it for adding a new lecturer.
  useEffect(() => {
    if (initialLecturer) {
      setName(initialLecturer.name);
    } else {
      resetForm();
    }
  }, [initialLecturer, isOpen]);

  const resetForm = () => {
    setName("");
    setErrors({});
  };


  // Validate the form fields. Currently only checks that the name is not empty, but can be extended with more complex validation if needed.
  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Lecturer name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  // Handle form submission. Validates the form, constructs a lecturer object, and calls onSave with the lecturer data. Then resets the form.
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const lecturer = {
      ...(initialLecturer && { id: initialLecturer.id }),
      name: name.trim(),
      unavailableSlots: initialLecturer ? initialLecturer.unavailableSlots : [],
    };

    onSave(lecturer);
    resetForm();
  };

  // If the modal is not open, don't render anything.
  const modalFooter = (
    <>
      <Button variant="ghost" onClick={onClose} type="button">
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit} type="button">
        {initialLecturer ? "Update Lecturer" : "Add Lecturer"}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialLecturer ? "Edit Lecturer" : "Add New Lecturer"}
      size="normal"
      variant="primary"
      footer={modalFooter}
    >
      {/* removed dir="rtl" since it caused issues with the error message display */}
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <div className="form-field">
          <label
            htmlFor="name"
            style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}
          >
            Lecturer Name (Hebrew)
          </label>
          <input
            id="name"
            type="text"
            className={`ui-input ${errors.name ? "error" : ""}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. ד״ר שרה כהן"
            autoFocus
            dir="rtl"
          />
          {errors.name && (
            <span
              className="error-message"
              style={{
                color: "#ef4444",
                fontSize: "0.85rem",
                marginTop: "4px",
                display: "block",
              }}
            >
              {errors.name}
            </span>
          )}
        </div>
      </form>
    </Modal>
  );
}
