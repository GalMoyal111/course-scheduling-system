import React from "react";
import { createPortal } from "react-dom";
import Modal from "./ui/Modal";

export default function LoginRequiredModal({ isOpen, onClose }) {

  return createPortal(
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Authentication Required"
      size="normal"
      footer={
        <button
          className="ui-btn ui-btn--primary"
          onClick={onClose}
        >
          OK, I'll Log In
        </button>
      }
    >
      <p style={{ fontSize: "1rem", color: "#475569", lineHeight: "1.6" }}>
        You must log in to access this feature.
        Please use the login button in the top-right corner
        to log in to your account.
      </p>
    </Modal>,
    document.body
  );
}