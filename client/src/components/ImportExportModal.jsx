import React, { useState, useRef } from "react";
import Button from "./ui/Button";
import {
  uploadLessons,
  uploadCourses,
  uploadRooms,
  exportLessons,
  exportCourses,
  exportRooms,
} from "../services/api";
import "./ImportExportModal.css";

const IMPORT_OPTIONS = [
  { id: "lessons", label: "Lessons", icon: "school" },
  { id: "courses", label: "Courses", icon: "menu_book" },
  { id: "classrooms", label: "Classrooms", icon: "meeting_room" },
  { id: "lecturers", label: "Lecturers", icon: "person" },
];

const EXPORT_OPTIONS = [
  { id: "lessons", label: "Lessons", icon: "school" },
  { id: "courses", label: "Courses", icon: "menu_book" },
  { id: "classrooms", label: "Classrooms", icon: "meeting_room" },
  { id: "lecturers", label: "Lecturers", icon: "person" },
];

export default function ImportExportModal({ isOpen, onClose, type = "import" }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type.includes("sheet") || file.name.match(/\.(xlsx|xls)$/i)) {
      setSelectedFile(file);
    } else {
      alert("Please select a valid Excel file (.xlsx or .xls)");
    }
  };

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedOption) return;

    setIsLoading(true);
    try {
      let result;
      switch (selectedOption) {
        case "lessons":
          result = await uploadLessons(selectedFile);
          break;
        case "courses":
          result = await uploadCourses(selectedFile);
          break;
        case "classrooms":
          result = await uploadRooms(selectedFile);
          break;
        case "lecturers":
          // Placeholder - implement when lecturers endpoint is ready
          alert("Lecturers import not yet implemented");
          setIsLoading(false);
          return;
        default:
          alert("Unknown option");
          setIsLoading(false);
          return;
      }
      alert(`${selectedOption} imported successfully`);
      setSelectedFile(null);
      setSelectedOption(null);
      onClose();
    } catch (error) {
      console.error("Import error:", error);
      alert(`Failed to import ${selectedOption}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!selectedOption) return;

    setIsLoading(true);
    try {
      let blob;
      switch (selectedOption) {
        case "lessons":
          blob = await exportLessons();
          break;
        case "courses":
          blob = await exportCourses();
          break;
        case "classrooms":
          blob = await exportRooms();
          break;
        case "lecturers":
          // Placeholder - implement when lecturers endpoint is ready
          alert("Lecturers export not yet implemented");
          setIsLoading(false);
          return;
        default:
          alert("Unknown option");
          setIsLoading(false);
          return;
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedOption}-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSelectedOption(null);
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      alert(`Failed to export ${selectedOption}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const options = type === "import" ? IMPORT_OPTIONS : EXPORT_OPTIONS;
  const title = type === "import" ? "Import Information" : "Export Information";
  const showFileUpload = type === "import" && selectedOption && !selectedFile;
  const showFilePreview = type === "import" && selectedFile;

  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="import-export-title">
        <div className="modal-header">
          <h3 id="import-export-title">{title}</h3>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
            disabled={isLoading}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {!selectedFile ? (
            <>
              <p className="modal-subtitle">
                {type === "import"
                  ? "Select a data type to import:"
                  : "Select a data type to export:"}
              </p>

              <div className="options-grid">
                {options.map((option) => (
                  <div
                    key={option.id}
                    className={`option-item ${selectedOption === option.id ? "selected" : ""}`}
                    onClick={() => !isLoading && setSelectedOption(option.id)}
                    role="radio"
                    aria-checked={selectedOption === option.id}
                  >
                    <span className="material-icons option-icon">{option.icon}</span>
                    <span className="option-label">{option.label}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {showFileUpload && (
            <div
              className={`drag-drop-zone ${isDragging ? "dragging" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleInputChange}
                disabled={isLoading}
                style={{ display: "none" }}
              />
              <div className="drag-drop-content">
                <span className="material-icons drag-drop-icon">cloud_upload</span>
                <p className="drag-drop-title">Drag and drop your file here</p>
                <p className="drag-drop-subtitle">or click to browse</p>
              </div>
            </div>
          )}

          {showFilePreview && (
            <div className="file-preview">
              <div className="file-preview-header">
                <span className="material-icons file-icon">description</span>
                <div className="file-info">
                  <p className="file-name">{selectedFile.name}</p>
                  <p className="file-size">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  className="file-remove"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  disabled={isLoading}
                  aria-label="Remove file"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Button
            variant="ghost"
            onClick={() => {
              if (selectedFile) {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              } else {
                setSelectedOption(null);
                onClose();
              }
            }}
            disabled={isLoading}
          >
            {selectedFile ? "Back" : "Cancel"}
          </Button>
          {type === "import" && selectedFile && (
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={!selectedFile || isLoading}
            >
              {isLoading ? "Uploading..." : "Upload"}
            </Button>
          )}
          {type === "export" && selectedOption && (
            <Button
              variant="primary"
              onClick={handleExport}
              disabled={!selectedOption || isLoading}
            >
              {isLoading ? "Exporting..." : "Export"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
