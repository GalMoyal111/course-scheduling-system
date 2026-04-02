import { useState, useRef } from "react";
import "./UploadForm.css";

function UploadForm({ onUpload }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file first.");
    onUpload(file);
  };

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) setFile(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      {!file ? (
        <div
          className={`dropzone ${dragActive ? "active" : ""}`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            id="fileInput"
            className="file-input"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
          />
          <div className="dropzone-content">
            <span className="material-icons dropzone-icon">cloud_upload</span>
            <p className="dropzone-title">Drag and drop your file here</p>
            <p className="dropzone-subtitle">or click to browse</p>
          </div>
        </div>
      ) : (
        <div className="file-preview">
          <div className="file-preview-content">
            <span className="material-icons file-preview-icon">description</span>
            <div className="file-preview-info">
              <p className="file-preview-name">{file.name}</p>
              <p className="file-preview-size">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
            <button
              type="button"
              className="file-remove-btn"
              onClick={removeFile}
              title="Remove file"
              aria-label="Remove file"
            >
              <span className="material-icons">close</span>
            </button>
          </div>
        </div>
      )}

      <div className="actions">
        {file && (
          <button type="button" className="btn secondary" onClick={removeFile}>
            Change File
          </button>
        )}
        <button className="btn primary" type="submit" disabled={!file}>
          Upload
        </button>
      </div>
    </form>
  );
}

export default UploadForm;