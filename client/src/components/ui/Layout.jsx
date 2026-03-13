import React from "react";
import "./ui.css";

/**
 * Simple layout wrapper to provide centered container and basic spacing.
 */
export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <div className="app-container">{children}</div>
    </div>
  );
}
