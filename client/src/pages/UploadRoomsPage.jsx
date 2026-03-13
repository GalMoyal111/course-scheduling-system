import UploadForm from "../components/UploadForm";
import { uploadRooms, exportRooms } from "../services/api";
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

  return (
    <div>
      <h2>Upload Rooms Excel</h2>
      <button onClick={handleExport} disabled={exporting} style={{ marginBottom: 12 }}>
        {exporting ? "Exporting..." : "Export to Excel"}
      </button>
      <UploadForm onUpload={handleUpload} />
    </div>
  );
}

export default UploadRoomsPage;