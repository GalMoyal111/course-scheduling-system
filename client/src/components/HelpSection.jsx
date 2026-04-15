import React from "react";

export default function HelpSection({
  title,
  isExpanded,
  onToggle,
  children,
}) {
  return (
    <section className="help-section">
      <div
        className={`help-section-header ${isExpanded ? "expanded" : ""}`}
        onClick={onToggle}
      >
        <h2>{title}</h2>
        <span className="expand-icon">
          {isExpanded ? "▼" : "▶"}
        </span>
      </div>
      {isExpanded && <div className="help-section-body">{children}</div>}
    </section>
  );
}
