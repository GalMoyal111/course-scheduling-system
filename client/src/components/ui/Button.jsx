import React from "react";
import "./ui.css";

// Renders a reusable button with visual variants.
export default function Button({ children, onClick, variant = "primary", ...rest }) {
  return (
    <button className={`ui-btn ui-btn--${variant}`} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}
