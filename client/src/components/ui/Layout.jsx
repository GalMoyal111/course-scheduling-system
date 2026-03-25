import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./ui.css";

export default function Layout({ children , user , onLogin, onLogout}) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1 }}>
        <Topbar user={user} onLogin={onLogin} onLogout={onLogout} />

        <div style={{ padding: "20px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}