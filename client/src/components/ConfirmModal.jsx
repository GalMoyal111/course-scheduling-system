import React, { useEffect, useRef } from "react";
import Button from "./ui/Button";
import Modal from "./ui/Modal";

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
    if (isOpen) {
      setTimeout(() => confirmRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const footerContent = (
    <>
      <Button variant="ghost" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button 
        ref={confirmRef} 
        variant="primary" 
        onClick={onConfirm}
      >
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      variant="warning" // משתמשים בעיצוב הכתום/אדום שהגדרנו ב-CSS
      footer={footerContent}
    >
      {/* זה ה-children של המודאל */}
      <div className="confirm-modal-body">
        <div className="modal-icon" style={{ textAlign: 'center', marginBottom: '1rem' }}>
           <span className="material-icons" style={{ fontSize: '48px', color: '#f59e0b' }}>
             report_problem
           </span>
        </div>
        
        <p className="modal-message" style={{ textAlign: 'center', fontSize: '1.1rem' }}>
          {message}
        </p>

        {fileName && (
          <div className="confirm-file-badge" style={{ 
            marginTop: '1rem', 
            padding: '8px', 
            background: '#fff7ed', 
            borderRadius: '8px', 
            border: '1px solid #ffedd5',
            color: '#9a3412',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            <strong>File:</strong> {fileName}
          </div>
        )}
      </div>
    </Modal>
  );
}