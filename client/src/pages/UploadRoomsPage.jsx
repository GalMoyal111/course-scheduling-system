import UploadForm from "../components/UploadForm";
import AddRoomModal from "../components/AddRoomModal";
import ConfirmModal from "../components/ConfirmModal";
import ClassroomList from "../components/ClassroomList";
import Button from "../components/ui/Button";
import { uploadRooms, exportRooms, addRoom, getAllClassrooms, deleteClassrooms } from "../services/api";
import { useState } from "react";
import { useEffect } from "react";

function UploadRoomsPage() {

  const handleUpload = async (file) => {
    // show confirmation before performing destructive upload
    setPendingFile(file);
    setConfirmOpen(true);
  };

  const [exporting, setExporting] = useState(false);

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
      alert("Export failed");
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);

  // confirmation state for uploads
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  const performUpload = async () => {
    if (!pendingFile) return;
    setConfirmOpen(false);
    setPendingFile(null);

    try {
      await uploadRooms(pendingFile);
      alert("Rooms file uploaded successfully");
      await loadClassrooms();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
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

  const performDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteClassrooms([{ building: pendingDelete.building, classroomName: pendingDelete.classroomName }]);
      setDeleteConfirmOpen(false);
      setPendingDelete(null);
      await loadClassrooms();
    } catch (err) {
      console.error(err);
      alert("Failed to delete classroom");
    }
  };

  const handleAddRoom = async (classroom) => {
    try {
      await addRoom(classroom);
      alert("Classroom added successfully");
      setIsModalOpen(false);
      setEditingClassroom(null);
      await loadClassrooms();
    } catch (err) {
      console.error(err);
      alert("Failed to add classroom");
    }
  };

  const [classrooms, setClassrooms] = useState([]);
  const [query, setQuery] = useState("");

  const loadClassrooms = async () => {
    try {
      const data = await getAllClassrooms();
      setClassrooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadClassrooms();
  }, []);

  const filteredClassrooms = classrooms.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (c.building && c.building.toLowerCase().includes(q)) ||
      (c.classroomName && c.classroomName.toLowerCase().includes(q)) ||
      (c.type && c.type.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <h2>Upload Rooms Excel</h2>
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
          <button className="icon-btn" title="Refresh list" onClick={loadClassrooms} aria-label="Refresh">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M21 12a9 9 0 10-3.22 6.72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 3v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
        <ClassroomList classrooms={filteredClassrooms} onEdit={handleEditRoom} onDelete={handleDeleteRoom} />
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
        title="Delete classroom"
        message={"Are you sure you want to delete this classroom?"}
        fileName={pendingDelete ? `${pendingDelete.building} — ${pendingDelete.classroomName}` : ""}
        onConfirm={performDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setPendingDelete(null); }}
        confirmLabel="Yes, delete"
        cancelLabel="No, keep"
      />
    </div>
  );
}

export default UploadRoomsPage;