import React from "react";
import { useLocation } from "react-router-dom";
import "./ui.css";
import logo from "../../assets/logo-small.png";
import { useState } from "react";
import LoginModal from "../LoginModal";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

export default function Topbar({ user, onLogin, onLogout }) {
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    onLogout();
  };

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

  // derive a friendly username from email if available
  const username = user && user.email ? user.email.split("@")[0] : null;

  return (
    <div className="topbar">
      <div className="topbar-left">
        <img src={logo} alt="Unisched" className="topbar-logo" />
        <div className="topbar-title">{pageName}</div>
      </div>

      <div className="topbar-right">
        {user && (
          <div className="topbar-greeting">
            <span className="topbar-hello">Hello,</span>
            <span className="topbar-username">{username}</span>
          </div>
        )}
        {!user ? (
          <button
            className="icon-btn"
            title="Login"
            onClick={() => setIsLoginOpen(true)}
            aria-label="Open login dialog"
          >
            <span className="material-icons">person</span>
          </button>
        ) : (
          <>
            <button
              className="icon-btn icon-btn--logout"
              title="Logout"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <span className="material-icons">logout</span>
            </button>
          </>
        )}
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLogin={onLogin} />
    </div>
  );
}