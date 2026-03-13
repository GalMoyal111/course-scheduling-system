import UploadForm from "../components/UploadForm";
import { uploadLessons } from "../services/api";

import "./UploadPage.css"; // reuse the Upload page styles

/**
 * Minimal page for uploading course files (similar to lessons upload).
 */
export default function UploadCoursesPage() {
  const handleUpload = async (file) => {
    try {
  const result = await uploadLessons(file);
      alert(result || "Upload successful");
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console for details.");
    }
  };

  return (
    <div className="upload-page">
      <header className="upload-hero">
        <h1>Upload Courses</h1>
        <p className="lead">Upload a course file (structure similar to class file).</p>
      </header>

      <main className="upload-content">
        <section className="upload-card ui-card">
          <h2 className="card-title">Upload Course File</h2>
          <p className="card-sub">Supported formats: .xlsx, .xls</p>
          <UploadForm onUpload={handleUpload} />
        </section>
      </main>
    </div>
  );
}
