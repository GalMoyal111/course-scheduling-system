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


    const handleChangePassword = async () => {
        try {
            if (!auth.currentUser) {
                alert("No user logged in");
                return;
            }

            await updatePassword(auth.currentUser, newPassword);
            alert("Password updated successfully");
            setNewPassword("");
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
        <div>
        <h2>Settings</h2>

        <div style={{ marginBottom: 30 }}>
            <h3>Change Password</h3>

            <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            />

            <button onClick={handleChangePassword}>
            Update Password
            </button>
        </div>

        {user?.role === ROLES.ADMIN && (
            <div>
            <h3>Admin Panel</h3>
                <h3>create users</h3>
                <input
                    type="email"
                    placeholder="Email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                />  
                <input
                    type="password"
                    placeholder="Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    >
                    <option value={ROLES.USER}>User</option>
                    <option value={ROLES.ADMIN}>Admin</option>
                </select>
                <button onClick={handleCreateUser}>
                    Create User
                </button>

            {users.map((u) => (
                <div key={u.uid} style={{ marginBottom: 10 }}>
                    {u.email} - {u.role}

                    <button
                    onClick={() => handleChangeRole(u.uid, u.role)}
                    style={{ marginLeft: 10 }}
                    >
                        Change Role
                    </button>
                    <button
                        onClick={() => handleDeleteUser(u.uid)}
                        style={{ marginLeft: 10, color: "red" }}
                        >
                        Delete
                    </button>
                </div>
            ))}
            </div>
        )}
        </div>
    );
    }