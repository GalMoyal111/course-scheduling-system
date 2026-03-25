import React from "react";
import Button from "./Button";
import logo from "../../assets/logo.png";
import "./ui.css";

/**
 * Header with app title and simple navigation.
 * Keeps responsibilities small: display server message and emit navigation events.
 */
export default function Header({ page, onNavigate, serverMsg }) {
  return (
    <header className="ui-header">
      <div className="ui-header__brand">
        <img src={logo} alt="Unisched logo" className="ui-logo-large" />
      </div>

      <nav className="ui-nav" aria-label="Main navigation">
        <Button variant={page === "lessons" ? "accent" : "ghost"} onClick={() => onNavigate("lessons")}>
          Upload Lessons
        </Button>
        <Button variant={page === "courses" ? "accent" : "ghost"} onClick={() => onNavigate("courses")}>
          Upload Courses
        </Button>
        <Button variant={page === "rooms" ? "accent" : "ghost"} onClick={() => onNavigate("rooms")}>
          Upload Rooms
        </Button>
      </nav>

      <div className="ui-server">Server: <span className="ui-server__msg">{serverMsg}</span></div>
    </header>
  );
}
