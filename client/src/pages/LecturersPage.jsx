import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Button from "../components/ui/Button";
import AddLecturerModal from "../components/AddLecturerModal";
import UploadForm from "../components/UploadForm";
import { useData } from "../context/DataContext";
import {
  addLecturer,
  deleteLecturers,
  updateLecturer,
  uploadLecturersExcel,
  exportLecturersExcel,
  getLatestLecturerUploadSummary,
} from "../services/api";
import Toast, { useToast } from "../components/ui/Toast";
import "./LecturersPage.css";
import ConfirmModal from "../components/ConfirmModal";
import Modal from "../components/ui/Modal";
import { useLocation } from "react-router-dom";

export default function LecturersPage() {
  const {
    lecturers,
    setLecturers,
    fetchLecturersIfNeeded,
    setLecturersTimestamp,
    invalidateLecturersCache,
  } = useData();

  const { toast, showSuccess, showError, closeToast } = useToast();

  const [selectedLecturerId, setSelectedLecturerId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lecturerToPendingDelete, setLecturerToPendingDelete] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLecturers, setSelectedLecturers] = useState([]);
  const [isMultiDeleteModalOpen, setIsMultiDeleteModalOpen] = useState(false);

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [uploadSummary, setUploadSummary] = useState({
    totalRows: 0,
    savedLecturers: 0,
    invalidSlots: [],
  });

  const location = useLocation();
  const [isHighlightUpload, setIsHighlightUpload] = useState(false);
  const lecturerPanelRef = useRef(null);

  const keyFor = (lecturer) => lecturer.id || lecturer.name;

  const loadLecturers = useCallback(async () => {
    await fetchLecturersIfNeeded("LecturersPage");
  }, [fetchLecturersIfNeeded]);

  useEffect(() => {
    loadLecturers();
  }, [loadLecturers]);

  useEffect(() => {
    if (location.state?.highlightUpload) {
      setIsHighlightUpload(true);

      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
      window.history.replaceState({}, document.title);

      const timer = setTimeout(() => {
        setIsHighlightUpload(false);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [location]);

  const selectedLecturer = lecturers.find((l) => l.id === selectedLecturerId);

  const filteredLecturers = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();

    let listToRender = !q
      ? lecturers
      : lecturers.filter((l) => (l.name || "").toLowerCase().includes(q));

    return [...listToRender].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", "he"),
    );
  }, [lecturers, searchQuery]);

  // Handle adding a new lecturer. First checks for duplicates by comparing the trimmed name against existing lecturers. If a duplicate is found, shows an error toast and aborts. If not, calls the API to add the lecturer, then updates the local state with the new lecturer returned from the server, shows a success toast, and closes the modal.
  const handleAddLecturer = async (newLecturer) => {
    const isDuplicate = lecturers.some(
      (l) => l.name.trim() === newLecturer.name.trim(),
    );

    if (isDuplicate) {
      showError(
        `The lecturer "${newLecturer.name}" already exists in the system.`,
      );
      return;
    }

    try {
      const addedLecturerFromServer = await addLecturer(newLecturer);
      showSuccess("Lecturer added successfully!");

      setLecturers((prev) => [...prev, addedLecturerFromServer]);
      setLecturersTimestamp(Date.now());

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showError("Error adding lecturer");
    }
  };

  // const handleEditLecturer = async (updatedLecturer) => {
  //   try {
  //     await updateLecturer(updatedLecturer);
  //     showSuccess("Lecturer updated successfully!");

  //     setLecturers(prev =>
  //       prev.map(l => l.id === updatedLecturer.id ? updatedLecturer : l)
  //     );

  //     setIsModalOpen(false);
  //     setEditingLecturer(null);
  //     setLecturersTimestamp(Date.now());

  //   } catch (err) {
  //     console.error(err);
  //     showError("Error updating lecturer");
  //   }
  // };

  // Handle editing an existing lecturer. First checks for duplicates by comparing the trimmed name against existing lecturers, excluding the lecturer being edited. If a duplicate is found, shows an error toast and aborts. If not, calls the API to update the lecturer, then updates the local state with the modified lecturer, shows a success toast, and closes the modal.
  const handleEditLecturer = async (updatedLecturer) => {
    const isDuplicate = lecturers.some(
      (l) =>
        l.id !== updatedLecturer.id &&
        l.name.trim() === updatedLecturer.name.trim(),
    );

    if (isDuplicate) {
      showError(
        `The lecturer "${updatedLecturer.name}" already exists in the system.`,
      );
      return;
    }

    try {
      await updateLecturer(updatedLecturer);
      showSuccess("Lecturer updated successfully!");

      setLecturers((prev) =>
        prev.map((l) => (l.id === updatedLecturer.id ? updatedLecturer : l)),
      );

      setIsModalOpen(false);
      setEditingLecturer(null);
      setLecturersTimestamp(Date.now());
    } catch (err) {
      console.error(err);
      showError("Error updating lecturer");
    }
  };

  // Handle delete button click for a lecturer. Sets the lecturer to be potentially deleted in state and opens the delete confirmation modal. The actual deletion is performed in the performDelete function, which is called when the user confirms the deletion in the modal.
  const handleDeleteClick = (e, lecturer) => {
    e.stopPropagation();
    setLecturerToPendingDelete(lecturer);
    setIsDeleteModalOpen(true);
  };

  const performDelete = async () => {
    if (!lecturerToPendingDelete) return;

    try {
      await deleteLecturers([lecturerToPendingDelete]);
      showSuccess("Lecturer deleted successfully!");
      invalidateLecturersCache();

      const keyToDelete = keyFor(lecturerToPendingDelete);
      const updatedList = lecturers.filter((l) => keyFor(l) !== keyToDelete);

      setLecturers(updatedList);
      setLecturersTimestamp(Date.now());

      if (selectedLecturer && keyFor(selectedLecturer) === keyToDelete) {
        setHasUnsavedChanges(false);
        setSelectedLecturerId(
          updatedList.length > 0 ? updatedList[0].id : null,
        );
      }
    } catch (err) {
      console.error(err);
      showError("Error deleting lecturer");
    } finally {
      setIsDeleteModalOpen(false);
      setLecturerToPendingDelete(null);
    }
  };

  // Handle multi-delete action for selected lecturers. If no lecturers are selected, it simply returns. Otherwise, it calls the API to delete all selected lecturers, shows a success toast, and updates the local state by removing the deleted lecturers from the list. It also checks if the currently selected lecturer was among those deleted, and if so, it clears the selection or selects another lecturer if available. Finally, it closes the multi-delete confirmation modal.
  const performMultiDelete = async () => {
    if (selectedLecturers.length === 0) return;

    try {
      await deleteLecturers(selectedLecturers);
      showSuccess("Selected lecturers deleted successfully!");
      invalidateLecturersCache();

      const deletedKeys = new Set(selectedLecturers.map(keyFor));
      const updatedList = lecturers.filter((l) => !deletedKeys.has(keyFor(l)));

      setLecturers(updatedList);
      setLecturersTimestamp(Date.now());
      setSelectedLecturers([]);

      if (selectedLecturer && deletedKeys.has(keyFor(selectedLecturer))) {
        setHasUnsavedChanges(false);
        setSelectedLecturerId(
          updatedList.length > 0 ? updatedList[0].id : null,
        );
      }
    } catch (err) {
      console.error(err);
      showError("Error deleting selected lecturers");
    } finally {
      setIsMultiDeleteModalOpen(false);
    }
  };

  // This function toggles the availability of a specific time slot for the selected lecturer. It checks if the slot is currently marked as hard (unavailable) or soft (non-preferred) and updates the lecturer's unavailableSlots and nonPreferredSlots accordingly. The logic follows a cycle: if the slot is currently available, it becomes non-preferred; if it's non-preferred, it becomes unavailable; if it's unavailable, it becomes available again. After updating the slots, it marks that there are unsaved changes.
  const handleToggleAvailability = (dayIndex, startFrame) => {
    setLecturers(
      lecturers.map((lecturer) => {
        if (lecturer.id === selectedLecturerId) {
          const hardSlots = lecturer.unavailableSlots || [];
          const softSlots = lecturer.nonPreferredSlots || [];

          const isHard = hardSlots.some(
            (slot) => slot.day === dayIndex && slot.startFrame === startFrame,
          );
          const isSoft = softSlots.some(
            (slot) => slot.day === dayIndex && slot.startFrame === startFrame,
          );

          let newHardSlots = [...hardSlots];
          let newSoftSlots = [...softSlots];

          // Logic: Available (neither) -> Prefer Not To (Soft) -> Unavailable (Hard) -> Available
          if (!isHard && !isSoft) {
            // Move to Soft
            newSoftSlots.push({ day: dayIndex, startFrame: startFrame });
          } else if (isSoft) {
            // Move from Soft to Hard
            newSoftSlots = newSoftSlots.filter(
              (slot) =>
                !(slot.day === dayIndex && slot.startFrame === startFrame),
            );
            newHardSlots.push({ day: dayIndex, startFrame: startFrame });
          } else if (isHard) {
            // Move from Hard to Available
            newHardSlots = newHardSlots.filter(
              (slot) =>
                !(slot.day === dayIndex && slot.startFrame === startFrame),
            );
          }

          setHasUnsavedChanges(true);
          return {
            ...lecturer,
            unavailableSlots: newHardSlots,
            nonPreferredSlots: newSoftSlots,
          };
        }
        return lecturer;
      }),
    );
  };

  // This function handles setting the availability for an entire day. It first removes any existing hard or soft slots for that day, then if the new state is not "available", it adds the appropriate slots for the whole day. For "unavailable", it adds hard slots for all frames of that day (except system-blocked slots). For "non-preferred", it adds soft slots for all frames of that day (except system-blocked slots). Finally, it updates the lecturer's availability and marks that there are unsaved changes.
  const handleSetWholeDay = (dayIndex, state) => {
    setLecturers(
      lecturers.map((lecturer) => {
        if (lecturer.id === selectedLecturerId) {
          let newHardSlots = [...(lecturer.unavailableSlots || [])];
          let newSoftSlots = [...(lecturer.nonPreferredSlots || [])];

          newHardSlots = newHardSlots.filter((slot) => slot.day !== dayIndex);
          newSoftSlots = newSoftSlots.filter((slot) => slot.day !== dayIndex);

          if (state !== "available") {
            const framesToAdd = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter(
              (frame) => {
                const isBlockedSystemSlot = dayIndex === 6 && frame >= 5;
                return !isBlockedSystemSlot;
              },
            );

            const newSlots = framesToAdd.map((frame) => ({
              day: dayIndex,
              startFrame: frame,
            }));

            if (state === "unavailable") {
              newHardSlots.push(...newSlots);
            } else if (state === "non-preferred") {
              newSoftSlots.push(...newSlots);
            }
          }

          setHasUnsavedChanges(true);
          return {
            ...lecturer,
            unavailableSlots: newHardSlots,
            nonPreferredSlots: newSoftSlots,
          };
        }
        return lecturer;
      }),
    );
  };

  const saveAvailabilityChanges = async () => {
    if (!selectedLecturer) return;
    setIsSaving(true);
    try {
      await updateLecturer(selectedLecturer);
      setHasUnsavedChanges(false);
      showSuccess("Availability saved successfully!");
      setLecturersTimestamp(Date.now());
    } catch (err) {
      console.error(err);
      showError("Error saving availability");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectLecturer = (id) => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Switch anyway?",
      );
      if (!confirmLeave) return;
      setHasUnsavedChanges(false);
      loadLecturers();
    }

    setSelectedLecturerId(id);

    setTimeout(() => {
      lecturerPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const toggleLecturerSelection = (e, lecturer) => {
    e.stopPropagation();
    const key = keyFor(lecturer);

    setSelectedLecturers((prev) => {
      const isSelected = prev.some((l) => keyFor(l) === key);
      if (isSelected) {
        return prev.filter((l) => keyFor(l) !== key);
      } else {
        return [...prev, lecturer];
      }
    });
  };

  const handleUpload = async (file) => {
    // Show confirmation before performing an upload that overwrites data
    if (!file) return;
    setPendingFile(file);
    setConfirmOpen(true);
  };

  const performUpload = async () => {
    if (!pendingFile) return;
    setConfirmOpen(false);
    const fileToUpload = pendingFile;
    setPendingFile(null);

    try {
      const result = await uploadLecturersExcel(fileToUpload);
      setUploadSummary(result);
      setIsSummaryModalOpen(true);

      invalidateLecturersCache();
      await fetchLecturersIfNeeded("LecturersPage", true);
    } catch (err) {
      console.error("Detailed upload error:", err);
      showError("Error uploading file");
    }
  };

  const cancelUpload = () => {
    setConfirmOpen(false);
    setPendingFile(null);
  };

  // Handle exporting lecturers' availability to an Excel file. This function calls the API to generate the Excel file as a blob, creates a temporary URL for it, and programmatically clicks a link to trigger the download of the file named "lecturers_availability.xlsx". If there is an error during this process, it shows an error toast.
  const handleExport = async () => {
    try {
      const blob = await exportLecturersExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lecturers-${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
    } catch (err) {
      showError("Error exporting file");
    }
  };

  // Handle showing the latest upload summary. This function calls the API to get the most recent lecturer upload summary, which includes the total number of rows processed, how many lecturers were successfully saved, and any invalid time slots that were found. If a summary is retrieved successfully, it updates the state with the summary data and opens a modal to display it. If there is an error or no summary is found, it shows an appropriate error message.
  const handleShowLatestSummary = async () => {
    try {
      const summary = await getLatestLecturerUploadSummary();

      if (!summary) {
        showError("No recent upload summary found.");
        return;
      }

      setUploadSummary(summary);
      setIsSummaryModalOpen(true);
    } catch (error) {
      console.error(error);
      showError("Failed to load summary.");
    }
  };

  return (
    <div className="lecturers-page">
      {/* Top upload + actions section */}
      <div className="lecturers-top-section" style={{ marginBottom: 12 }}>
        <div
          className="toolbar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div />
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              onClick={() => {
                setIsModalOpen(true);
                setEditingLecturer(null);
              }}
              variant="secondary"
            >
              <span
                className="material-icons"
                style={{ fontSize: 18, marginRight: 8 }}
              >
                add
              </span>
              Add a lecturer
            </Button>

            <Button onClick={handleShowLatestSummary} variant="secondary">
              <span
                className="material-icons"
                style={{ fontSize: 18, marginRight: 8 }}
              >
                history
              </span>
              Latest Summary
            </Button>
            <Button onClick={handleExport} variant="primary">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                style={{ marginRight: 8 }}
              >
                <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 10l5-5 5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 5v12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Export
            </Button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div
            className={isHighlightUpload ? "upload-highlight-active" : ""}
            style={{ transition: "all 0.3s" }}
          >
            <UploadForm onUpload={handleUpload} />
          </div>
        </div>
      </div>

      <div className="lecturers-container">
        {/* Sidebar */}
        <div className="lecturers-sidebar">
          <div className="lecturers-header" />

          <div className="lecturers-list">
            {/* Search input */}
            <div
              style={{
                padding: 8,
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder="Search lecturers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                }}
              />
              {searchQuery && (
                <button
                  className="icon-btn"
                  onClick={() => setSearchQuery("")}
                  title="Clear"
                  style={{ padding: "6px 8px" }}
                >
                  <span className="material-icons">close</span>
                </button>
              )}
            </div>

            {lecturers.length === 0 ? (
              <div
                className="empty-state-sidebar"
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#64748b",
                }}
              >
                <span
                  className="material-icons"
                  style={{
                    fontSize: "48px",
                    color: "#e2e8f0",
                    marginBottom: "12px",
                  }}
                >
                  person_off
                </span>
                <p
                  style={{ fontSize: "0.9rem", fontWeight: "600", margin: "0" }}
                >
                  No lecturers yet
                </p>
                <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>
                  Add your first lecturer to start.
                </p>
              </div>
            ) : filteredLecturers.length === 0 ? (
              <div
                className="empty-state-sidebar"
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#64748b",
                }}
              >
                <span
                  className="material-icons"
                  style={{
                    fontSize: "48px",
                    color: "#e2e8f0",
                    marginBottom: "12px",
                  }}
                >
                  search_off
                </span>
                <p
                  style={{ fontSize: "0.9rem", fontWeight: "600", margin: "0" }}
                >
                  No results
                </p>
                <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>
                  Try a different search term.
                </p>
              </div>
            ) : (
              filteredLecturers.map((lecturer) => {
                const key = keyFor(lecturer);
                const isChecked = selectedLecturers.some(
                  (l) => keyFor(l) === key,
                );

                return (
                  <div
                    key={key}
                    className={`lecturer-item ${selectedLecturerId === lecturer.id ? "active" : ""}`}
                    onClick={() => handleSelectLecturer(lecturer.id)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      direction: "rtl",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => toggleLecturerSelection(e, lecturer)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          cursor: "pointer",
                          width: "16px",
                          height: "16px",
                          margin: 0,
                        }}
                      />
                      <p className="lecturer-name" style={{ margin: 0 }}>
                        {lecturer.name}
                      </p>
                    </div>

                    <button
                      className="icon-btn icon-btn--delete"
                      onClick={(e) => handleDeleteClick(e, lecturer)}
                      title="Delete"
                      style={{ padding: "4px" }}
                    >
                      <span
                        className="material-icons"
                        style={{ fontSize: "18px" }}
                      >
                        delete
                      </span>
                    </button>
                  </div>
                );
              })
            )}

            <div
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "flex-start",
                gap: 8,
                paddingBottom: 8,
                borderTop: "1px solid #f1f5f9",
                paddingTop: 16,
              }}
            >
              <Button
                variant="ghost"
                onClick={() => setIsMultiDeleteModalOpen(true)}
                disabled={!selectedLecturers || selectedLecturers.length === 0}
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <span className="material-icons">delete</span>
                Delete selected ({selectedLecturers?.length || 0})
              </Button>
            </div>
          </div>
        </div>

        {/* Main Panel */}
        {selectedLecturer ? (
          <div className="lecturer-details-panel" ref={lecturerPanelRef}>
            <div className="details-header">
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <h1 dir="rtl">{selectedLecturer.name}</h1>
                <button
                  className="edit-icon-btn"
                  onClick={() => {
                    setEditingLecturer(selectedLecturer);
                    setIsModalOpen(true);
                  }}
                  title="Edit Name"
                >
                  <span className="material-icons">edit</span>
                </button>
              </div>
            </div>

            <div className="availability-section">
              <div className="availability-header-row">
                <div>
                  <h3>Weekly Availability</h3>
                  <p className="availability-hint">
                    Click to toggle: Green = Available ➔ Orange = Prefer Not To
                    ➔ Red = Blocked.
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={saveAvailabilityChanges}
                  disabled={isSaving || !hasUnsavedChanges}
                  style={{
                    backgroundColor: hasUnsavedChanges ? "#10b981" : "#94a3b8",
                    borderColor: hasUnsavedChanges ? "#10b981" : "#94a3b8",
                  }}
                >
                  <span
                    className="material-icons"
                    style={{ fontSize: "18px", marginRight: "6px" }}
                  >
                    save
                  </span>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>

              <AvailabilityTable
                lecturer={selectedLecturer}
                onToggle={handleToggleAvailability}
                onSetWholeDay={handleSetWholeDay}
              />
            </div>
          </div>
        ) : (
          <div
            className="lecturer-details-panel"
            style={{
              alignItems: "center",
              color: "#94a3b8",
              paddingTop: "90px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <span
                className="material-icons"
                style={{ fontSize: "64px", marginBottom: "16px", opacity: 0.5 }}
              >
                touch_app
              </span>
              <h2>Select a Lecturer</h2>
              <p>
                Choose a lecturer from the sidebar to manage their availability.
              </p>
            </div>
          </div>
        )}
      </div>

      <AddLecturerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLecturer(null);
        }}
        onSave={editingLecturer ? handleEditLecturer : handleAddLecturer}
        initialLecturer={editingLecturer}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Lecturer"
        message="Are you sure you want to delete this lecturer? This action cannot be undone."
        fileName={lecturerToPendingDelete ? lecturerToPendingDelete.name : ""}
        onConfirm={performDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setLecturerToPendingDelete(null);
        }}
        confirmLabel="Yes, Delete"
        cancelLabel="No, Keep"
      />
      <ConfirmModal
        isOpen={confirmOpen}
        title="Upload will overwrite existing data"
        message={
          "Note: uploading a new file will completely delete everything that existed in the system."
        }
        fileName={pendingFile ? pendingFile.name : ""}
        onConfirm={performUpload}
        onCancel={cancelUpload}
        confirmLabel="Yes, upload"
        cancelLabel="No, cancel"
      />

      <ConfirmModal
        isOpen={isMultiDeleteModalOpen}
        title="Delete Selected Lecturers"
        message={`Are you sure you want to delete ${selectedLecturers.length} lecturers? This action cannot be undone.`}
        fileName=""
        onConfirm={performMultiDelete}
        onCancel={() => setIsMultiDeleteModalOpen(false)}
        confirmLabel="Yes, Delete All"
        cancelLabel="No, Cancel"
      />

      <LecturerUploadSummaryModal
        isOpen={isSummaryModalOpen}
        summary={uploadSummary}
        onClose={() => setIsSummaryModalOpen(false)}
      />

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

