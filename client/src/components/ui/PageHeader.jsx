import React from "react";
import "./PageHeader.css";

export default function PageHeader({ icon, title, subtitle, className = "" }) {
  return (
    <header className={`page-header ${className}`.trim()}>
      <div className="page-header-title-row">
        {icon ? (
          <span className="material-icons page-header-icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <h1 className="page-header-title">{title}</h1>
      </div>
      {subtitle ? <p className="page-header-subtitle">{subtitle}</p> : null}
    </header>
  );
}