import React, { useState, useEffect, useRef } from "react";
import Button from "./ui/Button";
import Modal from "./ui/Modal";
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
      setTimeout(() => emailInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Failed to send reset email. Please check the email address and try again.");
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset Password"
      centerContent={success} // משתמש במנגנון המרכוז של האבא
      footer={
        success ? (
          <Button onClick={onClose} variant="primary">Close</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} onClick={handleSubmit}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </>
        )
      }
    >
      {success ? (
        <>
          <div style={{ 
            width: "64px", height: "64px", borderRadius: "50%", 
            background: "#dbfde5", display: "flex", alignItems: "center", 
            justifyContent: "center", marginBottom: "1.5rem" 
          }}>
            <span className="material-icons" style={{ color: "#166534", fontSize: "36px" }}>
              check_circle
            </span>
          </div>
          <h4 style={{ margin: "0 0 8px 0", color: "#166534", fontSize: "1.2rem", fontWeight: "700" }}>
            Email sent successfully!
          </h4>
          <p style={{ margin: "0 0 16px 0", color: "#6b7280", fontSize: "0.95rem" }}>
            Check your inbox for the password reset link.
          </p>
          <p style={{ fontSize: "0.8rem", color: "#6b7280", fontStyle: "italic", margin: 0 }}>
            💡 If you don't see the email, please check your trash or spam folder.
          </p>
        </>
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
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "12px" }}>
            We'll send you a link to reset your password.
          </p>
        </form>
      )}
    </Modal>
  );
}