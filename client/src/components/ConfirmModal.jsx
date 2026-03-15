import React from "react";
import Button from "./ui/Button";
import "./ui/ui.css";

// Reusable confirmation modal
export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Yes",
  cancelLabel = "No",
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-card--warning" role="dialog" aria-modal="true">
        <div className="modal-header modal-header--warning">
          <h3>{title}</h3>
        </div>

        <div className="modal-body modal-body--warning">
          <div style={{ marginBottom: 12 }}>{message}</div>
        </div>

        <div className="modal-footer">
          <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant="primary" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
