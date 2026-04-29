import UploadForm from "../components/UploadForm";
import AddRoomModal from "../components/AddRoomModal";
import ConfirmModal from "../components/ConfirmModal";
import ClassroomList from "../components/ClassroomList";
import Button from "../components/ui/Button";
import Toast, { useToast } from "../components/ui/Toast";
import { uploadRooms, exportRooms, addRoom, deleteClassrooms, updateClassroom } from "../services/api";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useData } from "../context/DataContext";
import Modal from "../components/ui/Modal";


function UploadRoomsPage() {
  const { toast, showSuccess, showError, closeToast } = useToast();


  const handleUpload = async (file) => {
    // show confirmation before performing destructive upload
    setPendingFile(file);
    setConfirmOpen(true);
  };

  const [exporting, setExporting] = useState(false);
  const { 
  classrooms, 
  setClassrooms, 
  fetchClassroomsIfNeeded, 
  setClassroomsTimestamp,  
  invalidateClassroomsCache,
  invalidateCoursesCache
} = useData();

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportRooms();
      // Create a temporary link to download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rooms.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setExporting(false);
    } catch (err) {
      console.error(err);
      setExporting(false);
      showError("Export failed");
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [selectedClassrooms, setSelectedClassrooms] = useState([]);

  // confirmation state for uploads
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [uploadSummary, setUploadSummary] = useState({ totalRows: 0, savedClassrooms: 0, invalidRows: [] });

  const performUpload = async () => {
    if (!pendingFile) return;
    setConfirmOpen(false);
    const fileToUpload = pendingFile;
    setPendingFile(null);

    try {
      const result = await uploadRooms(fileToUpload);
      
      setUploadSummary(result);
      setIsSummaryModalOpen(true);

      invalidateClassroomsCache();
      await loadClassrooms();
    } catch (err) {
      console.error(err);
      showError("Upload failed");
    }
  };

  const cancelUpload = () => {
    setConfirmOpen(false);
    setPendingFile(null);
  };

  // delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const handleEditRoom = (classroom) => {
    setEditingClassroom(classroom);
    setIsModalOpen(true);
  };

  const handleDeleteRoom = (classroom) => {
    setPendingDelete(classroom);
    setDeleteConfirmOpen(true);
  };

  const handleBulkDelete = (classrooms) => {
    if (!classrooms || classrooms.length === 0) return;
    setPendingDelete(classrooms);
    setDeleteConfirmOpen(true);
  };

  const performDelete = async () => {
    if (!pendingDelete) return;
    
    try {
      if (Array.isArray(pendingDelete)) {
        const payload = pendingDelete.map((c) => ({ building: c.building, classroomName: c.classroomName }));
        await deleteClassrooms(payload);
      } else {
        await deleteClassrooms([{ building: pendingDelete.building, classroomName: pendingDelete.classroomName }]);
      }

      const toDeleteArray = Array.isArray(pendingDelete) ? pendingDelete : [pendingDelete];
      const deletedNames = new Set(toDeleteArray.map(c => c.classroomName));

      setClassrooms(prev => prev.filter(c => !deletedNames.has(c.classroomName)));

      setClassroomsTimestamp(Date.now());
      setDeleteConfirmOpen(false);
      setPendingDelete(null);
      setSelectedClassrooms([]);

    } catch (err) {
      console.error(err);
      showError("Failed to delete classroom(s)");
    }
  };

  const handleAddRoom = async (classroom) => {
    try {
      if (editingClassroom) {
        // edit flow: send old and new classroom to server
        const req = {
          oldClassroom: editingClassroom,
          newClassroom: classroom,
        };

        await updateClassroom(req);

        setClassrooms(prev => 
          prev.map(c => 
            c.classroomName === editingClassroom.classroomName ? classroom : c
          )
        );

        showSuccess("Classroom updated successfully");
      } else {
        await addRoom(classroom);
        setClassrooms(prev => [...prev, classroom]);
        showSuccess("Classroom added successfully");
      }

      setClassroomsTimestamp(Date.now());
      setIsModalOpen(false);
      setEditingClassroom(null);
    } catch (err) {
      console.error(err);
      showError(editingClassroom ? "Failed to update classroom" : "Failed to add classroom");
    }
  };

  const [query, setQuery] = useState("");

  const loadClassrooms = useCallback(async () => {
    await fetchClassroomsIfNeeded("UploadRoomsPage");
  }, [fetchClassroomsIfNeeded]);

  useEffect(() => {
    loadClassrooms();
  }, [loadClassrooms]);

  const filteredClassrooms = useMemo(() => {
    let listToRender = classrooms;
    
    if (query) {
      const q = query.toLowerCase();
      listToRender = listToRender.filter((c) =>
        (c.building && c.building.toLowerCase().includes(q)) ||
        (c.classroomName && c.classroomName.toLowerCase().includes(q)) ||
        (c.type && c.type.toLowerCase().includes(q))
      );
    }

    return [...listToRender].sort((a, b) => {
      const buildingA = a.building || "";
      const buildingB = b.building || "";
      
      const buildingCompare = buildingA.localeCompare(buildingB, 'he');
      
      if (buildingCompare !== 0) {
        return buildingCompare;
      }
      
      const nameA = a.classroomName || "";
      const nameB = b.classroomName || "";
      return nameA.localeCompare(nameB, 'he');
    });
  }, [classrooms, query]);

  return (
    <div>
      <div className="toolbar">
        <div className="left">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
            </svg>
            <input className="search-input" placeholder="Search by building, name or type" onChange={(e)=> setQuery(e.target.value)} />
          </div>
        </div>

        <div className="right">
          <button className="icon-btn" title="Refresh list" onClick={(e) => { e.currentTarget.blur(); invalidateCoursesCache(); loadClassrooms(); }} aria-label="Refresh">
            <span className="material-icons" aria-hidden>refresh</span>
          </button>
          <Button onClick={() => { setEditingClassroom(null); setIsModalOpen(true); }} variant="secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ marginRight: 8 }}>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add Room
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ marginRight: 8 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 10l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 5v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {exporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      <UploadForm onUpload={handleUpload} />

      <div style={{ marginTop: 12 }}>
        <ClassroomList
          classrooms={filteredClassrooms}
          onEdit={handleEditRoom}
          onDelete={handleDeleteRoom}
          onSelectionChange={(arr) => setSelectedClassrooms(arr)}
        />
        <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-start", gap: 8 }}>
          <Button
            variant="ghost"
            onClick={() => handleBulkDelete(selectedClassrooms)}
            disabled={!selectedClassrooms || selectedClassrooms.length === 0}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <span className="material-icons">delete</span>
            Delete selected ({selectedClassrooms.length})
          </Button>
        </div>
      </div>

  <AddRoomModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingClassroom(null); }} onSave={handleAddRoom} initialClassroom={editingClassroom} />
      <ConfirmModal
        isOpen={confirmOpen}
        title="Upload will overwrite existing data"
        message={
          "Note: uploading a new file will completely delete everything that existed in the system. "
        }
        fileName={pendingFile ? pendingFile.name : ""}
        onConfirm={performUpload}
        onCancel={cancelUpload}
        confirmLabel="Yes, upload"
        cancelLabel="No, cancel"
      />

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title={Array.isArray(pendingDelete) ? "Delete selected classrooms" : "Delete classroom"}
        message={Array.isArray(pendingDelete)
          ? `Are you sure you want to delete ${pendingDelete.length} selected classroom(s)? This action cannot be undone.`
          : "Are you sure you want to delete this classroom?"}
        fileName={Array.isArray(pendingDelete)
          ? (pendingDelete.length <= 5 ? pendingDelete.map((c) => `${c.building} — ${c.classroomName}`).join("; ") : `${pendingDelete.length} classrooms`)
          : (pendingDelete ? `${pendingDelete.building} — ${pendingDelete.classroomName}` : "")}
        onConfirm={performDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setPendingDelete(null); }}
        confirmLabel="Yes, delete"
        cancelLabel="No, keep"
      />

      <RoomUploadSummaryModal 
        isOpen={isSummaryModalOpen} 
        summary={uploadSummary} 
        onClose={() => setIsSummaryModalOpen(false)} 
      />

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

