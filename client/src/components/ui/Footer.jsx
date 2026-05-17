import React from "react";
import "./ui.css";

/// Simple footer component with current year and app name.
export default function Footer() {
  return (
    <footer className="ui-footer">
      <small>© {new Date().getFullYear()} UniSched – University Course Timetabling System</small>
    </footer>
  );
}
