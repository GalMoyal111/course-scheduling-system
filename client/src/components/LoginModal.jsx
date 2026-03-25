import React, { useState, useEffect } from "react";
import Button from "./ui/Button";
import "./ui/ui.css";

export default function LoginModal({ isOpen, onClose, onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
    if (isOpen) {
        setEmail("");
        setPassword("");
        }
    }, [isOpen]);

    if (!isOpen) return null;


    const handleSubmit = (e) => {
        e.preventDefault();

        // fake login
        onLogin({ email, role: "ADMIN" });

        onClose();
    };


 

    return (
        <div className="modal-overlay">
        <div className="modal-card" role="dialog">
            <div className="modal-header">
            <h3>Login</h3>
            </div>

            <div className="modal-body">
            <form onSubmit={handleSubmit}>
                <div className="form-field">
                <label>Email</label>
                <input
                    className="ui-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                </div>

                <div className="form-field">
                <label>Password</label>
                <input
                    type="password"
                    className="ui-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                </div>

                <div className="modal-actions">
                <Button variant="ghost" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit">Login</Button>
                </div>
            </form>
            </div>
        </div>
        </div>
    );
}