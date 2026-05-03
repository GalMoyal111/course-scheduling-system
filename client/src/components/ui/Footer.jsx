import React from "react";
import "./ui.css";

export default function Footer() {
  return (
    <footer className="ui-footer">
      <small>© {new Date().getFullYear()} UniSched – University Course Timetabling System</small>
    </footer>
  );
}
