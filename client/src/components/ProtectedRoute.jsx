import React from "react";
import { Navigate } from "react-router-dom";

// Renders the ProtectedRoute component.
export default function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
