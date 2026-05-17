// Layout wrapper for sidebar, topbar, and main content
import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./ui.css";

// Main layout component that wraps the entire app. It includes the sidebar, topbar, and a content area for the current page.
export default function Layout({ children , user , onLogin, onLogout}) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar user={user} />

      <div style={{ flex: 1 }}>
        <Topbar user={user} onLogin={onLogin} onLogout={onLogout} />

        <div style={{ padding: "20px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}