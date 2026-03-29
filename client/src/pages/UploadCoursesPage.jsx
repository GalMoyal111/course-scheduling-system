import UploadForm from "../components/UploadForm";
import AddCourseModal from "../components/AddCourseModal";
import ConfirmModal from "../components/ConfirmModal";
import CourseList from "../components/CourseList";
import Button from "../components/ui/Button";
import { uploadCourses, exportCourses, addCourse, getAllCourses, deleteCourses, updateCourse } from "../services/api";
import { useEffect, useState } from "react";
import { useData } from "../context/DataContext";

import "./UploadPage.css"; // reuse the Upload page styles

/**
 * Minimal page for uploading course files (similar to lessons upload).
 */
export default function UploadCoursesPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [invalidCoursesModalOpen, setInvalidCoursesModalOpen] = useState(false);
  const [invalidCourses, setInvalidCourses] = useState([]);
  const [uploadSavedCount, setUploadSavedCount] = useState(0);
  const { courses, setCourses } = useData();

  

  const loadCourses = async () => {
    try {
      const data = await getAllCourses();
      if (Array.isArray(data)) {
        setCourses(data || []);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error("Failed to load courses:", err);
      setCourses([]);
    }
  };

  useEffect(() => {
    if (courses.length === 0) {
      loadCourses();
    }
  }, []);

  const handleUpload = async (file) => {
    setPendingFile(file);
    setConfirmOpen(true);
  };

  const performUpload = async () => {
    if (!pendingFile) return;
    setConfirmOpen(false);
    const fileToUpload = pendingFile;
    setPendingFile(null);

    try {
      const result = await uploadCourses(fileToUpload);
      
      // result is now a JSON object with savedCount and invalidCourses
      if (result.invalidCourses && result.invalidCourses.length > 0) {
        setUploadSavedCount(result.savedCount);
        setInvalidCourses(result.invalidCourses);
        setInvalidCoursesModalOpen(true);
      } else {
        alert("Courses uploaded successfully");
      }
      
      await loadCourses();
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console for details.");
    }
  };

  const cancelUpload = () => {
    setConfirmOpen(false);
    setPendingFile(null);
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
      if (editingCourse) {
        const oldCoursePayload = {
          ...editingCourse,
          courseId: String(editingCourse.courseId || "").trim(),
        };
        const newCoursePayload = {
          ...course,
          courseId: String(course.courseId || "").trim(),
        };
        await updateCourse({ oldCourse: oldCoursePayload, newCourse: newCoursePayload });
        alert("Course updated successfully");
      } else {
        await addCourse(course);
        alert("Course added successfully");
      }
      await loadCourses();
      setIsModalOpen(false);
      setEditingCourse(null);
    } catch (err) {
      console.error(err);
      alert(editingCourse ? "Failed to update course" : "Failed to add course");
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course || null);
    setIsModalOpen(true);
  };

  const handleDeleteCourse = (course) => {
    setPendingDelete(course || null);
    setDeleteConfirmOpen(true);
  };

  const performDeleteCourses = async () => {
    if (!pendingDelete) return;
    const toDelete = Array.isArray(pendingDelete) ? pendingDelete : [pendingDelete];

    const payload = toDelete.map((course) => ({
      courseId: course.courseId,
      cluster: course.cluster,
    }));

    setDeleteConfirmOpen(false);
    setPendingDelete(null);

    try {
      await deleteCourses(payload);
      setSelectedCourses([]);
      await loadCourses();
    } catch (err) {
      console.error(err);
      alert("Failed to delete course(s). Check console for details.");
    }
  };

  const filtered = courses.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (c.courseId && String(c.courseId).toLowerCase().includes(q)) ||
      (c.courseName && String(c.courseName).toLowerCase().includes(q)) ||
      (c.cluster && String(c.cluster).toLowerCase().includes(q))
    );
  });

  const sortedCourses = [...filtered].sort((a, b) => {
    const aSem = String(a.cluster || "").trim();
    const bSem = String(b.cluster || "").trim();

    const aNum = Number(aSem);
    const bNum = Number(bSem);
    const aIsNum = aSem !== "" && Number.isFinite(aNum);
    const bIsNum = bSem !== "" && Number.isFinite(bNum);

    if (aIsNum && bIsNum && aNum !== bNum) {
      return aNum - bNum;
    }

    if (aSem !== bSem) {
      return aSem.localeCompare(bSem, undefined, { numeric: true, sensitivity: "base" });
    }

    return String(a.courseId || "").localeCompare(String(b.courseId || ""), undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  return (
    <div>
      <h2>Upload Courses Excel</h2>

      <div className="toolbar">
        <div className="left">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
            </svg>
            <input
              className="search-input"
              placeholder="Search by course id, name or cluster"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="right">
          <button className="icon-btn" title="Refresh list" onClick={(e) => { e.currentTarget.blur(); loadCourses(); }} aria-label="Refresh">
            <span className="material-icons" aria-hidden>refresh</span>
          </button>
          <Button onClick={() => setIsModalOpen(true)} variant="secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ marginRight: 8 }}>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add Course
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
        <CourseList
          courses={sortedCourses}
          onEdit={handleEditCourse}
          onDelete={handleDeleteCourse}
          onSelectionChange={setSelectedCourses}
          title="Courses"
        />
        <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-start", gap: 8 }}>
          <Button
            variant="ghost"
            onClick={() => {
              if (!selectedCourses || selectedCourses.length === 0) return;
              setPendingDelete(selectedCourses);
              setDeleteConfirmOpen(true);
            }}
            disabled={!selectedCourses || selectedCourses.length === 0}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <span className="material-icons">delete</span>
            Delete selected ({selectedCourses.length})
          </Button>
        </div>
      </div>

      <footer className="upload-footer">Need the template? Check the README or contact your admin.</footer>

      <AddCourseModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCourse(null); }}
        onSave={handleAddCourse}
        initialCourse={editingCourse}
      />

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
        title="Delete course"
        message={"Are you sure you want to delete the selected course(s)?"}
        fileName={
          Array.isArray(pendingDelete)
            ? pendingDelete.length > 0
              ? pendingDelete.map((p) => `${p.courseId} - ${p.courseName}`).join(", ")
              : ""
            : pendingDelete
            ? `${pendingDelete.courseId} - ${pendingDelete.courseName}`
            : ""
        }
        onConfirm={performDeleteCourses}
        onCancel={() => { setDeleteConfirmOpen(false); setPendingDelete(null); }}
        confirmLabel="Yes, delete"
        cancelLabel="No, keep"
      />

      <InvalidCoursesModal
        isOpen={invalidCoursesModalOpen}
        invalidCourses={invalidCourses}
        savedCount={uploadSavedCount}
        onClose={() => setInvalidCoursesModalOpen(false)}
      />
    </div>
  );
}

function InvalidCoursesModal({ isOpen, invalidCourses, savedCount, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3>Upload Completed with Warnings</h3>
        </div>

        <div className="modal-body invalid-courses-modal-body">
          <p className="invalid-courses-summary">
            ✓ {savedCount} course(s) uploaded successfully
          </p>
          <p className="invalid-courses-warning">
            ✗ {invalidCourses.length} course(s) skipped due to invalid course code (must be 5 or 6 digits):
          </p>

          <div className="invalid-courses-list">
            {invalidCourses.map((course, index) => (
              <div key={index} className="invalid-course-item">
                <div className="invalid-course-item-name">{course.courseName || "(No name)"}</div>
                <div className="invalid-course-item-code">Course Code: {course.courseId}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <Button variant="primary" onClick={onClose}>
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}
