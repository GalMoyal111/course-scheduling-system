import UploadForm from "../components/UploadForm";
import { uploadLessons, exportLessons, addLesson, deleteLessons } from "../services/api";
import ConfirmModal from "../components/ConfirmModal";
import LessonList from "../components/LessonList";
import AddLessonModal from "../components/AddLessonModal";
import Button from "../components/ui/Button";
import Toast, { useToast } from "../components/ui/Toast";
import { useState, useEffect, useCallback } from "react";
import { useData } from "../context/DataContext";
import Modal from "../components/ui/Modal";
import { useLocation } from "react-router-dom";

import "./UploadPage.css";
function UploadPage() {
  const { toast, showSuccess, showError, closeToast } = useToast();
  // confirmation state for uploads
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  // lessons list (local state for now). Will be shown using LessonList component.
  const [query, setQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const {
    lessons, setLessons,
    setLessonsTimestamp,
    courses, 
    classrooms, 
    lecturers,
    fetchLessonsIfNeeded,
    fetchCoursesIfNeeded,
    fetchLecturersIfNeeded,
    fetchClassroomsIfNeeded,
    invalidateLessonsCache,
    invalidateAllCache
  } = useData();

  // delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [uploadSummary, setUploadSummary] = useState({savedCount: 0, missingCourses: [],missingLecturers: [], totalRows: 0});

  const location = useLocation();
  const [isHighlightUpload, setIsHighlightUpload] = useState(false);

  useEffect(() => {
    if (location.state?.highlightUpload) {
      setIsHighlightUpload(true);

      window.scrollTo({
        top: 0,
        behavior: "auto" // אפשר גם "auto" אם אתה רוצה מיידי
      });
      
      window.history.replaceState({}, document.title);

      const timer = setTimeout(() => {
        setIsHighlightUpload(false);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [location]);
  

  const loadInitialData = useCallback(async (caller = "UploadPage") => {
    try {
      await Promise.all([
        fetchLessonsIfNeeded(caller),
        fetchCoursesIfNeeded(caller),
        fetchLecturersIfNeeded(caller),
        fetchClassroomsIfNeeded(caller),
      ]);
    } catch (err) {
      console.error("Failed to load page data:", err);
    }
  }, [fetchLessonsIfNeeded, fetchCoursesIfNeeded, fetchLecturersIfNeeded, fetchClassroomsIfNeeded]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

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

    setIsUploading(true);

    
    try {
      const result = await uploadLessons(fileToUpload);
      setUploadSummary(result);
      setSummaryModalOpen(true);

      invalidateLessonsCache();
      await loadInitialData();

    } catch (err) {
      console.error(err);
      showError("Upload failed. Check console for details.");
    } finally {
      setIsUploading(false);
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
      const semesterOrder = { A: 1, B: 2 };
      const semDiff =
        (semesterOrder[a.semester] || 99) -
        (semesterOrder[b.semester] || 99);
      if (semDiff !== 0) return semDiff;

      // cluster
      const clusterA = parseInt(a.cluster, 10) || 999;
      const clusterB = parseInt(b.cluster, 10) || 999;
      if (clusterA !== clusterB) return clusterA - clusterB;

      const creditDiff = (b.credits || 0) - (a.credits || 0);
      if (creditDiff !== 0) return creditDiff;

      

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
      await deleteLessons(toDelete);
      setLessonsTimestamp(Date.now());

    } catch (err) {
      console.error(err);
      showError("Failed to delete lesson(s). Reverting UI and check console for details.");
      // revert optimistic update
      setLessons(prevLessons);
    }
  };

  const handleAddLesson = async (oldLesson, newLesson) => {
    try {
      if (oldLesson) {
        await deleteLessons([oldLesson]); 
      }
      
      // 🟢 מקבלים מהשרת רק את השיעורים החדשים (1 או 2 במידה ופוצל)
      const newlySavedLessons = await addLesson(newLesson);
      
      // 🟢 מעדכנים את הרשימה המקומית בזהירות
      setLessons(prev => {
        // אם זה עריכה, נוריד את הגרסה הישנה מהרשימה
        const filtered = oldLesson 
          ? prev.filter(l => l.lessonId !== oldLesson.lessonId) 
          : prev;
        
        // נוסיף את מה שקיבלנו מהשרת
        return [...filtered, ...newlySavedLessons];
      });
      
      setLessonsTimestamp(Date.now());
      showSuccess("Lesson saved successfully");
    } catch (err) {
      console.error(err);
      showError("Failed to save lesson");
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
          <button className="icon-btn" title="Refresh list" onClick={(e) => { e.currentTarget.blur(); invalidateAllCache(); loadInitialData(); }} aria-label="Refresh">
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
              showError("Export failed");
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

      <div className={isHighlightUpload ? "upload-highlight-active" : ""}>
        <UploadForm onUpload={handleUpload} />
      </div>

        

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

      {isUploading && (
        <div className="uploading-overlay">
          <div className="spinner"></div>
          <h2 style={{ color: "white", marginTop: "20px", fontWeight: "600" }}>Processing file...</h2>
          <p style={{ color: "#e2e8f0", marginTop: "8px" }}>Please wait, processing may take a few seconds.</p>
        </div>
      )}

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

export default UploadPage;


function LessonUploadSummaryModal({ isOpen, summary, onClose }) {
  if (!isOpen) return null;

  const renderIssueSection = (title, issues) => {
    if (!issues || issues.length === 0) return null;
    
    return (
      <div className="summary-section" style={{ marginBottom: '20px' }}>
        <h4 style={{ 
          fontSize: '14px', color: '#b45309', textTransform: 'uppercase', 
          borderBottom: '1px solid #fde68a', paddingBottom: '4px', marginBottom: '8px', textAlign: 'left' 
        }}>
          {title}
        </h4>
        <div style={{ maxHeight: '120px', overflowY: 'auto', paddingLeft: '5px', textAlign: 'left' }}>
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

  const footer = (
    <Button variant="primary" onClick={onClose} style={{ width: '100%', padding: '10px', fontWeight: '600' }}>
      Close Summary
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Summary"
      size="normal"
      footer={footer}
    >
      <div style={{ textAlign: 'center', backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #dcfce7' }}>
        <div style={{ color: '#166534', fontWeight: '700', fontSize: '18px' }}>
          ✓ {summary.savedCount} Lessons Saved
        </div>
        <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
          Out of {summary.totalRows} rows processed
        </div>
      </div>

      {renderIssueSection("Missing Courses", summary.missingCourses)}
      {renderIssueSection("Missing Lecturers", summary.missingLecturers)}
      {renderIssueSection("Invalid Lesson Types", summary.invalidTypes)}
      {renderIssueSection("Invalid Semesters", summary.invalidSemesters)}
      {renderIssueSection("Invalid Durations", summary.invalidDurations)}

      {summary.savedCount === 0 && (
        <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>
          No lessons were imported. Please fix the errors above.
        </p>
      )}
    </Modal>
  );
}