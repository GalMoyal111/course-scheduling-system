import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import Button from "../components/ui/Button";
import Toast, { useToast } from "../components/ui/Toast";
import "./HistoryPage.css";

export default function HistoryPage() {
  const { history, fetchHistoryIfNeeded, loadTimetableFromHistory } = useData();
  const { toast, showError, closeToast } = useToast();
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null); 

  useEffect(() => {
    fetchHistoryIfNeeded("HistoryPage");
  }, [fetchHistoryIfNeeded]);

  const handleLoadTimetable = async (id) => {
    setLoadingId(id);
    const success = await loadTimetableFromHistory(id, "HistoryPage");
    setLoadingId(null);
    
    if (success) {
      navigate("/timetable");
    } else {
      showError("Failed to load timetable. Please try again.");
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString("he-IL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>Saved Timetables</h1>
        <p>View and load your previously saved schedules.</p>
      </div>

      <div className="history-grid">
        {history.length === 0 ? (
          <div className="empty-state">
            <span className="material-icons">history</span>
            <p>No saved timetables found.</p>
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="history-card">
              <div className="history-card-content">
                <h3>{item.name}</h3>
                <span className="semester-badge">Semester {item.semester}</span>
                <div className="date-text">
                  <span className="material-icons">schedule</span>
                  {formatDate(item.createdAt)}
                </div>
              </div>
              <div className="history-card-actions">
                <Button 
                  onClick={() => handleLoadTimetable(item.id)} 
                  disabled={loadingId === item.id}
                  variant="primary"
                >
                  {loadingId === item.id ? "Loading..." : "Load Timetable"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}