export default UploadRoomsPage;

function RoomUploadSummaryModal({ isOpen, summary, onClose }) {
  if (!isOpen) return null;

  const footer = (
    <Button variant="primary" onClick={onClose} style={{ width: '100%', padding: '10px', fontWeight: '600' }}>
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
      <div style={{ textAlign: 'center', backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #dcfce7' }}>
        <div style={{ color: '#166534', fontWeight: '700', fontSize: '18px' }}>
          ✓ {summary.savedClassrooms} Classrooms Saved
        </div>
        <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
          Out of {summary.totalRows} rows processed
        </div>
      </div>

      {summary.invalidRows && summary.invalidRows.length > 0 && (
        <div className="summary-section" style={{ marginBottom: '20px' }}>
          <h4 style={{ 
            fontSize: '14px', color: '#b45309', textTransform: 'uppercase', 
            borderBottom: '1px solid #fde68a', paddingBottom: '4px', marginBottom: '8px', textAlign: 'left' 
          }}>
            Format Errors (Skipped)
          </h4>
          <div style={{ maxHeight: '120px', overflowY: 'auto', paddingLeft: '5px' }}>
            {summary.invalidRows.map((issue, idx) => (
              <div key={idx} style={{ fontSize: '13px', marginBottom: '4px', color: '#4b5563', direction: 'ltr', textAlign: 'left' }}>
                • {issue}
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.savedClassrooms === 0 && (
        <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>
          No classrooms were imported. Please fix the errors above.
        </p>
      )}
    </Modal>
  );
}