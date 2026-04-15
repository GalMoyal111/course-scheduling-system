import { useState, useEffect, useCallback, useMemo } from "react";
import Button from "../components/ui/Button";
import AddLecturerModal from "../components/AddLecturerModal";
import UploadForm from "../components/UploadForm";
import { useData } from "../context/DataContext";
import { addLecturer, deleteLecturers, updateLecturer, uploadLecturersExcel, exportLecturersExcel } from "../services/api";
import "./LecturersPage.css";
import ConfirmModal from "../components/ConfirmModal";

export default function LecturersPage() {
  const { 
    lecturers, 
    setLecturers, 
    fetchLecturersIfNeeded, 
    setLecturersTimestamp ,
    invalidateLecturersCache
  } = useData();
  
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
  const [uploadSummary, setUploadSummary] = useState({ totalRows: 0, savedLecturers: 0, invalidSlots: [] });



  const keyFor = (lecturer) => lecturer.id || lecturer.name;

  const loadLecturers = useCallback(async () => {
    await fetchLecturersIfNeeded("LecturersPage");
    
    if (!selectedLecturerId && lecturers.length > 0) {
      setSelectedLecturerId(lecturers[0].id);
    }
  }, [fetchLecturersIfNeeded, lecturers, selectedLecturerId]);


  useEffect(() => {
    loadLecturers();
  }, [loadLecturers]);

  const selectedLecturer = lecturers.find((l) => l.id === selectedLecturerId);

  const filteredLecturers = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();

    let listToRender = !q 
      ? lecturers 
      : lecturers.filter((l) => (l.name || "").toLowerCase().includes(q));

    return [...listToRender].sort((a, b) => 
      (a.name || "").localeCompare(b.name || "", 'he')
    );
  }, [lecturers, searchQuery]);


  const handleAddLecturer = async (newLecturer) => {
    const isDuplicate = lecturers.some(
      (l) => l.name.trim() === newLecturer.name.trim()
    );

    if (isDuplicate) {
      alert(`The lecturer "${newLecturer.name}" already exists in the system.`);
      return;
    }

    try {
      const addedLecturerFromServer = await addLecturer(newLecturer);
      alert("Lecturer added successfully!");

      setLecturers(prev => [...prev, addedLecturerFromServer]);
      setLecturersTimestamp(Date.now());

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error adding lecturer");
    }
  };

  const handleEditLecturer = async (updatedLecturer) => {
    try {
      await updateLecturer(updatedLecturer);
      alert("Lecturer updated successfully!");

      setLecturers(prev => 
        prev.map(l => l.id === updatedLecturer.id ? updatedLecturer : l)
      );

      setIsModalOpen(false);
      setEditingLecturer(null);
      setLecturersTimestamp(Date.now());
      
    } catch (err) {
      console.error(err);
      alert("Error updating lecturer");
    }
  };

  // פתיחת מודל המחיקה
  const handleDeleteClick = (e, lecturer) => {
    e.stopPropagation();
    setLecturerToPendingDelete(lecturer);
    setIsDeleteModalOpen(true);
  };

  const performDelete = async () => {
    if (!lecturerToPendingDelete) return;

    try {
      await deleteLecturers([lecturerToPendingDelete]);
      alert("Lecturer deleted successfully!");
      invalidateLecturersCache();
      
      const keyToDelete = keyFor(lecturerToPendingDelete);
      const updatedList = lecturers.filter(l => keyFor(l) !== keyToDelete);
      
      setLecturers(updatedList);
      setLecturersTimestamp(Date.now());

      if (keyFor(selectedLecturer) === keyToDelete) {
        setHasUnsavedChanges(false);
        setSelectedLecturerId(updatedList.length > 0 ? updatedList[0].id : null);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting lecturer");
    } finally {
      setIsDeleteModalOpen(false);
      setLecturerToPendingDelete(null);
    }
  };


  const performMultiDelete = async () => {
    if (selectedLecturers.length === 0) return;

    try {
      await deleteLecturers(selectedLecturers);
      alert("Selected lecturers deleted successfully!");
      invalidateLecturersCache();
      
      const deletedKeys = new Set(selectedLecturers.map(keyFor));
      const updatedList = lecturers.filter(l => !deletedKeys.has(keyFor(l)));
      
      setLecturers(updatedList);
      setLecturersTimestamp(Date.now());
      setSelectedLecturers([]);
      
      if (selectedLecturer && deletedKeys.has(keyFor(selectedLecturer))) {
        setHasUnsavedChanges(false);
        setSelectedLecturerId(updatedList.length > 0 ? updatedList[0].id : null);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting selected lecturers");
    } finally {
      setIsMultiDeleteModalOpen(false);
    }
  };



  const handleToggleAvailability = (dayIndex, startFrame) => {
    setLecturers(
      lecturers.map((lecturer) => {
        if (lecturer.id === selectedLecturerId) {
          const slots = lecturer.unavailableSlots || [];
          const slotExists = slots.some(
            (slot) => slot.day === dayIndex && slot.startFrame === startFrame
          );

          let updatedSlots;
          if (slotExists) {
            updatedSlots = slots.filter(
              (slot) => !(slot.day === dayIndex && slot.startFrame === startFrame)
            );
          } else {
            updatedSlots = [
              ...slots,
              { day: dayIndex, startFrame: startFrame },
            ];
          }

          setHasUnsavedChanges(true); 
          return { ...lecturer, unavailableSlots: updatedSlots };
        }
        return lecturer;
      })
    );
  };

  const saveAvailabilityChanges = async () => {
    if (!selectedLecturer) return;
    setIsSaving(true);
    try {
      await updateLecturer(selectedLecturer);
      setHasUnsavedChanges(false);
      alert("Availability saved successfully!");
      setLecturersTimestamp(Date.now());
    } catch (err) {
      console.error(err);
      alert("Error saving availability");

    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectLecturer = (id) => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm("You have unsaved changes. Switch anyway?");
      if (!confirmLeave) return;
      setHasUnsavedChanges(false);
      loadLecturers();
    }
    setSelectedLecturerId(id);
  };


  const toggleLecturerSelection = (e, lecturer) => {
    e.stopPropagation();
    const key = keyFor(lecturer);
    
    setSelectedLecturers(prev => {
      const isSelected = prev.some(l => keyFor(l) === key);
      if (isSelected) {
        return prev.filter(l => keyFor(l) !== key); 
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
      await loadLecturers();

    } catch (err) {
      console.error("Detailed upload error:", err);
      alert("Error uploading file");
    }
  };

  const cancelUpload = () => {
    setConfirmOpen(false);
    setPendingFile(null);
  };

const handleExport = async () => {
    try {
      const blob = await exportLecturersExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lecturers_availability.xlsx';
      a.click();
    } catch (err) {
      alert("Error exporting file");
    }
  };

  return (
    <div className="lecturers-page">
      {/* Top upload + actions section */}
      <div className="lecturers-top-section" style={{ marginBottom: 12 }}>
        <div className="toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div />
          <div style={{ display: "flex", gap: 8 }}>
            <Button onClick={() => { setIsModalOpen(true); setEditingLecturer(null); }} variant="secondary">
              <span className="material-icons" style={{ fontSize: 18, marginRight: 8 }}>add</span>
              Add a lecturer
            </Button>
            <Button onClick={handleExport} variant="primary">
              <span className="material-icons" style={{ fontSize: 18, marginRight: 8 }}>download</span>
              Export
            </Button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <UploadForm onUpload={handleUpload} />
        </div>
      </div>

      <div className="lecturers-container">
        
        {/* Sidebar */}
        <div className="lecturers-sidebar">
          <div className="lecturers-header" />

          <div className="lecturers-list">
            {/* Search input */}
            <div style={{ padding: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search lecturers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: '1px solid #cbd5e1' }}
              />
              {searchQuery && (
                <button
                  className="icon-btn"
                  onClick={() => setSearchQuery("")}
                  title="Clear"
                  style={{ padding: '6px 8px' }}
                >
                  <span className="material-icons">close</span>
                </button>
              )}
            </div>

            

            {lecturers.length === 0 ? (
              <div className="empty-state-sidebar" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                <span className="material-icons" style={{ fontSize: "48px", color: "#e2e8f0", marginBottom: "12px" }}>
                  person_off
                </span>
                <p style={{ fontSize: "0.9rem", fontWeight: "600", margin: "0" }}>No lecturers yet</p>
                <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>Add your first lecturer to start.</p>
              </div>
            ) : filteredLecturers.length === 0 ? (
              <div className="empty-state-sidebar" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                <span className="material-icons" style={{ fontSize: "48px", color: "#e2e8f0", marginBottom: "12px" }}>
                  search_off
                </span>
                <p style={{ fontSize: "0.9rem", fontWeight: "600", margin: "0" }}>No results</p>
                <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>Try a different search term.</p>
              </div>
            ) : (
              filteredLecturers.map((lecturer) => {
                const key = keyFor(lecturer);
                const isChecked = selectedLecturers.some(l => keyFor(l) === key);
                
                return (
                <div
                  key={key}
                  className={`lecturer-item ${selectedLecturerId === lecturer.id ? "active" : ""}`}
                  onClick={() => handleSelectLecturer(lecturer.id)}
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    direction: "rtl" // קובע שהכל זורם מימין לשמאל טבעי
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => toggleLecturerSelection(e, lecturer)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ cursor: "pointer", width: "16px", height: "16px", margin: 0 }}
                    />
                    <p className="lecturer-name" style={{ margin: 0 }}>{lecturer.name}</p>
                  </div>

                  <button
                    className="icon-btn icon-btn--delete"
                    onClick={(e) => handleDeleteClick(e, lecturer)}
                    title="Delete"
                    style={{ padding: "4px" }}
                  >
                    <span className="material-icons" style={{ fontSize: '18px' }}>delete</span>
                  </button>
                </div>
              );
              }))
            } 

            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-start", gap: 8, paddingBottom: 8, borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
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
          <div className="lecturer-details-panel">
            <div className="details-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <h1 dir="rtl">{selectedLecturer.name}</h1>
                <button className="edit-icon-btn" onClick={() => { setEditingLecturer(selectedLecturer); setIsModalOpen(true); }} title="Edit Name">
                  <span className="material-icons">edit</span>
                </button>
              </div>
            </div>

            <div className="availability-section">
              <div className="availability-header-row">
                <div>
                  <h3>Weekly Availability</h3>
                  <p className="availability-hint">Click a cell to toggle availability. Red = Blocked, Green = Available.</p>
                </div>
                <Button 
                  variant="primary" 
                  onClick={saveAvailabilityChanges}
                  disabled={isSaving || !hasUnsavedChanges}
                  style={{ 
                    backgroundColor: hasUnsavedChanges ? "#10b981" : "#94a3b8", 
                    borderColor: hasUnsavedChanges ? "#10b981" : "#94a3b8"
                  }}
                >
                  <span className="material-icons" style={{ fontSize: "18px", marginRight: "6px" }}>save</span>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>

              <AvailabilityTable
                lecturer={selectedLecturer}
                onToggle={handleToggleAvailability}
              />
            </div>
          </div>
        ) : (
          <div className="lecturer-details-panel" style={{ justifyContent: "center", alignItems: "center", color: "#94a3b8" }}>
            <div style={{ textAlign: "center" }}>
              <span className="material-icons" style={{ fontSize: "64px", marginBottom: "16px", opacity: 0.5 }}>
                touch_app
              </span>
              <h2>Select a Lecturer</h2>
              <p>Choose a lecturer from the sidebar to manage their availability.</p>
            </div>
          </div>
        )}
      </div>

      <AddLecturerModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingLecturer(null); }}
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
        message={"Note: uploading a new file will completely delete everything that existed in the system."}
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


    </div>
  );
}

