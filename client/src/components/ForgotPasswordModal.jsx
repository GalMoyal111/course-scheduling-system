import React, { useState, useEffect, useRef } from "react";
import Button from "./ui/Button";
import "./ui/ui.css";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase"; 

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const emailInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setLoading(false);
      setSuccess(false);
      // Focus email input when modal opens
      setTimeout(() => emailInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      // Don't auto-close - let user read the message and close manually
    } catch (error) {
      console.error(error);
      alert("Failed to send reset email. Please check the email address and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="forgot-title">
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1C6.48 1 2 5.48 2 11c0 3.54 1.74 6.66 4.35 8.59L6 23c.3.42.84.62 1.41.42l4.59-1.53 4.59 1.53c.57.2 1.11 0 1.41-.42l-.35-3.41C20.26 17.66 22 14.54 22 11c0-5.52-4.48-10-10-10zm0 18c-.61 0-1.22-.09-1.81-.25l-1.3.43.34-2.6c-2.07-1.54-3.42-3.95-3.42-6.68 0-4.68 3.66-8.5 8.16-8.5s8.16 3.82 8.16 8.5-3.66 8.5-8.16 8.5z" fill="white"/>
              <path d="M12 7c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1s1-.45 1-1V8c0-.55-.45-1-1-1zm0 7c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" fill="white"/>
            </svg>
            <h3 id="forgot-title" style={{ margin: 0 }}>Reset Password</h3>
          </div>
          <button 
            className="modal-close" 
            onClick={onClose} 
            aria-label="Close"
            disabled={loading}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {success ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ 
                width: "56px", 
                height: "56px", 
                margin: "0 auto 16px", 
                borderRadius: "50%", 
                background: "rgba(34, 197, 94, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#22c55e"/>
                </svg>
              </div>
              <p style={{ fontSize: "0.95rem", color: "#166534", fontWeight: "600", margin: "0 0 8px 0" }}>
                Email sent successfully!
              </p>
              <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: "0 0 12px 0" }}>
                Check your email for the password reset link.
              </p>
              <p style={{ fontSize: "0.8rem", color: "#6b7280", fontStyle: "italic", margin: "0 0 20px 0" }}>
                💡 If you don't see the email, please check your trash or spam folder.
              </p>
              <Button onClick={onClose}>Close</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>Email Address</label>
                <input
                  ref={emailInputRef}
                  className="ui-input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  required
                  disabled={loading}
                />
              </div>

              <p style={{ 
                fontSize: "0.8rem", 
                color: "var(--muted)", 
                marginTop: "12px",
                marginBottom: "16px"
              }}>
                We'll send you a link to reset your password.
              </p>

              <div className="modal-actions">
                <Button 
                  variant="ghost" 
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}