import React, { useState } from "react";
import Button from "../components/ui/Button";
import AddLecturerModal from "../components/AddLecturerModal";
import "./LecturersPage.css";

// Sample lecturer data with unavailableSlots structure
const SAMPLE_LECTURERS = [
  {
    id: 1,
    name: "ד״ר שרה כהן",
    unavailableSlots: [
      { day: 1, startFrame: 1 }, // יום ראשון, שעת בוקר מוקדמת
      { day: 1, startFrame: 2 },
    ],
  },
  {
    id: 2,
    name: "פרופ׳ דוד לוי",
    unavailableSlots: [], // זמין תמיד כברירת מחדל
  },
  {
    id: 3,
    name: "ד״ר רחל מזרחי",
    unavailableSlots: [
      { day: 3, startFrame: 10 },
      { day: 3, startFrame: 11 },
    ],
  },
];

export default function LecturersPage() {
  const [lecturers, setLecturers] = useState(SAMPLE_LECTURERS);
  const [selectedLecturerId, setSelectedLecturerId] = useState(lecturers[0]?.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null);

  const selectedLecturer = lecturers.find((l) => l.id === selectedLecturerId);

  const handleAddLecturer = (newLecturer) => {
    const lecturer = {
      id: Math.max(...lecturers.map((l) => l.id), 0) + 1,
      ...newLecturer,
      unavailableSlots: newLecturer.unavailableSlots || [], // Initialize if missing
    };
    setLecturers([...lecturers, lecturer]);
    setSelectedLecturerId(lecturer.id);
    setIsModalOpen(false);
  };

  const handleEditLecturer = (updatedLecturer) => {
    setLecturers(
      lecturers.map((l) => (l.id === updatedLecturer.id ? updatedLecturer : l))
    );
    setIsModalOpen(false);
    setEditingLecturer(null);
  };

  const handleToggleAvailability = (dayIndex, startFrame) => {
    setLecturers(
      lecturers.map((lecturer) => {
        if (lecturer.id === selectedLecturerId) {
          // Check if slot exists in unavailable array
          const slotExists = lecturer.unavailableSlots.some(
            (slot) => slot.day === dayIndex && slot.startFrame === startFrame
          );

          let updatedSlots;
          if (slotExists) {
            // If exists, remove it (make available)
            updatedSlots = lecturer.unavailableSlots.filter(
              (slot) => !(slot.day === dayIndex && slot.startFrame === startFrame)
            );
          } else {
            // If doesn't exist, add it (make unavailable)
            updatedSlots = [
              ...lecturer.unavailableSlots,
              { day: dayIndex, startFrame: startFrame },
            ];
          }

          return { ...lecturer, unavailableSlots: updatedSlots };
        }
        return lecturer;
      })
    );
  };

  const openEditModal = () => {
    setEditingLecturer(selectedLecturer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLecturer(null);
  };

  return (
    <div className="lecturers-page" dir="rtl">
      <div className="lecturers-container">
        {/* Right Sidebar - Lecturers List (RTL aligns right) */}
        <div className="lecturers-sidebar">
          <div className="lecturers-header">
            <h2>מרצים</h2>
            <button
              className="add-lecturer-btn"
              onClick={() => {
                setEditingLecturer(null);
                setIsModalOpen(true);
              }}
              title="הוספת מרצה"
              aria-label="הוספת מרצה"
            >
              <span className="material-icons">add</span>
            </button>
          </div>

          <div className="lecturers-list">
            {lecturers.map((lecturer) => (
              <div
                key={lecturer.id}
                className={`lecturer-item ${
                  selectedLecturerId === lecturer.id ? "active" : ""
                }`}
                onClick={() => setSelectedLecturerId(lecturer.id)}
              >
                <p className="lecturer-name">{lecturer.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Panel - Lecturer Details and Availability */}
        {selectedLecturer && (
          <div className="lecturer-details-panel">
            {/* Header with lecturer name and edit button */}
            <div className="details-header">
              <h1>{selectedLecturer.name}</h1>
              <button className="edit-btn" onClick={openEditModal}>
                <span className="material-icons">edit</span>
                עריכה
              </button>
            </div>

            {/* Weekly Availability Timetable */}
            <div className="availability-section">
              <h3> Weekly availability </h3>
              <p className="availability-hint">
                 click on a cell to toggle availability (green = available, red = unavailable)
              </p>
              <AvailabilityTable
                lecturer={selectedLecturer}
                onToggle={handleToggleAvailability}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Lecturer Modal */}
      <AddLecturerModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={editingLecturer ? handleEditLecturer : handleAddLecturer}
        initialLecturer={editingLecturer}
      />
    </div>
  );
}

function AvailabilityTable({ lecturer, onToggle }) {
  // Mapping days to indices matching DomainValue (1 = Sunday, 6 = Friday)
  const hebrewDays = [
    { name: "ראשון", index: 1 },
    { name: "שני", index: 2 },
    { name: "שלישי", index: 3 },
    { name: "רביעי", index: 4 },
    { name: "חמישי", index: 5 },
    { name: "שישי", index: 6 },
  ];

  // Defining the time frames (frames 1 to 15, matching DomainValue)
  const times = [
    { range: "08:30-09:20", frame: 1, isBreak: false },
    { range: "09:30-10:20", frame: 2, isBreak: false },
    { range: "10:30-11:20", frame: 3, isBreak: false },
    { range: "11:30-12:20", frame: 4, isBreak: false },
    { range: "12:20-12:50", frame: null, isBreak: true }, // Break has no frame
    { range: "12:50-13:40", frame: 5, isBreak: false },
    { range: "13:50-14:40", frame: 6, isBreak: false },
    { range: "14:50-15:40", frame: 7, isBreak: false },
    { range: "15:50-16:40", frame: 8, isBreak: false },
    { range: "16:50-17:40", frame: 9, isBreak: false },
    { range: "17:50-18:40", frame: 10, isBreak: false },
    { range: "18:50-19:40", frame: 11, isBreak: false },
    { range: "19:50-20:40", frame: 12, isBreak: false },
  ];

  return (
    <div className="availability-table-wrapper">
      <table className="availability-table">
        <thead>
          <tr>
            <th className="time-column">שעות</th>
            {hebrewDays.map((day) => (
              <th key={day.index} className="day-column">
                <div className="day-header-content">
                  <div className="day-hebrew">{day.name}</div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map((timeItem) => (
            <tr key={timeItem.range} className={timeItem.isBreak ? "break-row" : ""}>
              <td className={`time-cell ${timeItem.isBreak ? "break-time" : ""}`}>
                {timeItem.range}
              </td>
              {hebrewDays.map((day) => {
                const isTuesdayAfternoon = day.index === 6 && timeItem.frame >= 5;
                if (timeItem.isBreak || isTuesdayAfternoon) {
                  return (
                    <td
                      key={`${day.index}-break-${timeItem.range}`}
                      className="availability-cell break-cell"
                    >
                      {timeItem.isBreak ? "Break" : "No classes"}
                    </td>
                  );
                }

                // Check if this specific day and frame is in the unavailableSlots array
                const isUnavailable = lecturer.unavailableSlots.some(
                  (slot) =>
                    slot.day === day.index && slot.startFrame === timeItem.frame
                );
                
                // If it is NOT in unavailable slots, then the lecturer is Available
                const isAvailable = !isUnavailable;

                return (
                  <td
                    key={`${day.index}-${timeItem.frame}`}
                    className={`availability-cell ${
                      isAvailable ? "available" : "unavailable"
                    }`}
                    onClick={() => onToggle(day.index, timeItem.frame)}
                    title={
                      isAvailable
                        ? "available - click to block"
                        : "unavailable - click to unblock"
                    }
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}