import UploadForm from "../components/UploadForm";
import AddRoomModal from "../components/AddRoomModal";
import ConfirmModal from "../components/ConfirmModal";
import Button from "../components/ui/Button";
import { uploadRooms, exportRooms, addRoom } from "../services/api";
import { useState } from "react";

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
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  const cancelUpload = () => {
    setConfirmOpen(false);
    setPendingFile(null);
  };

  const handleAddRoom = async (classroom) => {
    try {
      await addRoom(classroom);
      alert("Classroom added successfully");
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add classroom");
    }
  };

  return (
    <div>
      <h2>Upload Rooms Excel</h2>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <Button onClick={() => setIsModalOpen(true)} variant="secondary">
          Add Room
        </Button>
        <Button onClick={handleExport} disabled={exporting}>
          {exporting ? "Exporting..." : "Export to Excel"}
        </Button>
      </div>

      <UploadForm onUpload={handleUpload} />

      <AddRoomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddRoom} />
      <ConfirmModal
        isOpen={confirmOpen}
        title="Upload will overwrite existing data"
        message={<>
          Note: uploading a new file will completely delete everything that existed in the system. <strong>Are you sure you want to do this?</strong>
        </>}
        onConfirm={performUpload}
        onCancel={cancelUpload}
        confirmLabel="Yes, upload"
        cancelLabel="No, cancel"
      />
    </div>
  );
}

export default UploadRoomsPage;