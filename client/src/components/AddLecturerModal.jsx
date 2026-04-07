import React, { useState, useEffect } from "react";
import Button from "./ui/Button";

export default function AddLecturerModal({
  isOpen,
  onClose,
  onSave,
  initialLecturer = null,
}) {
  const [name, setName] = useState("");
  const [maxDailyHours, setMaxDailyHours] = useState("");
  const [maxConsecutiveHours, setMaxConsecutiveHours] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialLecturer) {
      setName(initialLecturer.name);
      setMaxDailyHours(initialLecturer.maxDailyHours.toString());
      setMaxConsecutiveHours(initialLecturer.maxConsecutiveHours.toString());
    } else {
      resetForm();
    }
  }, [initialLecturer, isOpen]);

  const resetForm = () => {
    setName("");
    setMaxDailyHours("");
    setMaxConsecutiveHours("");
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!maxDailyHours || isNaN(maxDailyHours) || maxDailyHours <= 0) {
      newErrors.maxDailyHours = "Max daily hours must be a positive number";
    }

    if (
      !maxConsecutiveHours ||
      isNaN(maxConsecutiveHours) ||
      maxConsecutiveHours <= 0
    ) {
      newErrors.maxConsecutiveHours =
        "Max consecutive hours must be a positive number";
    }

    if (
      maxConsecutiveHours &&
      maxDailyHours &&
      parseInt(maxConsecutiveHours) > parseInt(maxDailyHours)
    ) {
      newErrors.maxConsecutiveHours =
        "Max consecutive hours cannot exceed max daily hours";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const lecturer = {
      ...(initialLecturer && { id: initialLecturer.id }),
      name: name.trim(),
      maxDailyHours: parseInt(maxDailyHours),
      maxConsecutiveHours: parseInt(maxConsecutiveHours),
    };

    onSave(lecturer);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="presentation">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-lecturer-title"
      >
        <div className="modal-header">
          <h3 id="add-lecturer-title">
            {initialLecturer ? "Edit Lecturer" : "Add New Lecturer"}
          </h3>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                className={`ui-input ${errors.name ? "error" : ""}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Dr. Sarah Cohen"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="maxDailyHours">Max Daily Hours</label>
              <input
                id="maxDailyHours"
                type="number"
                className={`ui-input ${errors.maxDailyHours ? "error" : ""}`}
                value={maxDailyHours}
                onChange={(e) => setMaxDailyHours(e.target.value)}
                placeholder="e.g., 6"
                min="1"
                max="12"
              />
              {errors.maxDailyHours && (
                <span className="error-message">{errors.maxDailyHours}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="maxConsecutiveHours">Max Consecutive Hours</label>
              <input
                id="maxConsecutiveHours"
                type="number"
                className={`ui-input ${
                  errors.maxConsecutiveHours ? "error" : ""
                }`}
                value={maxConsecutiveHours}
                onChange={(e) => setMaxConsecutiveHours(e.target.value)}
                placeholder="e.g., 3"
                min="1"
                max="12"
              />
              {errors.maxConsecutiveHours && (
                <span className="error-message">
                  {errors.maxConsecutiveHours}
                </span>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {initialLecturer ? "Update" : "Add"} Lecturer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
