import React, { useEffect } from "react";
import { useLocation } from "react-router-dom"; 
import Button from "../components/ui/Button";
import { useData } from "../context/DataContext";
import "./TimetablePage.css";

export default function TimetablePage() {
  const { schedule } = useData();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const hebrewDays = [
    { name: "ראשון", index: 1 }, { name: "שני", index: 2 }, { name: "שלישי", index: 3 },
    { name: "רביעי", index: 4 }, { name: "חמישי", index: 5 }, { name: "שישי", index: 6 },
  ];

  const times = [
    { range: "08:30-09:20", frame: 1, isBreak: false },
    { range: "09:30-10:20", frame: 2, isBreak: false },
    { range: "10:30-11:20", frame: 3, isBreak: false },
    { range: "11:30-12:20", frame: 4, isBreak: false },
    { range: "12:20-12:50", frame: null, isBreak: true }, 
    { range: "12:50-13:40", frame: 5, isBreak: false },
    { range: "13:50-14:40", frame: 6, isBreak: false },
    { range: "14:50-15:40", frame: 7, isBreak: false },
    { range: "15:50-16:40", frame: 8, isBreak: false },
    { range: "16:50-17:40", frame: 9, isBreak: false },
    { range: "17:50-18:40", frame: 10, isBreak: false },
    { range: "18:50-19:40", frame: 11, isBreak: false },
    { range: "19:50-20:40", frame: 12, isBreak: false },
  ];

  // פונקציית תרגום לסוג השיעור
  const translateType = (type) => {
    const types = {
      "LECTURE": "הרצאה",
      "TUTORIAL": "תרגול",
      "LAB": "מעבדה",
      "PHYSICS_LAB": "מעבדת פיזיקה",
      "NETWORKING_LAB": "מעבדת תקשורת",
      "PBL": "PBL"
    };
    return types[type] || type;
  };

  const getLessonsForSlot = (day, frame) => {
    if (!frame) return [];
    if (!schedule || !Array.isArray(schedule)) return [];

    return schedule.filter((lesson) => {
      // ב-DTO ששלחת השדות הם: day, startFrame, duration
      const start = lesson.startFrame;
      const end = start + (lesson.duration || 1) - 1;
      return lesson.day === day && frame >= start && frame <= end;
    });
  };

  return (
    <div className="timetable-page">
      <div className="timetable-header">
        <h1>Created time schedule</h1>
        <Button onClick={() => window.print()} variant="secondary">
          <span className="material-icons" style={{ marginRight: 8 }}>print</span>
          Printing system
        </Button>
      </div>

      <div className="timetable-container">
        {schedule.length === 0 ? (
          <div className="empty-state">
             <span className="material-icons">calendar_today</span>
             <p>No timetable found. Please generate via the "Generate" page.</p>
          </div>
        ) : (
          <table className="timetable-table">
            <thead>
              <tr>
                <th className="time-column">שעה</th>
                {hebrewDays.map((day) => (
                  <th key={day.index}>{day.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {times.map((timeItem, idx) => (
                <tr key={idx} className={timeItem.isBreak ? "break-row-style" : ""}>
                  <td className="time-cell-label">{timeItem.range}</td>
                  {hebrewDays.map((day) => {
                    const lessons = getLessonsForSlot(day.index, timeItem.frame);
                    return (
                      <td key={`${day.index}-${idx}`} className="slot-cell">
                        {timeItem.isBreak ? (
                          <div className="break-text">הפסקה</div>
                        ) : (
                          lessons.map((l, i) => (
                            <div key={i} className="lesson-card">
                              <div className="lesson-header">
                                <span className="lesson-course" title={l.courseName}>
                                  {l.courseName || l.courseId}
                                </span>
                                <span className="lesson-type">{translateType(l.type)}</span>
                              </div>
                              <div className="lesson-lecturer">
                                <span style={{ fontWeight: 'bold', marginLeft: '4px' }}>{l.courseId}</span> 
                                • {l.lecturer}
                              </div>
                              {l.room && (
                                <div className="lesson-room">
                                  <span className="material-icons">location_on</span>
                                  {l.room.classroomName} {/* <--- כאן שינינו ל-classroomName */}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}