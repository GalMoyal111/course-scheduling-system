import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function TimetablePage() {
  const location = useLocation();
  const [schedule, setSchedule] = useState([]);

  // קליטת הנתונים שהגיעו מהדף הקודם (GeneratePage)
  useEffect(() => {
    if (location.state && location.state.schedule) {
      setSchedule(location.state.schedule);
    }
  }, [location.state]);

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
      <h2>Timetable Output</h2>
      {schedule.length === 0 ? (
        <p>No timetable found. Please go to the <strong>Generate</strong> page.</p>
      ) : (
        <table border="1" style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4" }}>
              <th>Hour \ Day</th>
              {days.map(d => <th key={d}>Day {d}</th>)}
            </tr>
          </thead>
          <tbody>
            {hours.map(hour => (
              <tr key={hour}>
                <td style={{ fontWeight: "bold" }}>{hour}</td>
                {days.map(day => (
                  <td key={`${day}-${hour}`} style={{ verticalAlign: "top", height: "60px" }}>
                    {getLessonsForSlot(day, hour).map((l, i) => (
                      <div key={i} style={{ background: "#e3f2fd", marginBottom: "2px", fontSize: "0.8em", padding: "2px", border: "1px solid #90caf9" }}>
                        <strong>{l.courseId}</strong><br/>{l.lecturer}
                      </div>
                    ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}