import React, { useState } from "react";
import Modal from "./ui/Modal";
import "./InfoButton.css";

export default function InfoButton({ title, description }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="info-button-wrapper">
      <button
        className="info-button"
        onClick={() => setShowModal(true)}
        title="Click for more information"
        aria-label="More information"
      >
        <span className="material-icons">help_outline</span>
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={title}
        size="normal"
      >
        <p>{description}</p>
      </Modal>
    </div>
  );
}
