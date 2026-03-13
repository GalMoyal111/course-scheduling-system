import UploadForm from "../components/UploadForm";
import AddRoomModal from "../components/AddRoomModal";
import Button from "../components/ui/Button";
import { uploadRooms, exportRooms, addRoom } from "../services/api";
import { useState } from "react";

function UploadRoomsPage() {

  const handleUpload = async (file) => {
    try {
      await uploadRooms(file);
      alert("Rooms file uploaded successfully");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
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
    </div>
  );
}

export default UploadRoomsPage;