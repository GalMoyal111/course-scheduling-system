import { useState } from "react";

function UploadForm({ onUpload }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

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

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div
        className={`dropzone ${dragActive ? "active" : ""}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          id="fileInput"
          className="file-input"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
        />
        <label className="file-label" htmlFor="fileInput">
          {file ? file.name : "Click or drop an Excel file here (.xlsx/.xls)"}
        </label>
      </div>

      <div className="actions">
        <button className="btn primary" type="submit" disabled={!file}>
          Upload
        </button>
      </div>
    </form>
  );
}

export default UploadForm;