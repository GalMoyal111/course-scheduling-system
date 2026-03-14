import UploadForm from "../components/UploadForm";
import AddCourseModal from "../components/AddCourseModal";
import Button from "../components/ui/Button";
import { uploadCourses, exportCourses, addCourse } from "../services/api";
import { useState } from "react";

import "./UploadPage.css"; // reuse the Upload page styles

/**
 * Minimal page for uploading course files (similar to lessons upload).
 */
export default function UploadCoursesPage() {
  const [exporting, setExporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpload = async (file) => {
    try {
      const result = await uploadCourses(file);
      alert(result || "Upload successful");
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console for details.");
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportCourses();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "courses.xlsx";
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

  const handleAddCourse = async (course) => {
    try {
      await addCourse(course);
      alert("Course added successfully");
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add course");
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

          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
            <Button onClick={() => setIsModalOpen(true)} variant="secondary">
              Add Course
            </Button>
            <Button onClick={handleExport} disabled={exporting}>
              {exporting ? "Exporting..." : "Export to Excel"}
            </Button>
          </div>

          <UploadForm onUpload={handleUpload} />

          <AddCourseModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleAddCourse}
          />
        </section>
      </main>
    </div>
  );
}
