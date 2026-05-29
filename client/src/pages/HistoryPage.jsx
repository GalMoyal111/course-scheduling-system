import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import Button from "../components/ui/Button";
import Toast, { useToast } from "../components/ui/Toast";
import ConfirmModal from "../components/ConfirmModal";
import Modal from "../components/ui/Modal";
import "./HistoryPage.css";
import PageHeader from "../components/ui/PageHeader";

export default function HistoryPage() {
  const { history, fetchHistoryIfNeeded, loadTimetableFromHistory } = useData();
  const { toast, showError, showSuccess, closeToast } = useToast();
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: null, name: "" });

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState({ id: null, name: "" });
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef(null);

  // On component mount, fetch the history data if it's not already loaded. The dependency array includes fetchHistoryIfNeeded to ensure it only runs when that function reference changes (which should be stable due to context).
  useEffect(() => {
    fetchHistoryIfNeeded("HistoryPage");
  }, [fetchHistoryIfNeeded]);

  const handleLoadTimetable = async (id) => {
    setLoadingId(id);
    const success = await loadTimetableFromHistory(id, "HistoryPage");
    setLoadingId(null);

    if (success) {
      navigate("/timetable");
    } else {
      showError("Failed to load timetable. Please try again.");
    }
  };

  // When the user clicks the delete button, open the confirmation modal and set the target timetable to be deleted.
  const handleDelete = (id, name) => {
    setDeleteTarget({ id, name });
    setDeleteOpen(true);
  };

  // When the user confirms deletion, call the API to delete the timetable, show a success message, and refresh the history list. If there's an error, show an error message.
  const confirmDelete = async () => {
    const { id } = deleteTarget;
    setDeleteOpen(false);
    try {
      await (await import("../services/api")).deleteTimetable(id);
      showSuccess("Timetable deleted");
      await fetchHistoryIfNeeded("HistoryPage", true);
    } catch (err) {
      console.error(err);
      showError("Failed to delete timetable");
    }
  };

  // If the user cancels deletion, simply close the modal and reset the target.
  const cancelDelete = () => {
    setDeleteOpen(false);
    setDeleteTarget({ id: null, name: "" });
  };
  //  When the user clicks the rename button, open the rename modal, set the target timetable to be renamed, and pre-fill the input with the current name. After a short delay, focus the input field for better UX.
  const handleRename = (id, currentName) => {
    setRenameTarget({ id, name: currentName });
    setRenameValue(currentName);
    setRenameOpen(true);
    setTimeout(() => renameInputRef.current?.focus(), 80);
  };

  const confirmRename = async () => {
    const newName = renameValue?.trim();
    if (!newName || newName === renameTarget.name) {
      setRenameOpen(false);
      return;
    }
    setRenameOpen(false);
    try {
      await (
        await import("../services/api")
      ).renameTimetable(renameTarget.id, newName);
      showSuccess("Timetable renamed");
      await fetchHistoryIfNeeded("HistoryPage", true);
    } catch (err) {
      console.error(err);
      showError("Failed to rename timetable");
    }
  };

  const cancelRename = () => {
    setRenameOpen(false);
    setRenameTarget({ id: null, name: "" });
    setRenameValue("");
  };

  // Helper function to format the timestamp of when the timetable was created. It converts the timestamp to a localized string in Hebrew format, showing the date and time in a readable way.
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString("he-IL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="history-page">
      <PageHeader
        icon="history"
        title="Saved Timetables"
        subtitle="View and load your previously saved schedules."
      />

      <div className="history-grid">
        {history.length === 0 ? (
          <div className="empty-state">
            <span className="material-icons">history</span>
            <p>No saved timetables found.</p>
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="history-card">
              <div className="history-card-content">
                <h3>{item.name}</h3>
                <span className="semester-badge">Semester {item.semester}</span>
                <div className="date-text">
                  <span className="material-icons">schedule</span>
                  {formatDate(item.createdAt)}
                </div>
              </div>
              <div className="history-card-actions">
                <Button
                  onClick={() => handleLoadTimetable(item.id)}
                  disabled={loadingId === item.id}
                  variant="primary"
                >
                  {loadingId === item.id ? "Loading..." : "Load Timetable"}
                </Button>
                <button
                  className="icon-btn icon-btn--edit"
                  onClick={() => handleRename(item.id, item.name)}
                  title="Rename timetable"
                  aria-label="Rename timetable"
                  style={{ marginLeft: 8 }}
                >
                  <span className="material-icons">edit</span>
                </button>
                <button
                  className="icon-btn icon-btn--delete"
                  onClick={() => handleDelete(item.id, item.name)}
                  title="Delete timetable"
                  aria-label="Delete timetable"
                  style={{ marginLeft: 8 }}
                >
                  <span className="material-icons">delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={deleteOpen}
        title="Delete Saved Timetable"
        message={`Delete saved timetable '${deleteTarget.name}'? This cannot be undone.`}
        fileName={deleteTarget.name}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />

      <Modal
        isOpen={renameOpen}
        onClose={cancelRename}
        title="Rename Timetable"
        size="normal"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
            New name
          </label>
          <input
            ref={renameInputRef}
            className="ui-input"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="Enter new timetable name"
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 16,
          }}
        >
          <Button variant="ghost" onClick={cancelRename}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmRename}>
            Save
          </Button>
        </div>
      </Modal>

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
