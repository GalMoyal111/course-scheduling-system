import UploadForm from "../components/UploadForm";
import { uploadLessons, getAllLessons, addLesson as addLessonApi, deleteLessons as deleteLessonsApi } from "../services/api";
import ConfirmModal from "../components/ConfirmModal";
import LessonList from "../components/LessonList";
import AddLessonModal from "../components/AddLessonModal";
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
    const toDelete = Array.isArray(pendingDelete) ? pendingDelete : [pendingDelete];

    // Prepare keys for matching lessons
    const keyFor = (l) => `${l.courseId}||${l.index}`;
    const deleteSet = new Set(toDelete.map(keyFor));

    // Optimistically remove from UI so user sees immediate change
    const prevLessons = lessons;
    setLessons((prev) => prev.filter((l) => !deleteSet.has(keyFor(l))));
    // close modal and clear selection immediately for feedback
    setDeleteConfirmOpen(false);
    setPendingDelete(null);
    setSelectedLessons([]);

    try {
      // call server delete endpoint
      await deleteLessonsApi(toDelete);
      // Success: keep optimistic UI. Avoid immediate reload to prevent
      // showing stale server data if deletion hasn't fully propagated.
    } catch (err) {
      console.error(err);
      alert("Failed to delete lesson(s). Reverting UI and check console for details.");
      // revert optimistic update
      setLessons(prevLessons);
    }
  };

  const handleAddLesson = async (courseLike) => {
    // Convert course-like object from AddCourseModal to a lesson-like object and add/update locally
    const lesson = {
      courseId: courseLike.courseId ?? null,
      courseName: courseLike.courseName || "",
      lecturer: courseLike.lecturer || "",
      cluster: courseLike.cluster,
      type: courseLike.type,
      duration: parseInt(courseLike.duration || 0, 10),
      splitGroupId: null,
      semester: courseLike.semester,
      credits: parseFloat(courseLike.credits || 0) || 0,
      index: null,
    };

    try {
      if (editingLesson) {
        // No server-side update endpoint available; update locally for now
        setLessons((prev) => prev.map((l) => (l.courseId === editingLesson.courseId && l.index === editingLesson.index ? { ...l, ...lesson } : l)));
      } else {
        // send to server and optimistically append to local state so UI updates immediately
        await addLessonApi(lesson);
        setLessons((prev) => {
          // create a client-side index to avoid collisions; server will have authoritative data on full reload
          const nextIndex = prev && prev.length ? Math.max(...prev.map(p => (typeof p.index === 'number' ? p.index : 0))) + 1 : 0;
          const newLesson = { ...lesson, index: nextIndex, courseName: lesson.courseName || "", credits: lesson.credits || 0 };
          return [...prev, newLesson];
        });
      }
    } catch (err) {
      console.error("Failed to add lesson:", err);
      alert("Failed to add lesson. See console for details.");
    } finally {
      setIsModalOpen(false);
      setEditingLesson(null);
    }
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

  <AddLessonModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingLesson(null); }} onSave={handleAddLesson} initialLesson={editingLesson}  mode={editingLesson ? "edit" : "add"} />

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
