import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { getAllCourses, getAllLessons, getAllClassrooms } from "../services/api";
import { useData } from "../context/DataContext";
import ImportExportModal from "../components/ImportExportModal";
import "./DashboardPage.css";

const LECTURERS_COUNT = 15; // Fixed number for now

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    courses,
    setCourses,
    lessons,
    setLessons,
    classrooms,
    setClassrooms,
    isCacheValid,
    coursesTimestamp,
    setCoursesTimestamp,
    lessonsTimestamp,
    setLessonsTimestamp,
    classroomsTimestamp,
    setClassroomsTimestamp,
  } = useData();

  const [stats, setStats] = useState({
    courses: courses.length,
    lessons: lessons.length,
    classrooms: classrooms.length,
  });
  const [loading, setLoading] = useState(true);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Check cache for each data type
        const coursesFromCache = isCacheValid(coursesTimestamp);
        const lessonsFromCache = isCacheValid(lessonsTimestamp);
        const classroomsFromCache = isCacheValid(classroomsTimestamp);

        const promises = [];

        // Only fetch if cache is invalid
        if (!coursesFromCache) {
          promises.push(
            getAllCourses().then((data) => {
              const coursesArray = Array.isArray(data) ? data : [];
              setCourses(coursesArray);
              setCoursesTimestamp(Date.now());
              return coursesArray;
            })
          );
        } else {
          promises.push(Promise.resolve(courses));
        }

        if (!lessonsFromCache) {
          promises.push(
            getAllLessons().then((data) => {
              const lessonsArray = Array.isArray(data) ? data : [];
              setLessons(lessonsArray);
              setLessonsTimestamp(Date.now());
              return lessonsArray;
            })
          );
        } else {
          promises.push(Promise.resolve(lessons));
        }

        if (!classroomsFromCache) {
          promises.push(
            getAllClassrooms().then((data) => {
              const classroomsArray = Array.isArray(data) ? data : [];
              setClassrooms(classroomsArray);
              setClassroomsTimestamp(Date.now());
              return classroomsArray;
            })
          );
        } else {
          promises.push(Promise.resolve(classrooms));
        }

        const [coursesData, lessonsData, classroomsData] = await Promise.all(promises);

        setStats({
          courses: coursesData.length,
          lessons: lessonsData.length,
          classrooms: classroomsData.length,
        });
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
        setStats({
          courses: courses.length,
          lessons: lessons.length,
          classrooms: classrooms.length,
        });
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have at least one invalid cache
    const needsFetch =
      !isCacheValid(coursesTimestamp) ||
      !isCacheValid(lessonsTimestamp) ||
      !isCacheValid(classroomsTimestamp);

    if (needsFetch || loading) {
      fetchStats();
    } else {
      // Update stats from cached data
      setStats({
        courses: courses.length,
        lessons: lessons.length,
        classrooms: classrooms.length,
      });
      setLoading(false);
    }
  }, [
    isCacheValid,
    coursesTimestamp,
    lessonsTimestamp,
    classroomsTimestamp,
    setCourses,
    setLessons,
    setClassrooms,
    setCoursesTimestamp,
    setLessonsTimestamp,
    setClassroomsTimestamp,
    courses,
    lessons,
    classrooms,
  ]);

  const handleStatClick = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard-page">
      {/* Statistics Section */}
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

      {/* Primary Actions Section */}
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

      {/* Import/Export Modals */}
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

// Reusable StatCard component
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
