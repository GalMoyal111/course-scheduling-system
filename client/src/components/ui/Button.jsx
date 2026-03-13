import React from "react";
import "./ui.css";

/**
 * Small reusable button with variants for consistent look.
 */
export default function Button({ children, onClick, variant = "primary", ...rest }) {
  return (
    <button className={`ui-btn ui-btn--${variant}`} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}
