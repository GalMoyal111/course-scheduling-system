import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { updatePassword } from "firebase/auth";
import { ROLES } from "../constants/roles";
import {
  getAllUsers,
  updateUserRole,
  createUser,
  deleteUser,
  addCluster,
  deleteClusters,
  updateSystemAvailability,
  updateClassroomSizeSettings,
} from "../services/api";
import ConfirmModal from "../components/ConfirmModal";
import { useData } from "../context/DataContext";
import Modal from "../components/ui/Modal";
import Toast, { useToast } from "../components/ui/Toast";
import PageHeader from "../components/ui/PageHeader";
import "./LecturersPage.css";

// Renders the SettingsPage component.
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
  const { toast, showSuccess, showError, closeToast } = useToast();

  const {
    clusters,
    setClusters,
    fetchClustersIfNeeded,
    invalidateClustersCache,
    systemBlockedSlots,
    setSystemBlockedSlots,
    fetchSystemBlockedSlotsIfNeeded,
    invalidateSystemSlotsCache,
    requiredCapacities,
    setRequiredCapacities,
    electiveCapacity,
    setElectiveCapacity,
    fetchClassroomSizeSettingsIfNeeded,
    invalidateClassroomSizeSettingsCache,
  } = useData();
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
  const [newClusterName, setNewClusterName] = useState("");
  const [isDeleteClusterConfirmOpen, setIsDeleteClusterConfirmOpen] =
    useState(false);
  const [clusterToDelete, setClusterToDelete] = useState(null);

  const [localSlots, setLocalSlots] = useState([]);
  const [hasSlotsChanges, setHasSlotsChanges] = useState(false);
  const [isSavingSlots, setIsSavingSlots] = useState(false);

  const [localRequiredCapacities, setLocalRequiredCapacities] =
    useState(requiredCapacities);
  const [localElectiveCapacity, setLocalElectiveCapacity] =
    useState(electiveCapacity);
  const [hasCapacityChanges, setHasCapacityChanges] = useState(false);
  const [isSavingCapacities, setIsSavingCapacities] = useState(false);

  // Fetch users if admin, and always fetch clusters and system blocked slots on mount
  useEffect(() => {
    // Fetches the users.
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
    fetchSystemBlockedSlotsIfNeeded("SettingsPage");
    fetchClassroomSizeSettingsIfNeeded("SettingsPage");
  }, [
    user,
    fetchClustersIfNeeded,
    fetchSystemBlockedSlotsIfNeeded,
    fetchClassroomSizeSettingsIfNeeded,
  ]);

  useEffect(() => {
    setLocalSlots(systemBlockedSlots || []);
    setHasSlotsChanges(false);
  }, [systemBlockedSlots]);

  useEffect(() => {
    setLocalRequiredCapacities(requiredCapacities);
    setLocalElectiveCapacity(electiveCapacity);
    setHasCapacityChanges(false);
  }, [requiredCapacities, electiveCapacity]);

  // Define the days of the week in Hebrew along with their corresponding indices. This array is used to render the table headers and to identify which day is being interacted with when toggling availability or setting whole day states.
  const hebrewDays = [
    { name: "ראשון", index: 1 },
    { name: "שני", index: 2 },
    { name: "שלישי", index: 3 },
    { name: "רביעי", index: 4 },
    { name: "חמישי", index: 5 },
    { name: "שישי", index: 6 },
  ];

  // Define the time slots for each frame of the day, along with a flag to indicate if the slot is a break. This array is used to render the rows of the availability table and to determine how to handle interactions for each time slot.
  const times = [
    { range: "08:30-09:20", frame: 1, isBreak: false },
    { range: "09:30-10:20", frame: 2, isBreak: false },
    { range: "10:30-11:20", frame: 3, isBreak: false },
    { range: "11:30-12:20", frame: 4, isBreak: false },
    { range: "12:20-12:50", frame: null, isBreak: true },
    { range: "12:50-13:40", frame: 5, isBreak: false },
    { range: "13:50-14:40", frame: 6, isBreak: false },
    { range: "14:50-15:40", frame: 7, isBreak: false },
    { range: "15:50-16:40", frame: 8, isBreak: false },
    { range: "16:50-17:40", frame: 9, isBreak: false },
    { range: "17:50-18:40", frame: 10, isBreak: false },
    { range: "18:50-19:40", frame: 11, isBreak: false },
    { range: "19:50-20:40", frame: 12, isBreak: false },
  ];

  // Handle password change. Validates the new password length, then uses Firebase Auth to update the password for the current user. Shows success or error messages based on the outcome. If the error is due to requiring recent login, prompts the user to log in again.
  const handleChangePassword = async () => {
    try {
      if (!auth.currentUser) {
        showError("No user logged in");
        return;
      }

      // Validate password length
      if (newPassword.length < 6) {
        showError("Password must be at least 6 characters long");
        return;
      }

      await updatePassword(auth.currentUser, newPassword);
      showSuccess("Password updated successfully");
      setNewPassword("");
      setIsPasswordConfirmOpen(false);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/requires-recent-login") {
        showError("Please log in again before changing password");
      } else {
        showError("Failed to update password");
      }
    }
  };

  // Handle role change for a user. Toggles the user's role between ADMIN and USER, then calls the API to update the role in the backend. Updates the local users state to reflect the change and shows success or error messages based on the outcome.
  const handleChangeRole = async (uid, currentRole) => {
    try {
      const token = await auth.currentUser.getIdToken();

      const newRole = currentRole === ROLES.ADMIN ? ROLES.USER : ROLES.ADMIN;

      await updateUserRole(uid, newRole, token);

      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u)),
      );
    } catch (err) {
      console.error(err);
      showError("Failed to update role");
    }
  };

  // Handle user creation. Validates the new password length and checks if the email already exists in the system. If validation passes, calls the API to create a new user with the specified email, password, and role. Updates the local users state to include the new user and shows success or error messages based on the outcome.
  const handleCreateUser = async () => {
    try {
      // Validate password length
      if (newPassword.length < 6) {
        showError("Password must be at least 6 characters long");
        return;
      }

      // Check if email already exists
      const emailExists = users.some(
        (u) => u.email.toLowerCase() === newEmail.toLowerCase(),
      );

      if (emailExists) {
        showError("The user already exists in the system");
        return;
      }

      const token = await auth.currentUser.getIdToken();

      const uid = await createUser(newEmail, newPassword, newRole, token);
      setUsers((prev) => [...prev, { uid, email: newEmail, role: newRole }]);
      showSuccess("User created successfully");
      setNewEmail("");
      setNewPassword("");
      setNewRole(ROLES.USER);
    } catch (err) {
      console.error(err);
      showError("Failed to create user");
    }
  };

  // Handles the delete user action.
  const handleDeleteUser = async (uid) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await deleteUser(uid, token);
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
    } catch (err) {
      console.error(err);
      showError("Failed to delete user");
    }
  };

  // Handle adding a new cluster. Validates that the cluster name is not empty and does not already exist (case-insensitive). If validation passes, calls the API to add the new cluster, updates the local clusters state to include the new cluster, and shows success or error messages based on the outcome.
  const handleAddCluster = async () => {
    const trimmedName = newClusterName.trim();
    if (!trimmedName) {
      showError("Cluster name cannot be empty");
      return;
    }

    const isDuplicate = clusters.some(
      (c) => c.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    );

    if (isDuplicate) {
      showError(`The cluster/semester "${trimmedName}" already exists!`);
      return;
    }

    try {
      const addedCluster = await addCluster({ name: trimmedName });
      setClusters((prev) =>
        [...prev, addedCluster].sort((a, b) => a.number - b.number),
      );
      invalidateClustersCache();
      showSuccess("Cluster added successfully");
      setNewClusterName("");
      setIsClusterModalOpen(false);
    } catch (err) {
      console.error("Failed to add cluster:", err);
      showError("Failed to add cluster");
    }
  };

  // Handle deleting a cluster. Calls the API to delete the specified cluster, updates the local clusters state to remove the deleted cluster, and shows success or error messages based on the outcome. Also handles closing the confirmation modal and resetting the clusterToDelete state.
  const handleDeleteCluster = async (cluster) => {
    try {
      await deleteClusters([cluster]);
      setClusters((prev) => prev.filter((c) => c.id !== cluster.id));
      invalidateClustersCache();
      showSuccess("Cluster deleted successfully");
      setIsDeleteClusterConfirmOpen(false);
      setClusterToDelete(null);
    } catch (err) {
      console.error("Failed to delete cluster:", err);
      showError("Failed to delete cluster");
    }
  };

  //  Handle toggling a time slot for system availability. Checks if the specified slot is currently blocked, then either adds it to or removes it from the localSlots state accordingly. Also sets a flag to indicate that there are unsaved changes to the slots.
  const handleToggleSlot = (dayIndex, startFrame) => {
    const isBlocked = localSlots.some(
      (s) => s.day === dayIndex && s.startFrame === startFrame,
    );
    let newSlots;
    if (isBlocked) {
      newSlots = localSlots.filter(
        (s) => !(s.day === dayIndex && s.startFrame === startFrame),
      );
    } else {
      newSlots = [...localSlots, { day: dayIndex, startFrame: startFrame }];
    }
    setLocalSlots(newSlots);
    setHasSlotsChanges(true);
  };

  // Handles the save system slots action.
  const handleSaveSystemSlots = async () => {
    setIsSavingSlots(true);
    try {
      await updateSystemAvailability(localSlots);
      setSystemBlockedSlots(localSlots);
      invalidateSystemSlotsCache();
      showSuccess("System blocks saved successfully!");
      setHasSlotsChanges(false);
    } catch (err) {
      console.error(err);
      showError("Failed to save system blocks.");
    } finally {
      setIsSavingSlots(false);
    }
  };

  // Handles the save classroom sizes action.
  const handleSaveClassroomSizes = async () => {
    setIsSavingCapacities(true);

    try {
      const settings = {
        lectureSize: localRequiredCapacities.LECTURE,
        tutorialSize: localRequiredCapacities.TUTORIAL,
        labSize: localRequiredCapacities.LAB,
        physicsLabSize: localRequiredCapacities.PHYSICS_LAB,
        networkingLabSize: localRequiredCapacities.NETWORKING_LAB,
        electiveCourseSize: localElectiveCapacity,
      };

      await updateClassroomSizeSettings(settings);

      setRequiredCapacities(localRequiredCapacities);
      setElectiveCapacity(localElectiveCapacity);
      invalidateClassroomSizeSettingsCache();

      showSuccess("Classroom size settings saved successfully!");
      setHasCapacityChanges(false);
    } catch (err) {
      console.error(err);
      showError("Failed to save classroom size settings.");
    } finally {
      setIsSavingCapacities(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <PageHeader
          icon="settings"
          title="Settings"
          subtitle="Manage your account and system preferences"
        />

        {/* Password Section */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span className="material-icons settings-section-icon">lock</span>
            <div>
              <h2 className="settings-section-title">Change Password</h2>
              <p className="settings-section-desc">
                Update your account password
              </p>
            </div>
          </div>
          <div className="settings-section-content">
            <div className="form-group">
              <label htmlFor="new-password" className="form-label">
                New Password
              </label>
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
              title={
                newPassword.length < 6
                  ? "Password must be at least 6 characters"
                  : ""
              }
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
                <span className="material-icons settings-section-icon">
                  person_add
                </span>
                <div>
                  <h2 className="settings-section-title">Create New User</h2>
                  <p className="settings-section-desc">
                    Add a new user to the system
                  </p>
                </div>
              </div>
              <div className="settings-section-content">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="new-email" className="form-label">
                      Email
                    </label>
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
                    <label htmlFor="new-user-password" className="form-label">
                      Password
                    </label>
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
                        onClick={() =>
                          setShowCreateUserPassword(!showCreateUserPassword)
                        }
                        className="password-toggle-btn"
                        aria-label={
                          showCreateUserPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showCreateUserPassword ? (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                              fill="currentColor"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11.83 9L5.5 2.62C4.96 2.9 4.46 3.25 4 3.67v.02c-2.14 2.43-3.85 5.58-4.82 9.31.59 1.56 1.35 3.06 2.25 4.41l1.46-1.46C3.21 14.6 3 13.34 3 12c0-4.97 4-9 9-9c-1.34 0-2.6-.21-3.82-.57l-2.12 2.12c-1.41 1.41-3.71 1.41-5.12 0s-1.41-3.71 0-5.12L20.91 13.93zM12 18c2.76 0 5-2.24 5-5 0-.65-.13-1.26-.36-1.83l-6.47 6.47c.57.23 1.18.36 1.83.36z"
                              fill="currentColor"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="user-role" className="form-label">
                      Role
                    </label>
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
                  title={
                    newPassword.length < 6
                      ? "Password must be at least 6 characters"
                      : ""
                  }
                >
                  <span className="material-icons btn-icon">add</span>
                  Create User
                </button>
              </div>
            </div>

            {/* Users Management Section */}
            <div className="settings-section">
              <div className="settings-section-header">
                <span className="material-icons settings-section-icon">
                  people
                </span>
                <div>
                  <h2 className="settings-section-title">Manage Users</h2>
                  <p className="settings-section-desc">
                    View and manage system users
                  </p>
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
                            <span
                              className={`user-role-badge user-role-${u.role}`}
                            >
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
                            <span className="material-icons btn-icon">
                              edit
                            </span>
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
                            <span className="material-icons btn-icon">
                              delete
                            </span>
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
            <span className="material-icons settings-section-icon">
              category
            </span>
            <div>
              <h2 className="settings-section-title">
                Manage Clusters (Semesters)
              </h2>
              <p className="settings-section-desc">
                Add or remove clusters that appear in dropdowns
              </p>
            </div>
          </div>
          <div className="settings-section-content">
            <div
              style={{
                backgroundColor: "#fffbeb",
                borderLeft: "4px solid #f59e0b",
                padding: "12px 16px",
                marginBottom: "20px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              <span
                className="material-icons"
                style={{ color: "#d97706", fontSize: "20px", marginTop: "2px" }}
              >
                info
              </span>
              <p
                style={{
                  margin: 0,
                  color: "#92400e",
                  fontSize: "0.9rem",
                  lineHeight: "1.4",
                }}
              >
                <strong>Important Note:</strong> The first 8 clusters added
                represent regular semesters (1-8). Any subsequent clusters added
                will be treated as elective clusters.{" "}
                <strong>Insertion order matters!</strong>
              </p>
            </div>

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
                  <div key={c.id} className="prereq-chip">
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

        {/* Default Classroom Size Requirements Section */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span className="material-icons settings-section-icon">groups</span>
            <div>
              <h2 className="settings-section-title">
                Default Classroom Size Requirements
              </h2>
              <p className="settings-section-desc">
                Define the default number of students for each lesson type.
                These values are used by the scheduling algorithm unless a
                course-specific override is defined.
              </p>
            </div>
          </div>

          <div className="settings-section-content">
            <div
              style={{
                marginBottom: "16px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={handleSaveClassroomSizes}
                className="ui-btn ui-btn--primary"
                disabled={!hasCapacityChanges || isSavingCapacities}
                style={{
                  backgroundColor: hasCapacityChanges ? "#10b981" : "",
                  borderColor: hasCapacityChanges ? "#10b981" : "",
                  opacity: !hasCapacityChanges || isSavingCapacities ? 0.6 : 1,
                }}
              >
                <span className="material-icons btn-icon">save</span>
                {isSavingCapacities ? "Saving..." : "Save Classroom Sizes"}
              </button>
            </div>

            <div
              className="capacity-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginTop: "20px",
              }}
            >
              {Object.entries(localRequiredCapacities).map(([type, value]) => {
                const typeIcons = {
                  LECTURE: "school",
                  TUTORIAL: "groups",
                  LAB: "science",
                  PHYSICS_LAB: "bolt",
                  NETWORKING_LAB: "router",
                };

                const typeColors = {
                  LECTURE: "#3b82f6",
                  TUTORIAL: "#10b981",
                  LAB: "#f59e0b",
                  PHYSICS_LAB: "#8b5cf6",
                  NETWORKING_LAB: "#ec4899",
                };

                return (
                  <div
                    key={type}
                    style={{
                      background:
                        "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                      border: `2px solid ${typeColors[type]}20`,
                      borderRadius: "12px",
                      padding: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "12px",
                      }}
                    >
                      <span
                        className="material-icons"
                        style={{
                          color: typeColors[type],
                          fontSize: "24px",
                        }}
                      >
                        {typeIcons[type]}
                      </span>

                      <label
                        style={{
                          fontSize: "0.9rem",
                          color: "#1e293b",
                          fontWeight: "700",
                          margin: 0,
                          textTransform: "capitalize",
                        }}
                      >
                        {type.replace("_", " ").toLowerCase()}
                      </label>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <input
                        type="number"
                        className="settings-input"
                        value={value}
                        min="1"
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setLocalRequiredCapacities((prev) => ({
                            ...prev,
                            [type]: val,
                          }));
                          setHasCapacityChanges(true);
                        }}
                      />

                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                          fontWeight: "600",
                          whiteSpace: "nowrap",
                        }}
                      >
                        students
                      </span>
                    </div>
                  </div>
                );
              })}

              <div
                style={{
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  border: "2px solid #a78bfa20",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    className="material-icons"
                    style={{
                      color: "#a78bfa",
                      fontSize: "24px",
                    }}
                  >
                    star
                  </span>

                  <label
                    style={{
                      fontSize: "0.9rem",
                      color: "#1e293b",
                      fontWeight: "700",
                      margin: 0,
                    }}
                  >
                    Elective courses
                  </label>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <input
                    type="number"
                    className="settings-input"
                    value={localElectiveCapacity}
                    min="1"
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setLocalElectiveCapacity(val);
                      setHasCapacityChanges(true);
                    }}
                  />

                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748b",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                    }}
                  >
                    students
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Global System Constraints Section */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span className="material-icons settings-section-icon">
              event_busy
            </span>
            <div>
              <h2 className="settings-section-title">
                Global System Constraints
              </h2>
              <p className="settings-section-desc">
                Select slots that should be completely blocked for all courses
                (e.g., Active Breaks)
              </p>
            </div>
          </div>
          <div className="settings-section-content">
            <div
              style={{
                marginBottom: "16px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={handleSaveSystemSlots}
                className="ui-btn ui-btn--primary"
                disabled={!hasSlotsChanges || isSavingSlots}
                style={{
                  backgroundColor: hasSlotsChanges ? "#10b981" : "",
                  borderColor: hasSlotsChanges ? "#10b981" : "",
                  opacity: !hasSlotsChanges || isSavingSlots ? 0.6 : 1,
                }}
              >
                <span className="material-icons btn-icon">save</span>
                {isSavingSlots ? "Saving..." : "Save Constraints"}
              </button>
            </div>

            <div
              className="availability-table-wrapper"
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "8px",
                background: "white",
              }}
            >
              <table className="availability-table">
                <thead>
                  <tr>
                    <th className="time-column">Time</th>
                    {hebrewDays.map((day) => (
                      <th key={day.index} className="day-column">
                        <div className="day-hebrew">{day.name}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {times.map((timeItem) => (
                    <tr
                      key={timeItem.range}
                      className={timeItem.isBreak ? "break-row" : ""}
                    >
                      <td
                        className={`time-cell ${timeItem.isBreak ? "break-time" : ""}`}
                      >
                        {timeItem.range}
                      </td>
                      {hebrewDays.map((day) => {
                        if (timeItem.isBreak) {
                          return (
                            <td
                              key={`${day.index}-${timeItem.range}`}
                              className="availability-cell break-cell"
                            >
                              Break
                            </td>
                          );
                        }

                        const isBlocked = localSlots.some(
                          (s) =>
                            s.day === day.index &&
                            s.startFrame === timeItem.frame,
                        );
                        const cellClass = isBlocked
                          ? "unavailable"
                          : "available";

                        return (
                          <td
                            key={`${day.index}-${timeItem.frame}`}
                            className={`availability-cell ${cellClass}`}
                            onClick={() =>
                              handleToggleSlot(day.index, timeItem.frame)
                            }
                          />
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      <Modal
        isOpen={isClusterModalOpen}
        onClose={() => {
          setIsClusterModalOpen(false);
          setNewClusterName("");
        }}
        title="Add New Cluster"
        size="normal"
        footer={
          <>
            <button
              className="ui-btn ui-btn--ghost"
              onClick={() => {
                setIsClusterModalOpen(false);
                setNewClusterName("");
              }}
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
          <div
            style={{
              backgroundColor: "#fffbeb",
              borderLeft: "4px solid #f59e0b",
              padding: "10px 14px",
              marginBottom: "16px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <span
              className="material-icons"
              style={{ color: "#d97706", fontSize: "18px", marginTop: "2px" }}
            >
              warning
            </span>
            <p
              style={{
                margin: 0,
                color: "#92400e",
                fontSize: "0.85rem",
                lineHeight: "1.4",
                textAlign: "left",
              }}
            >
              <strong>Reminder:</strong> The first 8 clusters added are
              automatically designated as Semesters 1-8. Subsequent clusters
              will be categorized as Elective Clusters. Please mind the
              insertion order!
            </p>
          </div>

          <input
            type="text"
            placeholder="e.g. סמסטר 1, אלגוריתמים..."
            value={newClusterName}
            onChange={(e) => setNewClusterName(e.target.value)}
            className="ui-input"
            autoFocus
          />
        </div>
      </Modal>

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
