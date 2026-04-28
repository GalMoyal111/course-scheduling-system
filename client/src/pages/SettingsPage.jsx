import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { updatePassword } from "firebase/auth";import { ROLES } from "../constants/roles";
import { useEffect, useState } from "react";
import { getAllUsers } from "../services/api";
import { updateUserRole } from "../services/api";
import { createUser } from "../services/api";
import { deleteUser } from "../services/api";
import ConfirmModal from "../components/ConfirmModal";
import { useData } from "../context/DataContext";
import { addCluster, deleteClusters } from "../services/api";
import Modal from "../components/ui/Modal"; 



export default function SettingsPage({ user }) {
    const [newPassword, setNewPassword] = useState("");
    const [users, setUsers] = useState([]);
    const [newEmail, setNewEmail] = useState("");
    const [newRole, setNewRole] = useState(ROLES.USER);
    const [isPasswordConfirmOpen, setIsPasswordConfirmOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showCreateUserPassword, setShowCreateUserPassword] = useState(false);
    const [isDeleteUserConfirmOpen, setIsDeleteUserConfirmOpen] = useState(false);
    const [pendingCourse, setPendingCourse] = useState(null);


    const { clusters, setClusters, fetchClustersIfNeeded, invalidateClustersCache } = useData();
    const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
    const [newClusterName, setNewClusterName] = useState("");
    const [isDeleteClusterConfirmOpen, setIsDeleteClusterConfirmOpen] = useState(false);
    const [clusterToDelete, setClusterToDelete] = useState(null);



    const handleChangePassword = async () => {
        try {
            if (!auth.currentUser) {
                alert("No user logged in");
                return;
            }

            // Validate password length
            if (newPassword.length < 6) {
                alert("Password must be at least 6 characters long");
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
            // Validate password length
            if (newPassword.length < 6) {
                alert("Password must be at least 6 characters long");
                return;
            }

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


    const handleAddCluster = async () => {
        const trimmedName = newClusterName.trim();
        if (!trimmedName) {
            alert("Cluster name cannot be empty");
            return;
        }

        const isDuplicate = clusters.some(
            c => c.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );

        if (isDuplicate) {
            alert(`The cluster/semester "${trimmedName}" already exists!`);
            return;
        }

        try {
            const addedCluster = await addCluster({ name: trimmedName });
            setClusters(prev => [...prev, addedCluster].sort((a, b) => a.number - b.number));
            invalidateClustersCache();
            alert("Cluster added successfully");
            setNewClusterName("");
            setIsClusterModalOpen(false);
        } catch (err) {
            console.error("Failed to add cluster:", err);
            alert("Failed to add cluster");
        }
    };

    const handleDeleteCluster = async (cluster) => {
        try {
            await deleteClusters([cluster]);
            setClusters(prev => prev.filter(c => c.id !== cluster.id));
            invalidateClustersCache();
            alert("Cluster deleted successfully");
            setIsDeleteClusterConfirmOpen(false);
            setClusterToDelete(null);
        } catch (err) {
            console.error("Failed to delete cluster:", err);
            alert("Failed to delete cluster");
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

        fetchClustersIfNeeded();


    }, [user, fetchClustersIfNeeded]);




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
                            <div className="password-input-wrapper">
                                <input
                                    id="new-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your new password (minimum 6 characters)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="settings-input"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="password-toggle-btn icon-btn"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    <span className="material-icons">
                                        {showPassword ? "visibility_off" : "visibility"}
                                    </span>
                                </button>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsPasswordConfirmOpen(true)}
                            className="ui-btn ui-btn--primary"
                            disabled={newPassword.length < 6}
                            title={newPassword.length < 6 ? "Password must be at least 6 characters" : ""}
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
                                        <div className="password-input-wrapper">
                                            <input
                                                id="new-user-password"
                                                type={showCreateUserPassword ? "text" : "password"}
                                                placeholder="Enter password (minimum 6 characters)"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="settings-input"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCreateUserPassword(!showCreateUserPassword)}
                                                className="password-toggle-btn"
                                                aria-label={showCreateUserPassword ? "Hide password" : "Show password"}
                                            >
                                                {showCreateUserPassword ? (
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                                                    </svg>
                                                ) : (
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M11.83 9L5.5 2.62C4.96 2.9 4.46 3.25 4 3.67v.02c-2.14 2.43-3.85 5.58-4.82 9.31.59 1.56 1.35 3.06 2.25 4.41l1.46-1.46C3.21 14.6 3 13.34 3 12c0-4.97 4-9 9-9c-1.34 0-2.6-.21-3.82-.57l-2.12 2.12c-1.41 1.41-3.71 1.41-5.12 0s-1.41-3.71 0-5.12L20.91 13.93zM12 18c2.76 0 5-2.24 5-5 0-.65-.13-1.26-.36-1.83l-6.47 6.47c.57.23 1.18.36 1.83.36z" fill="currentColor"/>
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
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
                                    disabled={newPassword.length < 6}
                                    title={newPassword.length < 6 ? "Password must be at least 6 characters" : ""}
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
                                                        onClick={() => {
                                                            setPendingCourse(u);
                                                            setIsDeleteUserConfirmOpen(true); 
                                                        }}
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


                {/* Clusters Management Section */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <span className="material-icons settings-section-icon">category</span>
                        <div>
                            <h2 className="settings-section-title">Manage Clusters (Semesters)</h2>
                            <p className="settings-section-desc">Add or remove clusters that appear in dropdowns</p>
                        </div>
                    </div>
                    <div className="settings-section-content">
                        <div style={{ marginBottom: "20px" }}>
                            <button 
                                onClick={() => setIsClusterModalOpen(true)}
                                className="ui-btn ui-btn--primary"
                            >
                                <span className="material-icons btn-icon">add</span>
                                Add New Cluster
                            </button>
                        </div>

                        {clusters.length === 0 ? (
                            <p className="settings-empty">No clusters found. Add one!</p>
                        ) : (
                            <div className="prereq-chips">
                                {clusters.map((c) => (
                                    <div 
                                        key={c.id} 
                                        className="prereq-chip"
                                    >
                                        <span>{c.name}</span>
                                        <button 
                                            onClick={() => { 
                                                setClusterToDelete(c); 
                                                setIsDeleteClusterConfirmOpen(true); 
                                            }} 
                                            className="prereq-chip-remove"
                                            title="Delete Cluster"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <ConfirmModal
                isOpen={isPasswordConfirmOpen}
                title="Change Password"
                message="Are you sure you want to change your password? This will update your login credentials immediately."
                onConfirm={handleChangePassword}
                onCancel={() => setIsPasswordConfirmOpen(false)}
                confirmLabel="Confirm"
                cancelLabel="Cancel"
            />

            <ConfirmModal
                isOpen={isDeleteUserConfirmOpen}
                title="Delete User"
                message={`Are you sure you want to delete the user ${pendingCourse?.email}?`}
                onConfirm={() => {
                    handleDeleteUser(pendingCourse.uid);
                    setIsDeleteUserConfirmOpen(false);
                }}
                onCancel={() => {
                    setIsDeleteUserConfirmOpen(false);
                    setPendingCourse(null);
                }}
                confirmLabel="Yes, Delete"
                cancelLabel="Cancel"
            />

            <ConfirmModal
                isOpen={isDeleteClusterConfirmOpen}
                title="Delete Cluster"
                message={`Are you sure you want to delete "${clusterToDelete?.name}"? Make sure no lessons are currently assigned to this cluster.`}
                onConfirm={() => handleDeleteCluster(clusterToDelete)}
                onCancel={() => {
                    setIsDeleteClusterConfirmOpen(false);
                    setClusterToDelete(null);
                }}
                confirmLabel="Yes, Delete"
                cancelLabel="Cancel"
            />

            {/* מודל הוספת אשכול באמצעות הקומפוננטה הגנרית */}
            <Modal
                isOpen={isClusterModalOpen}
                onClose={() => { setIsClusterModalOpen(false); setNewClusterName(""); }}
                title="Add New Cluster"
                size="normal"
                footer={
                    <>
                        <button 
                            className="ui-btn ui-btn--ghost" 
                            onClick={() => { setIsClusterModalOpen(false); setNewClusterName(""); }}
                        >
                            Cancel
                        </button>
                        <button 
                            className="ui-btn ui-btn--primary" 
                            onClick={handleAddCluster}
                            disabled={!newClusterName.trim()}
                        >
                            Save Cluster
                        </button>
                    </>
                }
            >
                <div className="form-field">
                    <label className="form-label">Cluster/Semester Name</label>
                    <input
                        type="text"
                        placeholder="e.g. סמסטר 1, מגמת סייבר..."
                        value={newClusterName}
                        onChange={(e) => setNewClusterName(e.target.value)}
                        className="ui-input"
                        autoFocus
                    />
                </div>
            </Modal>

        </div>
    );
}