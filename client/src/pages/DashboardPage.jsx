import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { getAllCourses, getAllLessons, getAllClassrooms } from "../services/api";
import { useData } from "../context/DataContext";
import ImportExportModal from "../components/ImportExportModal";
import "./DashboardPage.css";

const LECTURERS_COUNT = 15; 

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    courses,
    setCourses,
    lessons,
    setLessons,
    classrooms,
    setClassrooms,
  } = useData();

  const [loading, setLoading] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (courses.length > 0 && lessons.length > 0 && classrooms.length > 0) {
        return; 
      }

      setLoading(true);
      try {
        const promises = [];
        
        if (courses.length === 0) promises.push(getAllCourses().then(data => setCourses(Array.isArray(data) ? data : [])));
        if (lessons.length === 0) promises.push(getAllLessons().then(data => setLessons(Array.isArray(data) ? data : [])));
        if (classrooms.length === 0) promises.push(getAllClassrooms().then(data => setClassrooms(Array.isArray(data) ? data : [])));

        await Promise.all(promises);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []); // Empty dependency array prevents infinite loops

  const stats = {
    courses: courses.length,
    lessons: lessons.length,
    classrooms: classrooms.length,
  };

  const handleStatClick = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard-page">
      <section className="dashboard-section">
        <h2 className="dashboard-section-title">Overview</h2>
        <div className="stats-grid">
          <StatCard
            title="Courses"
            count={stats.courses}
            icon="menu_book"
            onClick={() => handleStatClick("/courses")}
          />
          <StatCard
            title="Lessons"
            count={stats.lessons}
            icon="school"
            onClick={() => handleStatClick("/lessons")}
          />
          <StatCard
            title="Classrooms"
            count={stats.classrooms}
            icon="meeting_room"
            onClick={() => handleStatClick("/classrooms")}
          />
          <StatCard
            title="Lecturers"
            count={LECTURERS_COUNT}
            icon="person"
            onClick={() => handleStatClick("/lecturers")}
          />
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">Primary Actions</h2>
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

function StatCard({ title, count, icon, onClick }) {
  return (
    <div className="stat-card" onClick={onClick}>
      <div className="stat-icon-wrapper">
        <span className="material-icons stat-icon">{icon}</span>
      </div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <p className="stat-count">{count}</p>
      </div>
    </div>
  );
}