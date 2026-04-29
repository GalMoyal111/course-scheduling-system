import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import "./Toast.css";

export function useToast() {
  const [toast, setToast] = useState(null);

  const showSuccess = (message) => {
    setToast({
      type: "success",
      message,
      id: Date.now(),
    });
    // Auto-dismiss success messages after 2.5 seconds
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const showError = (message) => {
    setToast({
      type: "error",
      message,
      id: Date.now(),
    });
  };

  const closeToast = () => {
    setToast(null);
  };

  return { toast, showSuccess, showError, closeToast };
}

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isError = toast.type === "error";
  const variant = isError ? "danger" : "primary";

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title=""
      size="wide"
      variant={variant}
      centerContent={true}
    >
      <div className="toast-modal-content">
        <div className={`toast-modal-icon toast-icon-${toast.type}`}>
          <span className="material-icons">
            {isError ? "error" : "check_circle"}
          </span>
        </div>
        <p className="toast-modal-message">{toast.message}</p>
      </div>
      
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
        {isError && (
          <button
            className="toast-modal-close-button"
            onClick={onClose}
            style={{
              padding: '10px 24px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span className="material-icons" style={{ fontSize: '18px' }}>close</span>
            Close
          </button>
        )}
      </div>
    </Modal>
  );
}
