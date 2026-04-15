import React from "react";
import logo from "../../assets/logo.png";
import "./ui.css";

import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const items = [
    { path: "/", label: "Dashboard", icon: "dashboard" },
    { path: "/classrooms", label: "Classrooms", icon: "meeting_room" },
    { path: "/courses", label: "Courses", icon: "menu_book" },
    { path: "/lessons", label: "Lessons", icon: "school" },
    { path: "/lecturers", label: "Lecturers", icon: "person" },
    { path: "/generate", label: "Generate", icon: "auto_awesome" },
    { path: "/timetable", label: "Timetable", icon: "calendar_month" },
    { path: "/history", label: "History", icon: "history" },
    { path: "/settings", label: "Settings", icon: "settings" },
    { path: "/help", label: "Help", icon: "help" },
  ];

  return (
    <div className="sidebar">
      {/* לוגו */}
      <div className="sidebar-logo" onClick={() => navigate("/")}>
        <img src={logo} alt="logo" />
      </div>

      {/* תפריט */}
      <div className="sidebar-menu">
        {items.map((item) => (
          <div
            key={item.path}
            className={`sidebar-item ${
              location.pathname === item.path ? "active" : ""
            }`}
            onClick={() => navigate(item.path)}
          >
            <span className="material-icons">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}