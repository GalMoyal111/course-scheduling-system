// Sidebar navigation for main app sections
import React, { useState } from "react";
import logo from "../../assets/logo.png";
import Modal from "./Modal";
import "./ui.css";
import LoginRequiredModal from "../LoginRequiredModal";
import { useNavigate, useLocation } from "react-router-dom";

// Renders the Sidebar component.
export default function Sidebar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const items = [
    { path: "/", label: "Dashboard", icon: "dashboard" },
    { path: "/classrooms", label: "Classrooms", icon: "meeting_room" },
    { path: "/courses", label: "Courses", icon: "menu_book" },
    { path: "/lecturers", label: "Lecturers", icon: "person" },
    { path: "/lessons", label: "Lessons", icon: "school" },
    { path: "/generate", label: "Generate", icon: "auto_awesome" },
    { path: "/timetable", label: "Timetable", icon: "calendar_month" },
    { path: "/history", label: "History", icon: "history" },
    { path: "/help", label: "Help", icon: "help" },
    { path: "/settings", label: "Settings", icon: "settings" },
  ];

  // Handles the navigate action.
  const handleNavigate = (path) => {
    // Dashboard is always accessible
    if (path === "/") {
      navigate(path);
      return;
    }

    // If user is not logged in, show modal instead of navigating
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    // User is logged in, navigate normally
    navigate(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate("/")}>
        <img src={logo} alt="logo" />
      </div>

      <div className="sidebar-menu">
        {items.map((item) => (
          <div
            key={item.path}
            className={`sidebar-item ${
              location.pathname === item.path ? "active" : ""
            }`}
            onClick={() => handleNavigate(item.path)}
          >
            <span className="material-icons">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Login Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
