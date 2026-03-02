import UploadForm from "../components/UploadForm";
import { uploadFile } from "../services/api";
import "./UploadPage.css";

function UploadPage() {
  const handleUpload = async (file) => {
    try {
      const result = await uploadFile(file);
      // If API returns a message, show it; otherwise show success
      alert(result || "Upload successful");
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console for details.");
    }
  };

  return (
    <div className="upload-page">
      <header className="upload-hero">
        <h1>Course Scheduling — Upload</h1>
        <p className="lead">Upload an Excel file with course data to generate schedules.</p>
      </header>

      <main className="upload-content">
        <section className="upload-card">
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
    </div>
  );
}

export default UploadPage;