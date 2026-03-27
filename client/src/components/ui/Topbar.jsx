import React from "react";
import { useLocation } from "react-router-dom";
import logo from "../../assets/logo-small.png";
import "./ui.css";
import { useState } from "react";
import LoginModal from "../LoginModal";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

export default function Topbar( {user , onLogin , onLogout } ) {
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

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div style={{ marginLeft: "auto" }}>
          {!user ? (
            <button onClick={() => setIsLoginOpen(true)}>
              Login
            </button>) : (
            <>
              <span style={{ marginRight: 10 }}>{user.email}</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
        <div>
          <div className="topbar-title">{pageName}</div>
          <div className="topbar-sub">UniSched</div>
        </div>
      </div>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLogin={onLogin}/>
    </div>        
  );
}