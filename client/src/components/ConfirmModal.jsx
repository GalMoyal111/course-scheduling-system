import React, { useEffect, useRef } from "react";
import Button from "./ui/Button";
import Modal from "./ui/Modal";

// A reusable confirmation modal component that can be used for various actions (e.g. deleting a course, removing a lecturer, etc.). It displays a warning icon, a customizable message, and the name of the target item (if provided). The confirm button is focused when the modal opens for better accessibility.
export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message,
  fileName = "",
  onConfirm,
  onCancel,
  confirmLabel = "Yes",
  cancelLabel = "No",
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => confirmRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Define the footer content with Cancel and Confirm buttons. The Confirm button is focused when the modal opens for better accessibility.
  const footerContent = (
    <>
      <Button variant="ghost" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button ref={confirmRef} variant="primary" onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      variant="warning"
      footer={footerContent}
    >
      {/* Modal body with warning icon, message, and optional file name badge */}
      <div className="confirm-modal-body" style={{ textAlign: "center" }}>
        <div className="modal-icon" style={{ marginBottom: "1rem" }}>
          <span
            className="material-icons"
            style={{ fontSize: "48px", color: "#f59e0b" }}
          >
            report_problem
          </span>
        </div>

        <p
          className="modal-message"
          style={{ fontSize: "1.1rem", margin: "0 0 1rem 0" }}
        >
          {message}
        </p>

        {fileName && (
          <div
            className="confirm-file-badge"
            style={{
              padding: "8px",
              background: "#fff7ed",
              borderRadius: "8px",
              border: "1px solid #ffedd5",
              color: "#9a3412",
              fontSize: "0.9rem",
              display: "inline-block",
            }}
          >
            <strong>Target:</strong> {fileName}
          </div>
        )}
      </div>
    </Modal>
  );
}
