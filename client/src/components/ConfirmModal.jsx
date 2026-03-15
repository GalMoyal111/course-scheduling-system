import React, { useEffect, useRef } from "react";
import Button from "./ui/Button";
import "./ui/ui.css";

// Reusable confirmation modal with keyboard handlers and filename display
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
    if (!isOpen) return;
    // focus confirm button when modal opens
    confirmRef.current && confirmRef.current.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel && onCancel();
      } else if (e.key === "Enter") {
        // Enter to confirm
        e.preventDefault();
        onConfirm && onConfirm();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal-card modal-card--warning" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className="modal-header modal-header--warning">
          <h3 id="confirm-title">{title}</h3>
          <button className="modal-close" onClick={onCancel} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="modal-body modal-body--warning">
          <div className="modal-icon" aria-hidden>
            <div className="modal-icon__circle">
              {/* larger, bolder exclamation mark for visibility */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 6v8" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="17.2" r="1.6" fill="#fff" />
              </svg>
            </div>
          </div>

          <div className="modal-message">{message}</div>
          {fileName ? <div className="confirm-file-badge">{fileName}</div> : null}
        </div>

        <div className="modal-footer modal-footer--spacious">
          <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
          <Button ref={confirmRef} variant="primary" onClick={onConfirm} style={{ marginLeft: 8 }}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
