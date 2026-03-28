import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { updatePassword } from "firebase/auth";import { ROLES } from "../constants/roles";
import { useEffect, useState } from "react";
import { getAllUsers } from "../services/api";
import { updateUserRole } from "../services/api";
import { createUser } from "../services/api";
import { deleteUser } from "../services/api";


export default function SettingsPage({ user }) {
    const [newPassword, setNewPassword] = useState("");
    const [users, setUsers] = useState([]);
    const [newEmail, setNewEmail] = useState("");
    const [newRole, setNewRole] = useState(ROLES.USER);
    const [isPasswordConfirmOpen, setIsPasswordConfirmOpen] = useState(false);


    const handleChangePassword = async () => {
        try {
            if (!auth.currentUser) {
                alert("No user logged in");
                return;
            }

            await updatePassword(auth.currentUser, newPassword);
            alert("Password updated successfully");
            setNewPassword("");
            setIsPasswordConfirmOpen(false);
        } catch (err) {
            console.error(err);
            if (err.code === "auth/requires-recent-login") {
                alert("Please log in again before changing password");
        } else {
            alert("Failed to update password");
        }
        }
    };

    const handleChangeRole = async (uid, currentRole) => {
        try {
            const token = await auth.currentUser.getIdToken();

            const newRole =
                currentRole === ROLES.ADMIN ? ROLES.USER : ROLES.ADMIN;

            await updateUserRole(uid, newRole, token);

            setUsers((prev) =>
                prev.map((u) =>
                u.uid === uid ? { ...u, role: newRole } : u
            )
        );
        } catch (err) {
            console.error(err);
            alert("Failed to update role");
        }
    };

    const handleCreateUser = async () => {
        try {
            const token = await auth.currentUser.getIdToken();

            const uid = await createUser(newEmail, newPassword, newRole, token);
            setUsers((prev) => [...prev, { uid, email: newEmail, role: newRole }]);
            alert("User created successfully");
            setNewEmail("");
            setNewPassword("");
            setNewRole(ROLES.USER);

        } catch (err) {
            console.error(err);
            alert("Failed to create user");
        }
    };

    const handleDeleteUser = async (uid) => {
        try {
            const token = await auth.currentUser.getIdToken();
            await deleteUser(uid, token);
            setUsers((prev) => prev.filter((u) => u.uid !== uid));

        } catch (err) {
            console.error(err);
            alert("Failed to delete user");
        }
        };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                if (!auth.currentUser) return;

                const token = await auth.currentUser.getIdToken();
                const data = await getAllUsers(token);

                setUsers(data);
            } catch (err) {
                console.error("Failed to fetch users", err);
            }
        };

        if (user?.role === ROLES.ADMIN) {
            fetchUsers();
        }
    }, [user]);

    return (
        <div className="settings-page">
            <div className="settings-container">
                {/* Page Header */}
                <div className="settings-header">
                    <h1 className="settings-title">Settings</h1>
                    <p className="settings-subtitle">Manage your account and system preferences</p>
                </div>

                {/* Password Section */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <span className="material-icons settings-section-icon">lock</span>
                        <div>
                            <h2 className="settings-section-title">Change Password</h2>
                            <p className="settings-section-desc">Update your account password</p>
                        </div>
                    </div>
                    <div className="settings-section-content">
                        <div className="form-group">
                            <label htmlFor="new-password" className="form-label">New Password</label>
                            <input
                                id="new-password"
                                type="password"
                                placeholder="Enter your new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="settings-input"
                            />
                        </div>
                        <button 
                            onClick={() => setIsPasswordConfirmOpen(true)}
                            className="ui-btn ui-btn--primary"
                        >
                            <span className="material-icons btn-icon">check</span>
                            Update Password
                        </button>
                    </div>
                </div>

                {/* Admin Panel */}
                {user?.role === ROLES.ADMIN && (
                    <>
                        {/* Create User Section */}
                        <div className="settings-section">
                            <div className="settings-section-header">
                                <span className="material-icons settings-section-icon">person_add</span>
                                <div>
                                    <h2 className="settings-section-title">Create New User</h2>
                                    <p className="settings-section-desc">Add a new user to the system</p>
                                </div>
                            </div>
                            <div className="settings-section-content">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="new-email" className="form-label">Email</label>
                                        <input
                                            id="new-email"
                                            type="email"
                                            placeholder="user@example.com"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            className="settings-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="new-user-password" className="form-label">Password</label>
                                        <input
                                            id="new-user-password"
                                            type="password"
                                            placeholder="Enter password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="settings-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="user-role" className="form-label">Role</label>
                                        <select
                                            id="user-role"
                                            value={newRole}
                                            onChange={(e) => setNewRole(e.target.value)}
                                            className="settings-select"
                                        >
                                            <option value={ROLES.USER}>User</option>
                                            <option value={ROLES.ADMIN}>Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleCreateUser}
                                    className="ui-btn ui-btn--primary"
                                >
                                    <span className="material-icons btn-icon">add</span>
                                    Create User
                                </button>
                            </div>
                        </div>

                        {/* Users Management Section */}
                        <div className="settings-section">
                            <div className="settings-section-header">
                                <span className="material-icons settings-section-icon">people</span>
                                <div>
                                    <h2 className="settings-section-title">Manage Users</h2>
                                    <p className="settings-section-desc">View and manage system users</p>
                                </div>
                            </div>
                            <div className="settings-section-content">
                                {users.length === 0 ? (
                                    <p className="settings-empty">No users found</p>
                                ) : (
                                    <div className="users-grid">
                                        {users.map((u) => (
                                            <div key={u.uid} className="user-card">
                                                <div className="user-card-header">
                                                    <div className="user-info">
                                                        <p className="user-email">{u.email}</p>
                                                        <span className={`user-role-badge user-role-${u.role}`}>
                                                            {u.role}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="user-card-actions">
                                                    <button
                                                        onClick={() => handleChangeRole(u.uid, u.role)}
                                                        className="ui-btn ui-btn--ghost"
                                                        title={`Change role to ${u.role === ROLES.ADMIN ? ROLES.USER : ROLES.ADMIN}`}
                                                    >
                                                        <span className="material-icons btn-icon">edit</span>
                                                        Change Role
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u.uid)}
                                                        className="ui-btn btn-danger"
                                                        title="Delete user"
                                                    >
                                                        <span className="material-icons btn-icon">delete</span>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Password Change Confirmation Modal */}
            {isPasswordConfirmOpen && (
                <div className="modal-overlay">
                    <div className="modal-card modal-card--warning">
                        <div className="modal-header modal-header--warning">
                            <div className="modal-icon__circle">
                                <span className="material-icons" style={{ fontSize: "32px", color: "white" }}>
                                    lock
                                </span>
                            </div>
                        </div>
                        <div className="modal-body modal-body--warning">
                            <p className="modal-message">
                                Are you sure you want to change your password?
                            </p>
                        </div>
                        <div className="modal-footer modal-footer--spacious">
                            <button
                                onClick={() => setIsPasswordConfirmOpen(false)}
                                className="ui-btn ui-btn--ghost"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                className="ui-btn ui-btn--primary"
                            >
                                <span className="material-icons btn-icon">check</span>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    }