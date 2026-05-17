import React, { useState } from "react";
import "./InfoButton.css";

export default function InfoButton({ title, description }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="info-button-wrapper"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="info-icon">
        <span className="material-icons">help_outline</span>
      </span>

      {showTooltip && (
        <div className="tooltip">
          {description}
          <div className="tooltip-arrow"></div>
        </div>
      )}
    </div>
  );
}
