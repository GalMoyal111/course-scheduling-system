import UploadForm from "../components/UploadForm";
import { uploadLessons, getAllLessons, addLesson as addLessonApi, deleteLessons as deleteLessonsApi, exportLessons } from "../services/api";
import ConfirmModal from "../components/ConfirmModal";
import LessonList from "../components/LessonList";
import AddLessonModal from "../components/AddLessonModal";
import Button from "../components/ui/Button";
import { useState, useEffect } from "react";
import { useData } from "../context/DataContext";


import "./UploadPage.css";
function UploadPage() {
  // confirmation state for uploads
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  // lessons list (local state for now). Will be shown using LessonList component.
  const [query, setQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [exporting, setExporting] = useState(false);
  const { lessons, setLessons, invalidateLessonsCache } = useData();
  // delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [uploadSummary, setUploadSummary] = useState({savedCount: 0, missingCourses: [],missingLecturers: [], totalRows: 0});


  useEffect(() => {
    if (lessons.length === 0) {
      loadLessons();
    }
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
      // Invalidate dashboard cache to refresh stats
      invalidateLessonsCache();
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
    const fileToUpload = pendingFile;
    setPendingFile(null);

    try {
      const result = await uploadLessons(fileToUpload);
      setUploadSummary(result);
      setSummaryModalOpen(true);
      await loadLessons();

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
  const filtered = lessons
    .filter((lesson) => {
      if (!query) return true;

      const q = query.toLowerCase();

      return Object.values(lesson).some((value) => {
        if (value === null || value === undefined) 
          return false;
        return String(value).toLowerCase().includes(q);
    });
  })
    .sort((a, b) => {
      // semester
      const semesterOrder = { A: 1, B: 2, SUMMER: 3 };
      const semDiff =
        (semesterOrder[a.semester] || 99) -
        (semesterOrder[b.semester] || 99);
      if (semDiff !== 0) return semDiff;

      // cluster
      const clusterDiff = (a.cluster || 0) - (b.cluster || 0);
      if (clusterDiff !== 0) return clusterDiff;

      const idA = String(a.courseId || "");
      const idB = String(b.courseId || "");
      const idCompare = idA.localeCompare(idB, undefined, { numeric: true });
      if (idCompare !== 0) return idCompare;

      // type (priority)
      const typePriority = {
        LECTURE: 1,
        TUTORIAL: 2,
        LAB: 3,
        PHYSICS_LAB: 3,
        NETWORKING_LAB: 3,
        PBL: 4,
        PROJECT: 5,
      };

      return (
        (typePriority[a.type] || 99) -
        (typePriority[b.type] || 99)
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
    const keyFor = (l) => l.lessonId;
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

  const handleAddLesson = async (oldLesson, newLesson) => {
  try {
    if (oldLesson) {
      await deleteLessonsApi([oldLesson]);
    }

    await addLessonApi(newLesson);

    await loadLessons();

  } catch (err) {
    console.error("Failed to save lesson:", err);
    alert("Failed to save lesson. See console for details.");
  } finally {
    setIsModalOpen(false);
    setEditingLesson(null);
  }
};

  return (
    <div>
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
          <button className="icon-btn" title="Refresh list" onClick={(e) => { e.currentTarget.blur(); loadLessons(); }} aria-label="Refresh">
            <span className="material-icons" aria-hidden>refresh</span>
          </button>
          <Button onClick={() => { setEditingLesson(null); setIsModalOpen(true); }} variant="secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ marginRight: 8 }}>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add Lesson
          </Button>
          <Button onClick={async () => {
            try {
              setExporting(true);
              const blob = await exportLessons();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "lessons.xlsx";
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            } catch (err) {
              console.error(err);
              alert("Export failed");
            } finally {
              setExporting(false);
            }
          }} disabled={exporting}>
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

      <LessonUploadSummaryModal 
        isOpen={summaryModalOpen} 
        summary={uploadSummary} 
        onClose={() => setSummaryModalOpen(false)} 
      />
    </div>
  );
}

export default UploadPage;


function LessonUploadSummaryModal({ isOpen, summary, onClose }) {
  if (!isOpen) return null;

  // פונקציית עזר להצגת קטגוריית שגיאה בצורה נקייה
  const renderIssueSection = (title, issues) => {
    if (!issues || issues.length === 0) return null;
    
    return (
      <div className="summary-section" style={{ marginBottom: '20px' }}>
        <h4 style={{ 
          fontSize: '14px', 
          color: '#b45309', 
          textTransform: 'uppercase', 
          borderBottom: '1px solid #fde68a',
          paddingBottom: '4px',
          marginBottom: '8px'
        }}>
          {title}
        </h4>
        <div style={{ maxHeight: '120px', overflowY: 'auto', paddingLeft: '5px' }}>
          {issues.map((issue, idx) => (
            <div key={idx} style={{ fontSize: '13px', marginBottom: '4px', color: '#4b5563' }}>
              <span style={{ fontWeight: '600' }}>{issue.identifier}</span>
              <span style={{ color: '#9ca3af', marginLeft: '6px' }}>
                (Lines: {issue.rows.join(', ')})
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay">
      {/* עיצוב צר ואלגנטי */}
      <div className="modal-card" style={{ maxWidth: '450px', width: '100%', borderRadius: '12px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Upload Summary</h3>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          {/* שורת סיכום הצלחה */}
          <div style={{ 
            textAlign: 'center', 
            backgroundColor: '#f0fdf4', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '24px',
            border: '1px solid #dcfce7'
          }}>
            <div style={{ color: '#166534', fontWeight: '700', fontSize: '18px' }}>
              ✓ {summary.savedCount} Lessons Saved
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
              Out of {summary.totalRows} rows processed
            </div>
          </div>

          {/* הצגת כל סוגי השגיאות באנגלית */}
          {renderIssueSection("Missing Courses", summary.missingCourses)}
          {renderIssueSection("Missing Lecturers", summary.missingLecturers)}
          {renderIssueSection("Invalid Lesson Types", summary.invalidTypes)}
          {renderIssueSection("Invalid Semesters", summary.invalidSemesters)}
          {renderIssueSection("Invalid Durations", summary.invalidDurations)}

          {/* הודעה למקרה ששום דבר לא נשמר */}
          {summary.savedCount === 0 && (
            <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>
              No lessons were imported. Please fix the errors above.
            </p>
          )}
        </div>

        <div className="modal-actions" style={{ padding: '16px 24px' }}>
          <Button 
            variant="primary" 
            onClick={onClose} 
            style={{ width: '100%', padding: '10px', fontWeight: '600' }}
          >
            Close Summary
          </Button>
        </div>
      </div>
    </div>
  );
}