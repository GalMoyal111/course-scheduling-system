import React from "react";
import Sidebar from "./Sidebar";
import "./ui.css";

export default function Layout({ children, page, onNavigate }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar page={page} onNavigate={onNavigate} />

      <div style={{ flex: 1, padding: "20px" }}>
        {children}
      </div>
    </div>
  );
}