import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Footer from "../components/ui/Footer";
import ImportExportModal from "../components/ImportExportModal";
import "./DashboardPage.css";


export default function DashboardPage() {
  const navigate = useNavigate();
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  return (
    <div className="dashboard-page">
      {/* Welcome Section */}
      <section className="dashboard-section welcome-section">
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome to UniSched</h1>
          <p className="welcome-subtitle">University Course Timetabling System</p>
        </div>
      </section>

      {/* About Section */}
      <section className="dashboard-section about-section">
        <h2 className="dashboard-section-title">What is UniSched?</h2>
        <div className="about-content">
          <p>UniSched helps you create the perfect class schedule. Simply add your courses, lessons, classrooms, and teachers, and the system will automatically arrange them in the best possible way.</p>
        </div>
      </section>

      {/* Quick Steps Section */}
      <section className="dashboard-section">
        <h2 className="dashboard-section-title">Getting Started</h2>
        <div className="quick-steps">
          <div className="step">
            <div className="step-icon">1</div>
            <h4>Enter Your Information</h4>
            <p>Add your courses, classes, rooms, and teachers to the system</p>
          </div>
          <div className="step">
            <div className="step-icon">2</div>
            <h4>Create a Schedule</h4>
            <p>Click "Generate" to let the system create the best schedule</p>
          </div>
          <div className="step">
            <div className="step-icon">3</div>
            <h4>Review & Save</h4>
            <p>Check your schedule and save it when you're happy</p>
          </div>
        </div>
      </section>

      {/* Credits */}
      <section className="dashboard-section credits-section">
        <h2 className="dashboard-section-title">Created By</h2>
        <div className="credits-content">
          <p><strong>Gal Moyal</strong> & <strong>Eden Furman</strong></p>
        </div>
      </section>

      {/* Primary Actions */}
      <section className="dashboard-section">
        <h2 className="dashboard-section-title">What's Next?</h2>
        <div className="actions-grid">
          <div className="action-card">
            <div className="action-header">
              <span className="material-icons action-icon">upload</span>
              <h3>Import Information</h3>
            </div>
            <p>Upload Excel files for lessons, courses, classrooms, or lecturers</p>
            <Button
              variant="primary"
              onClick={() => setImportModalOpen(true)}
              className="action-button"
            >
              Import
            </Button>
          </div>

          <div className="action-card">
            <div className="action-header">
              <span className="material-icons action-icon">download</span>
              <h3>Export Information</h3>
            </div>
            <p>Download Excel files for lessons, courses, classrooms, or lecturers</p>
            <Button
              variant="primary"
              onClick={() => setExportModalOpen(true)}
              className="action-button"
            >
              Export
            </Button>
          </div>

          <div className="action-card">
            <div className="action-header">
              <span className="material-icons action-icon">auto_awesome</span>
              <h3>Generate Timetable</h3>
            </div>
            <p>Create an optimized timetable based on your data</p>
            <Button
              variant="primary"
              onClick={() => navigate("/generate")}
              className="action-button"
            >
              Generate
            </Button>
          </div>

          <div className="action-card">
            <div className="action-header">
              <span className="material-icons action-icon">calendar_month</span>
              <h3>View Timetable</h3>
            </div>
            <p>View the generated timetable schedule</p>
            <Button
              variant="primary"
              onClick={() => navigate("/timetable")}
              className="action-button"
            >
              View
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      <ImportExportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        type="import"
      />
      <ImportExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        type="export"
      />
    </div>
  );
}