// This component displays a summary of the results after uploading lecturers via Excel. It shows how many lecturers were saved, how many rows were processed, and any format errors that caused certain rows to be skipped. The modal has a close button to dismiss the summary. The styling emphasizes the success of saved lecturers and highlights any errors in a clear way.
function LecturerUploadSummaryModal({ isOpen, summary, onClose }) {
  if (!isOpen) return null;

  const footer = (
    <Button
      variant="primary"
      onClick={onClose}
      style={{ width: "100%", padding: "10px", fontWeight: "600" }}
    >
      Close Summary
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Summary"
      size="normal"
      footer={footer}
    >
      <div
        style={{
          textAlign: "center",
          backgroundColor: "#f0fdf4",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "24px",
          border: "1px solid #dcfce7",
        }}
      >
        <div style={{ color: "#166534", fontWeight: "700", fontSize: "18px" }}>
          ✓ {summary.savedLecturers} Lecturers Saved
        </div>
        <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
          Out of {summary.totalRows} rows processed
        </div>
      </div>

      {summary.invalidSlots && summary.invalidSlots.length > 0 && (
        <div className="summary-section" style={{ marginBottom: "20px" }}>
          <h4
            style={{
              fontSize: "14px",
              color: "#b45309",
              textTransform: "uppercase",
              borderBottom: "1px solid #fde68a",
              paddingBottom: "4px",
              marginBottom: "8px",
              textAlign: "left",
            }}
          >
            Format Errors (Skipped)
          </h4>
          <div
            style={{
              maxHeight: "120px",
              overflowY: "auto",
              paddingLeft: "5px",
              textAlign: "left",
            }}
          >
            {summary.invalidSlots.map((issue, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: "13px",
                  marginBottom: "4px",
                  color: "#4b5563",
                }}
              >
                • {issue}
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.savedLecturers === 0 && (
        <p
          style={{
            color: "#ef4444",
            textAlign: "center",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          No lecturers were imported. Please fix the errors above.
        </p>
      )}
    </Modal>
  );
}

function AvailabilityTable({ lecturer, onToggle, onSetWholeDay }) {
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

  return (
    <div className="availability-table-wrapper">
      <table className="availability-table">
        <thead>
          <tr>
            <th className="time-column">Time</th>
            {hebrewDays.map((day) => (
              <th key={day.index} className="day-column">
                <div className="day-hebrew">{day.name}</div>

                <div className="day-actions">
                  <div
                    className="custom-tooltip"
                    data-tooltip="marke as available for the whole day"
                  >
                    <button
                      className="day-action-btn green"
                      onClick={() => onSetWholeDay(day.index, "available")}
                    />
                  </div>
                  <div
                    className="custom-tooltip"
                    data-tooltip="prefer not to have lessons for the whole day"
                  >
                    <button
                      className="day-action-btn orange"
                      onClick={() => onSetWholeDay(day.index, "non-preferred")}
                    />
                  </div>
                  <div
                    className="custom-tooltip"
                    data-tooltip="mark as unavailable for the whole day"
                  >
                    <button
                      className="day-action-btn red"
                      onClick={() => onSetWholeDay(day.index, "unavailable")}
                    />
                  </div>
                </div>
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
                const isTuesdayAfternoon =
                  day.index === 6 && timeItem.frame >= 5;
                if (timeItem.isBreak || isTuesdayAfternoon) {
                  return (
                    <td
                      key={`${day.index}-${timeItem.range}`}
                      className="availability-cell break-cell"
                    >
                      {timeItem.isBreak ? "Break" : "No Class"}
                    </td>
                  );
                }

                const hardSlots = lecturer.unavailableSlots || [];
                const softSlots = lecturer.nonPreferredSlots || [];

                const isUnavailable = hardSlots.some(
                  (slot) =>
                    slot.day === day.index &&
                    slot.startFrame === timeItem.frame,
                );
                const isNonPreferred = softSlots.some(
                  (slot) =>
                    slot.day === day.index &&
                    slot.startFrame === timeItem.frame,
                );

                let cellClass = "available";
                if (isUnavailable) cellClass = "unavailable";
                else if (isNonPreferred) cellClass = "non-preferred";

                return (
                  <td
                    key={`${day.index}-${timeItem.frame}`}
                    className={`availability-cell ${cellClass}`}
                    onClick={() => onToggle(day.index, timeItem.frame)}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
