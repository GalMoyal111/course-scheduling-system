import React, { useState, useEffect } from "react";
import Button from "./ui/Button";
import "./ui/ui.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";
import { getUserRole } from "../services/api";


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


    const handleSubmit = async(e) => {
        e.preventDefault();

        try {
            const userCredential = await signInWithEmailAndPassword(auth,email,password);

            const user = userCredential.user;
            const token = await user.getIdToken();
            const data = await getUserRole(token);

            onLogin({email: user.email,role : data.role, });  
            onClose();

        } catch (error) {
            alert("Login failed");
        }

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
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
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