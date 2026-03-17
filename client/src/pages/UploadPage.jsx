import UploadForm from "../components/UploadForm";
import { uploadLessons, getAllLessons } from "../services/api";
import ConfirmModal from "../components/ConfirmModal";
import LessonList from "../components/LessonList";
import AddCourseModal from "../components/AddCourseModal";
import Button from "../components/ui/Button";
import { useState, useEffect } from "react";
import "./UploadPage.css";

function UploadPage() {
  // confirmation state for uploads
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  // lessons list (local state for now). Will be shown using LessonList component.
  const [lessons, setLessons] = useState([]);
  const [query, setQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedLessons, setSelectedLessons] = useState([]);

  // delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  // Attempt to load lessons from a hypothetical endpoint later; currently keep empty.
  useEffect(() => {
    // attempt to load lessons from server
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      const data = await getAllLessons();
      if (Array.isArray(data)) {
        setLessons(data || []);
      } else {
        // If server returned a wrapper or text, attempt best-effort handling
        console.debug && console.debug("getAllLessons returned non-array", data);
        setLessons([]);
      }
    } catch (err) {
      console.error("Failed to load lessons:", err);
      setLessons([]);
    }
  };

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
      // refresh list after successful upload
      try { await loadLessons(); } catch (e) { /* ignore */ }
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console for details.");
    }
  };

  const cancelUpload = () => {
    setConfirmOpen(false);
    setPendingFile(null);
  };

  // Filter lessons directly by relevant fields
  const filtered = lessons.filter((l) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (l.courseId && String(l.courseId).toLowerCase().includes(q)) ||
      (l.courseName && String(l.courseName).toLowerCase().includes(q)) ||
      (l.type && String(l.type).toLowerCase().includes(q))
    );
  });

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson || null);
    setIsModalOpen(true);
  };

  const handleDeleteLesson = (lesson) => {
    setPendingDelete(lesson || null);
    setDeleteConfirmOpen(true);
  };

  const performDeleteLesson = async () => {
    if (!pendingDelete) return;
    try {
      if (Array.isArray(pendingDelete)) {
        const set = new Set(pendingDelete.map((p) => `${p.courseId}||${p.index}`));
        setLessons((prev) => prev.filter((l) => !set.has(`${l.courseId}||${l.index}`)));
      } else {
        setLessons((prev) => prev.filter((l) => !(l.courseId === pendingDelete.courseId && l.index === pendingDelete.index)));
      }

      setDeleteConfirmOpen(false);
      setPendingDelete(null);
      setSelectedLessons([]);
    } catch (err) {
      console.error(err);
      alert("Failed to delete lesson(s)");
    }
  };

  const handleAddLesson = async (courseLike) => {
    // Convert course-like object from AddCourseModal to a lesson-like object and add/update locally
    const lesson = {
      courseId: courseLike.courseCode || courseLike.courseId || "",
      courseName: courseLike.courseName || "",
      lecturer: "",
      cluster: 0,
      type: "",
      duration: parseInt(courseLike.lectureHours || courseLike.duration || 0, 10),
      splitGroupId: 0,
      semester: null,
      credits: parseFloat(courseLike.credits || 0) || 0,
      index: lessons.length + 1,
    };

    if (editingLesson) {
      // update existing lesson by courseId+index
      setLessons((prev) => prev.map((l) => (l.courseId === editingLesson.courseId && l.index === editingLesson.index ? { ...l, ...lesson } : l)));
    } else {
      setLessons((prev) => [...prev, lesson]);
    }

    setIsModalOpen(false);
    setEditingLesson(null);
  };

  return (
    <div>
      <h2>Upload Lessons Excel</h2>
      <div className="toolbar">
        <div className="left">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
            </svg>
            <input className="search-input" placeholder="Search by course id, name or type" onChange={(e)=> setQuery(e.target.value)} />
          </div>
        </div>

        <div className="right">
          <button className="icon-btn" title="Refresh list" onClick={loadLessons} aria-label="Refresh">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M21 12a9 9 0 10-3.22 6.72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 3v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <Button onClick={() => { setEditingLesson(null); setIsModalOpen(true); }} variant="secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ marginRight: 8 }}>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add Lesson
          </Button>
          <Button disabled>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ marginRight: 8 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 10l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 5v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export
          </Button>
        </div>
      </div>

      <UploadForm onUpload={handleUpload} />

        

      <div style={{ marginTop: 12 }}>
        <LessonList
          lessons={filtered}
          onEdit={handleEditLesson}
          onDelete={handleDeleteLesson}
          onSelectionChange={(arr) => setSelectedLessons(arr)}
          title="Lessons"
        />
        <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-start", gap: 8 }}>
          <Button
            variant="ghost"
            onClick={() => {
              if (!selectedLessons || selectedLessons.length === 0) return;
              setPendingDelete(selectedLessons);
              setDeleteConfirmOpen(true);
            }}
            disabled={!selectedLessons || selectedLessons.length === 0}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <span className="material-icons">delete</span>
            Delete selected ({selectedLessons.length})
          </Button>
        </div>
      </div>

      <footer className="upload-footer">Need the template? Check the README or contact your admin.</footer>

      <AddCourseModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingLesson(null); }} onSave={handleAddLesson} initialCourse={editingLesson} />

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
        title="Delete lesson"
        message={"Are you sure you want to delete this lesson?"}
        fileName={
          Array.isArray(pendingDelete)
            ? pendingDelete.length > 0
              ? pendingDelete.map((p) => `${p.courseId} — ${p.courseName}`).join(", ")
              : ""
            : pendingDelete
            ? `${pendingDelete.courseId} — ${pendingDelete.courseName}`
            : ""
        }
        onConfirm={performDeleteLesson}
        onCancel={() => { setDeleteConfirmOpen(false); setPendingDelete(null); }}
        confirmLabel="Yes, delete"
        cancelLabel="No, keep"
      />
    </div>
  );
}

export default UploadPage;
