import React from "react";
import logo from "../../assets/logo.png";
import "./ui.css";

export default function Sidebar({ page, onNavigate }) {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: "dashboard" },
    { key: "rooms", label: "Classrooms", icon: "meeting_room" },
    { key: "courses", label: "Courses", icon: "menu_book" },
    { key: "lessons", label: "Lessons", icon: "school" },
    { key: "generate", label: "Generate", icon: "auto_awesome" },
    { key: "timetable", label: "Timetable", icon: "calendar_month" },
    { key: "history", label: "History", icon: "history" },
    { key: "settings", label: "Settings", icon: "settings" },
  ];

  return (
    <div className="sidebar">
      {/* לוגו */}
      <div className="sidebar-logo" onClick={() => onNavigate("dashboard")}>
        <img src={logo} alt="logo" />
      </div>

      {/* תפריט */}
      <div className="sidebar-menu">
        {items.map((item) => (
          <div
            key={item.key}
            className={`sidebar-item ${page === item.key ? "active" : ""}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className="material-icons">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}