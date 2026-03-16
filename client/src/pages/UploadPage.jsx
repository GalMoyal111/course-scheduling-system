import UploadForm from "../components/UploadForm";
import { uploadLessons } from "../services/api";
import ConfirmModal from "../components/ConfirmModal";
import { useState } from "react";
import "./UploadPage.css";

function UploadPage() {
  // confirmation state for uploads
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  const handleUpload = async (file) => {
    // show confirmation before performing destructive upload
    setPendingFile(file);
    setConfirmOpen(true);
  };

  const performUpload = async () => {
    if (!pendingFile) return;
    setConfirmOpen(false);
    setPendingFile(null);

    try {
      const result = await uploadLessons(pendingFile);
      alert(result || "Upload successful");
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console for details.");
    }
  };

  const cancelUpload = () => {
    setConfirmOpen(false);
    setPendingFile(null);
  };

  return (
    <div className="upload-page">
      <header className="upload-hero">
        <h1>Course Scheduling — Upload</h1>
        <p className="lead">Upload an Excel file with course data to generate schedules.</p>
      </header>

      <main className="upload-content">
  <section className="upload-card ui-card">
          <h2 className="card-title">Upload Excel File</h2>
          <p className="card-sub">Supported formats: .xlsx, .xls — max 10MB</p>
          <UploadForm onUpload={handleUpload} />
        </section>

        <aside className="upload-help">
          <h3>Tips</h3>
          <ul>
            <li>Make sure columns match the template.</li>
            <li>Large files may take a few seconds to process.</li>
            <li>You can drag & drop the file into the box below.</li>
          </ul>
        </aside>
      </main>

      <footer className="upload-footer">Need the template? Check the README or contact your admin.</footer>
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
    </div>
  );
}

export default UploadPage;
