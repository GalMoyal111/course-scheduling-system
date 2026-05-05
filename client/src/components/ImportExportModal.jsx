import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Modal from "./ui/Modal";
import {
  uploadLessons,
  uploadCourses,
  uploadRooms,
  uploadLecturersExcel,
  exportLessons,
  exportCourses,
  exportRooms,
  exportLecturersExcel,
  exportLessonsTemplate, exportCoursesTemplate, exportRoomsTemplate, exportLecturersTemplate
} from "../services/api";
import "./ImportExportModal.css";

const IMPORT_OPTIONS = [
  { id: "lessons", label: "Lessons", icon: "school" },
  { id: "courses", label: "Courses", icon: "menu_book" },
  { id: "classrooms", label: "Classrooms", icon: "meeting_room" },
  { id: "lecturers", label: "Lecturers", icon: "person" },
];

const PAGE_ROUTES = {
  lessons: "/lessons",
  courses: "/courses",
  classrooms: "/classrooms",
  lecturers: "/lecturers",
};

export default function ImportExportModal({ isOpen, onClose, type = "import" }) {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // פונקציה לאיפוס וסגירה
  const resetAndClose = () => {
    setSelectedOption(null);
    setSelectedFile(null);
    setIsLoading(false);
    onClose();
  };

  const handleImportOptionSelect = (option) => {
    if (type === "import") {
      // Navigate to the appropriate page AND pass the state for the animation
      resetAndClose();
      navigate(PAGE_ROUTES[option], { state: { highlightUpload: true } });
    } else {
      // For export, keep the original behavior
      setSelectedOption(option);
    }
  };

  const handleFileSelect = (file) => {
    if (file && (file.type.includes("sheet") || file.name.match(/\.(xlsx|xls)$/i))) {
      setSelectedFile(file);
    } else {
      alert("Please select a valid Excel file (.xlsx or .xls)");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedOption) return;
    setIsLoading(true);
    try {
      if (selectedOption === "lessons") await uploadLessons(selectedFile);
      else if (selectedOption === "courses") await uploadCourses(selectedFile);
      else if (selectedOption === "classrooms") await uploadRooms(selectedFile);
      else if (selectedOption === "lecturers") await uploadLecturersExcel(selectedFile);
      else alert("Method not implemented yet");
      
      alert(`${selectedOption} imported successfully`);
      resetAndClose();
    } catch (error) {
      console.error("Import error:", error);
      alert(`Failed to import: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!selectedOption) return;
    setIsLoading(true);
    try {
      let blob;
      if (selectedOption === "lessons") blob = await exportLessons();
      else if (selectedOption === "courses") blob = await exportCourses();
      else if (selectedOption === "classrooms") blob = await exportRooms();
      else if (selectedOption === "lecturers") blob = await exportLecturersExcel();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedOption}-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      resetAndClose();
    } catch (error) {
      console.error("Export error:", error);
      alert(`Failed to export: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateDownload = async () => {
    if (!selectedOption) return;
    setIsLoading(true);
    try {
      let blob;
      if (selectedOption === "lessons") blob = await exportLessonsTemplate();
      else if (selectedOption === "courses") blob = await exportCoursesTemplate();
      else if (selectedOption === "classrooms") blob = await exportRoomsTemplate();
      else if (selectedOption === "lecturers") blob = await exportLecturersTemplate();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedOption}_template.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      resetAndClose();
    } catch (error) {
      console.error("Template download error:", error);
      alert(`Failed to download template: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const title = 
    type === "import" ? "Import Information" : 
    type === "export" ? "Export Information" : 
    "Download Excel Template";

  const getActionDetails = () => {
    if (type === "import") return { label: "Upload", action: handleUpload };
    if (type === "export") return { label: "Export", action: handleExport };
    return { label: "Download", action: handleTemplateDownload }; 
  };

  const actionDetails = getActionDetails();
  const showActionButton = (type === "import" && selectedFile) || ((type === "export" || type === "template") && selectedOption);


  const footerContent = (
    <>
      <Button
        variant="ghost"
        onClick={() => selectedFile ? setSelectedFile(null) : resetAndClose()}
        disabled={isLoading}
      >
        {selectedFile ? "Back" : "Cancel"}
      </Button>
      
      {showActionButton && (
        <Button
          variant="primary"
          onClick={actionDetails.action}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : actionDetails.label}
        </Button>
      )}
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={title}
      footer={footerContent}
    >
      <div className="import-export-content">
        {!selectedFile ? (
          <>
            <p className="modal-subtitle">
              Select a data type to {type}:
            </p>
            <div className="options-grid">
              {IMPORT_OPTIONS.map((option) => (
                <div
                  key={option.id}
                  className={`option-item ${selectedOption === option.id ? "selected" : ""}`}
                  onClick={() => !isLoading && handleImportOptionSelect(option.id)}
                >
                  <span className="material-icons option-icon">{option.icon}</span>
                  <span className="option-label">{option.label}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="file-preview">
            <div className="file-preview-header">
              <span className="material-icons file-icon">description</span>
              <div className="file-info">
                <p className="file-name">{selectedFile.name}</p>
                <p className="file-size">{(selectedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
          </div>
        )}

        {type === "import" && selectedOption && !selectedFile && (
          <div
            className={`drag-drop-zone ${isDragging ? "dragging" : ""}`}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              setIsDragging(false); 
              if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]); 
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
              style={{ display: "none" }}
            />
            <div className="drag-drop-content">
              <span className="material-icons drag-drop-icon">cloud_upload</span>
              <p className="drag-drop-title">Click or drag Excel file here</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}