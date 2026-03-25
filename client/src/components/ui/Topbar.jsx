import React from "react";
import { useLocation } from "react-router-dom";
import logo from "../../assets/logo-small.png";
import "./ui.css";

export default function Topbar() {
  const location = useLocation();

  const map = {
    "/": "Dashboard",
    "/courses": "Courses",
    "/classrooms": "Classrooms",
    "/lessons": "Lessons",
    "/generate": "Generate",
    "/timetable": "Timetable",
    "/history": "History",
    "/settings": "Settings",
  };

  const pageName = map[location.pathname] || "Dashboard";

  return (
    <div className="topbar">
      <div className="topbar-left">
        
        <div>
          <div className="topbar-title">{pageName}</div>
          <div className="topbar-sub">UniSched</div>
        </div>
      </div>
    </div>
  );
}