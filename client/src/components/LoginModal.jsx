import React, { useState, useEffect, useRef } from "react";
import Button from "./ui/Button";
import Modal from "./ui/Modal";
import "./ui/ui.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";
import { getUserRole } from "../services/api";
import ForgotPasswordModal from "./ForgotPasswordModal";

export default function LoginModal({ isOpen, onClose, onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isForgotOpen, setIsForgotOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const emailInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setEmail("");
            setPassword("");
            setLoading(false);
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

    const handleSubmit = async(e) => {
        e.preventDefault();
        
        // Validate password length
        if (password.length < 6) {
            alert("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth,email,password);

            const user = userCredential.user;
            const token = await user.getIdToken();
            const data = await getUserRole(token);

            onLogin({email: user.email,role : data.role, });  
            onClose();

        } catch (error) {
            console.error(error);
            alert("Login failed. Please check your email and password.");
            setLoading(false);
        }
    };

    return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Login"
        footer={
          <>
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
              onClick={handleSubmit}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </>
        }
      >
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

          <div className="form-field">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="ui-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="password-toggle-btn icon-btn"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span className="material-icons">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div style={{ textAlign: "right", marginTop: "4px" }}>
            <button
              type="button"
              style={{
                fontSize: "0.85rem",
                color: "#4f46e5",
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: "0",
                fontWeight: "500"
              }}
              onClick={() => setIsForgotOpen(true)}
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>
        </form>
      </Modal>

      {/* מודל שחזור סיסמה */}
      <ForgotPasswordModal 
        isOpen={isForgotOpen} 
        onClose={() => setIsForgotOpen(false)} 
      />
    </>
  );
}