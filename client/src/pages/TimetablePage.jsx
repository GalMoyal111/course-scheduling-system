import React, { useState } from "react";
import { generateTimetable } from "../services/api";

export default function TimetablePage() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRunAlgorithm = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await generateTimetable();
      setSchedule(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLessonsForSlot = (day, hour) => {
    return schedule.filter((lesson) => {
      const start = lesson.startFrame;
      const end = start + (lesson.duration || 1) - 1;
      return lesson.day === day && hour >= start && hour <= end;
    });
  };

  const days = [1, 2, 3, 4, 5, 6]; 
  const hours = Array.from({ length: 12 }, (_, i) => i + 1); 

  return (
    <div style={{ padding: "20px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2>Timetable Output</h2>
        <button 
          onClick={handleRunAlgorithm} 
          disabled={loading}
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
        >
          {loading ? "Running Algorithm..." : "Run Algorithm 🚀"}
        </button>
      </header>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* טבלת השיבוץ */}
      <div style={{ overflowX: "auto" }}>
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4", color: "#333" }}>
              <th>Hour \ Day</th>
              {days.map((d) => (
                <th key={d}>Day {d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour) => (
              <tr key={hour}>
                <td style={{ fontWeight: "bold", backgroundColor: "#f9f9f9", color: "#333" }}>{hour}</td>
                {days.map((day) => {
                  const lessonsInSlot = getLessonsForSlot(day, hour);
                  return (
                    <td key={`${day}-${hour}`} style={{ verticalAlign: "top", minWidth: "120px" }}>
                      {lessonsInSlot.map((l, idx) => (
                        <div 
                          key={idx} 
                          style={{ 
                            border: "1px solid #ccc", 
                            borderRadius: "5px", 
                            padding: "5px", 
                            marginBottom: "5px",
                            backgroundColor: "#e3f2fd",
                            fontSize: "0.85em",
                            color: "#000"
                          }}
                        >
                          <strong>{l.courseId}</strong> ({l.type})<br />
                          {l.lecturer}<br />
                          {l.room ? `${l.room.building}-${l.room.classroomName}` : "No Room"}
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}