function LecturerUploadSummaryModal({ isOpen, summary, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '450px', width: '100%', borderRadius: '12px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Upload Summary</h3>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          {/* שורת סיכום הצלחה */}
          <div style={{ 
            textAlign: 'center', 
            backgroundColor: '#f0fdf4', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '24px',
            border: '1px solid #dcfce7'
          }}>
            <div style={{ color: '#166534', fontWeight: '700', fontSize: '18px' }}>
              ✓ {summary.savedLecturers} Lecturers Saved
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
              Out of {summary.totalRows} rows processed
            </div>
          </div>

          {/* הצגת שגיאות פורמט (אם יש) */}
          {summary.invalidSlots && summary.invalidSlots.length > 0 && (
            <div className="summary-section" style={{ marginBottom: '20px' }}>
              <h4 style={{ 
                fontSize: '14px', 
                color: '#b45309', 
                textTransform: 'uppercase', 
                borderBottom: '1px solid #fde68a',
                paddingBottom: '4px',
                marginBottom: '8px'
              }}>
                Format Errors (Skipped)
              </h4>
              <div style={{ maxHeight: '120px', overflowY: 'auto', paddingLeft: '5px' }}>
                {summary.invalidSlots.map((issue, idx) => (
                  <div key={idx} style={{ fontSize: '13px', marginBottom: '4px', color: '#4b5563' }}>
                    • {issue}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* הודעה למקרה ששום דבר לא נשמר */}
          {summary.savedLecturers === 0 && (
            <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>
              No lecturers were imported. Please fix the errors above.
            </p>
          )}
        </div>

        <div className="modal-actions" style={{ padding: '16px 24px' }}>
          <Button 
            variant="primary" 
            onClick={onClose} 
            style={{ width: '100%', padding: '10px', fontWeight: '600' }}
          >
            Close Summary
          </Button>
        </div>
      </div>
    </div>
  );
}



function AvailabilityTable({ lecturer, onToggle }) {
  const hebrewDays = [
    { name: "ראשון", index: 1 }, { name: "שני", index: 2 }, { name: "שלישי", index: 3 },
    { name: "רביעי", index: 4 }, { name: "חמישי", index: 5 }, { name: "שישי", index: 6 },
  ];

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
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map((timeItem) => (
            <tr key={timeItem.range} className={timeItem.isBreak ? "break-row" : ""}>
              <td className={`time-cell ${timeItem.isBreak ? "break-time" : ""}`}>{timeItem.range}</td>
              {hebrewDays.map((day) => {
                const isTuesdayAfternoon = day.index === 6 && timeItem.frame >= 5;
                if (timeItem.isBreak || isTuesdayAfternoon) {
                  return <td key={`${day.index}-${timeItem.range}`} className="availability-cell break-cell">{timeItem.isBreak ? "Break" : "No Class"}</td>;
                }
                const slots = lecturer.unavailableSlots || [];
                const isUnavailable = slots.some(slot => slot.day === day.index && slot.startFrame === timeItem.frame);
                return (
                  <td
                    key={`${day.index}-${timeItem.frame}`}
                    className={`availability-cell ${!isUnavailable ? "available" : "unavailable"}`}
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