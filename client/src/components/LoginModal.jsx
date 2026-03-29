import React, { useState, useEffect, useRef } from "react";
import Button from "./ui/Button";
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
            <div className="modal-overlay" role="presentation">
                <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="login-title">
                    <div className="modal-header">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="white"/>
                            </svg>
                            <h3 id="login-title" style={{ margin: 0 }}>Login</h3>
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

                            <div style={{ textAlign: "right", marginTop: "8px", marginBottom: "16px" }}>
                                <button
                                    type="button"
                                    style={{
                                        fontSize: "0.85rem",
                                        color: "#4f46e5",
                                        cursor: "pointer",
                                        background: "none",
                                        border: "none",
                                        padding: "0",
                                        fontWeight: "500",
                                        transition: "color 0.2s ease"
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = "#7c3aed"}
                                    onMouseLeave={(e) => e.target.style.color = "#4f46e5"}
                                    onClick={() => setIsForgotOpen(true)}
                                    disabled={loading}
                                >
                                    Forgot password?
                                </button>
                            </div>

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
                                    {loading ? "Logging in..." : "Login"}
                                </Button>
                            </div>
                        </form>            
                    </div>                  
                </div>
            </div>
            <ForgotPasswordModal isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} />
        </>
    );
}