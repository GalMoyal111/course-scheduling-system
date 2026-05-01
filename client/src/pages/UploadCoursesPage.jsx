import React, { useEffect, useState, useCallback, useMemo } from "react";

import UploadForm from "../components/UploadForm";
import AddCourseModal from "../components/AddCourseModal";
import ConfirmModal from "../components/ConfirmModal";
import CourseList from "../components/CourseList";
import Button from "../components/ui/Button";
import Toast, { useToast } from "../components/ui/Toast";
import { uploadCourses, exportCourses, addCourse, deleteCourses, updateCourse } from "../services/api";
import { useData } from "../context/DataContext";
import Modal from "../components/ui/Modal";

import "./UploadPage.css"; // reuse the Upload page styles

/**
 * Minimal page for uploading course files (similar to lessons upload).
 */
export default function UploadCoursesPage() {
  const { toast, showSuccess, showError, closeToast } = useToast();
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
  const [adjustedCourses, setAdjustedCourses] = useState([]);
  const [creditWarnings, setCreditWarnings] = useState([]);
  const [uploadSavedCount, setUploadSavedCount] = useState(0);
  const [modalContext, setModalContext] = useState("upload"); // "upload" or "add"
  const [pendingCourse, setPendingCourse] = useState(null);
  const { courses, setCourses, fetchCoursesIfNeeded, setCoursesTimestamp, invalidateCoursesCache, clusters } = useData();

  // Build dynamic semester range from DataContext
  const semesterRange = useMemo(() => {
    const nums = new Set([1, 2, 3, 4, 5, 6, 7, 8]); // Default range
    clusters.forEach(c => {
      if (c.number && c.number < 9) {
        nums.add(c.number);
      }
    });
    return Array.from(nums).sort((a, b) => a - b);
  }, [clusters]);

  const loadCourses = useCallback(async () => {
    await fetchCoursesIfNeeded("UploadCoursesPage");
  }, [fetchCoursesIfNeeded]);

  useEffect(() => {
    fetchCoursesIfNeeded("UploadCoursesPage");
  }, [fetchCoursesIfNeeded]);

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
      
      setUploadSavedCount(result.savedCount || 0);
      setInvalidCourses(result.invalidCourses || []);
      setAdjustedCourses(result.adjustedCourses || []);
      setCreditWarnings(result.creditWarnings || []);
      setModalContext("upload");
      setInvalidCoursesModalOpen(true);
      
      invalidateCoursesCache();
      await fetchCoursesIfNeeded("UploadCoursesPage");
    } catch (err) {
      console.error(err);
      showError("Upload failed. Check console for details.");
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
      showError("Export failed");
    }
  };

  const handleAddCourse = async (course) => {
    try {

      const formattedCourse = {
        ...course,
        clusterName: (semesterRange.includes(course.cluster)) 
          ? `סמסטר ${course.cluster}` 
          : course.clusterName
      };
      
      if (editingCourse) {
        const oldCoursePayload = {
          ...editingCourse,
          courseId: String(editingCourse.courseId || "").trim(),
        };
        const newCoursePayload = {
          ...formattedCourse,
          courseId: String(course.courseId || "").trim(),
        };
        await updateCourse({ oldCourse: oldCoursePayload, newCourse: newCoursePayload });

        setCourses(prevCourses => prevCourses.map(c => 
          (c.courseId === oldCoursePayload.courseId && c.cluster === oldCoursePayload.cluster) 
          ? newCoursePayload 
          : c
        ));

        showSuccess("Course updated successfully");

      } else {
        // Check for invalid prerequisites before adding
        const coursePrerequisites = (course.prerequisiteCourseNumber || "")
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id !== "");

        const validCourseIds = new Set(courses.map((c) => c.courseId));
        const invalidPrereqs = coursePrerequisites.filter(
          (prereqId) => !validCourseIds.has(prereqId)
        );

        if (invalidPrereqs.length > 0) {
          // Show warning modal for adding course with missing prerequisites
          setModalContext("add");
          setInvalidCourses([]);
          setAdjustedCourses([
            {
              courseId: course.courseId,
              courseName: course.courseName,
              removedPrerequisites: invalidPrereqs,
            },
          ]);
          setCreditWarnings([]);
          setUploadSavedCount(0);
          setPendingCourse(course);
          setInvalidCoursesModalOpen(true);
          return;
        }
        
        await addCourse(course);
        setCourses(prevCourses => [...prevCourses, formattedCourse]);
        showSuccess("Course added successfully");
      }
      
      setCoursesTimestamp(Date.now());
      setIsModalOpen(false);
      setEditingCourse(null);
    
    } catch (err) {
      console.error(err);
      showError(editingCourse ? "Failed to update course" : "Failed to add course");
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

      const deletedIds = new Set(toDelete.map(c => c.courseId));
      setCourses(prevCourses => prevCourses.filter(c => !deletedIds.has(c.courseId)));

      setCoursesTimestamp(Date.now());
      setSelectedCourses([]);

    } catch (err) {
      console.error(err);
      showError("Failed to delete course(s). Check console for details.");
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
          <button className="icon-btn" title="Refresh list" onClick={(e) => { e.currentTarget.blur(); invalidateCoursesCache(); loadCourses(); }} aria-label="Refresh">
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
        allCourses={courses}
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
        adjustedCourses={adjustedCourses}
        creditWarnings={creditWarnings}
        savedCount={uploadSavedCount}
        context={modalContext}
        onClose={() => {
          setInvalidCoursesModalOpen(false);
          setInvalidCourses([]);
          setAdjustedCourses([]);
          setCreditWarnings([]);
          setPendingCourse(null);
        }}
        onContinueAnyway={async () => {
          if (pendingCourse && modalContext === "add") {
            try {
              await addCourse(pendingCourse);

              const formattedPending = {
                ...pendingCourse,
                clusterName: (pendingCourse.cluster >= 1 && pendingCourse.cluster <= 8) 
                  ? `סמסטר ${pendingCourse.cluster}` 
                  : pendingCourse.clusterName
              };

              setCourses(prev => [...prev, formattedPending]);

              setCoursesTimestamp(Date.now());
              showSuccess("Course added successfully (with non-existing prerequisites)");

              setIsModalOpen(false);
              setEditingCourse(null);
            } catch (err) {
              console.error(err);
              showError("Failed to add course");
            }
            setInvalidCoursesModalOpen(false);
            setInvalidCourses([]);
            setAdjustedCourses([]);
            setCreditWarnings([]);
            setPendingCourse(null);
          }
        }}
      />

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

function InvalidCoursesModal({ isOpen, invalidCourses, adjustedCourses, creditWarnings, savedCount, context = "upload", onClose, onContinueAnyway }) {
  if (!isOpen) return null;

  const hasInvalidCourses = invalidCourses && invalidCourses.length > 0;
  const hasAdjustedCourses = adjustedCourses && adjustedCourses.length > 0;
  const hasCreditWarnings = creditWarnings && creditWarnings.length > 0;
  const isAddContext = context === "add";

  // הגדרת הכותרת למודל האחיד
  const modalTitle = isAddContext ? "Missing Prerequisites Warning" : "Upload Completed";

  // הגדרת הכפתורים למטה (Footer) למודל האחיד
  const modalFooter = isAddContext ? (
    <>
      <Button variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" onClick={onContinueAnyway}>
        Continue Anyway
      </Button>
    </>
  ) : (
    <Button variant="primary" onClick={onClose}>
      OK
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="wide"
      footer={modalFooter}
    >
      <div className="invalid-courses-modal-body" style={{ textAlign: "left" }}>
        
        {/* הודעת הצלחה - מוצגת רק בהעלאה */}
        {!isAddContext && (
          <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", color: "#10b981", fontSize: "16px", fontWeight: "600" }}>
            <span className="material-icons">check_circle</span>
            {savedCount} course(s) uploaded successfully
          </div>
        )}

        {/* רשימת שגיאות קריטיות (קורסים שלא נשמרו) */}
        {hasInvalidCourses && (
          <div style={{ marginBottom: "24px" }}>
            <p style={{ color: "#ef4444", fontWeight: "600", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-icons">error</span>
              {invalidCourses.length} course(s) skipped:
            </p>

            <div className="invalid-courses-list" style={{ maxHeight: "200px", overflowY: "auto", paddingRight: "8px" }}>
              {invalidCourses.map((course, index) => (
                <div key={index} className="invalid-course-item" style={{ background: "#fee2e2", padding: "12px", borderRadius: "8px", marginBottom: "8px", border: "1px solid #fca5a5" }}>
                  <div style={{ fontWeight: "bold", color: "#991b1b" }}>{course.courseName || "(No name)"}</div>
                  <div style={{ fontSize: "0.9em", color: "#b91c1c", marginTop: "4px" }}>Course Code: {course.courseId}</div>
                  
                  {/* כאן אנחנו מדפיסים את הסיבה שהוספנו בשרת! */}
                  {course.reason && (
                    <div style={{ fontSize: "0.9em", color: "#dc2626", marginTop: "4px", fontWeight: "500" }}>
                      Reason: {course.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* רשימת שגיאות אזהרה (קורסים שנשמרו אבל הקדמים שלהם לא קיימים) */}
        {hasAdjustedCourses && (
          <div>
            <p style={{ color: "#f59e0b", fontWeight: "600", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-icons">warning</span>
              {adjustedCourses.length} course(s) {isAddContext ? "will be added, but missing prerequisites:" : "saved, but missing prerequisites removed:"}
            </p>

            <div className="invalid-courses-list" style={{ maxHeight: "200px", overflowY: "auto", paddingRight: "8px" }}>
              {adjustedCourses.map((course, index) => (
                <div key={index} className="invalid-course-item" style={{ background: "#fef3c7", padding: "12px", borderRadius: "8px", marginBottom: "8px", border: "1px solid #fcd34d" }}>
                  <div style={{ fontWeight: "bold", color: "#b45309" }}>{course.courseName || "(No name)"}</div>
                  <div style={{ fontSize: "0.9em", color: "#d97706", marginTop: "4px" }}>Course Code: {course.courseId}</div>
                  <div style={{ fontSize: "0.9em", color: "#d97706", marginTop: "4px", fontWeight: "500" }}>
                    Missing Prerequisites: {course.removedPrerequisites.join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasCreditWarnings && (
          <div style={{ marginTop: hasAdjustedCourses ? "24px" : "0" }}>
            <p style={{ color: "#f59e0b", fontWeight: "600", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-icons">warning</span>
              {creditWarnings.length} course(s) saved with credits mismatch:
            </p>

            <div className="invalid-courses-list" style={{ maxHeight: "200px", overflowY: "auto", paddingRight: "8px" }}>
              {creditWarnings.map((course, index) => (
                <div key={index} className="invalid-course-item" style={{ background: "#fef3c7", padding: "12px", borderRadius: "8px", marginBottom: "8px", border: "1px solid #fcd34d" }}>
                  <div style={{ fontWeight: "bold", color: "#b45309" }}>{course.courseName || "(No name)"}</div>
                  <div style={{ fontSize: "0.9em", color: "#d97706", marginTop: "4px" }}>Course Code: {course.courseId}</div>
                  <div style={{ fontSize: "0.9em", color: "#d97706", marginTop: "4px", fontWeight: "500" }}>
                    Expected Credits: {course.expectedCredits} | Excel Credits: {course.actualCredits}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}