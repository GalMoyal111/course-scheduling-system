import React, { useState } from "react";
import Button from "../components/ui/Button";
import AddLecturerModal from "../components/AddLecturerModal";
import "./LecturersPage.css";

// Sample lecturer data
const SAMPLE_LECTURERS = [
  {
    id: 1,
    name: "Dr. Sarah Cohen",
    maxDailyHours: 6,
    maxConsecutiveHours: 3,
    availability: generateDefaultAvailability(),
  },
  {
    id: 2,
    name: "Prof. David Levi",
    maxDailyHours: 8,
    maxConsecutiveHours: 4,
    availability: generateDefaultAvailability(),
  },
  {
    id: 3,
    name: "Dr. Rachel Mizrahi",
    maxDailyHours: 7,
    maxConsecutiveHours: 5,
    availability: generateDefaultAvailability(),
  },
  {
    id: 4,
    name: "Prof. Michael Roth",
    maxDailyHours: 6,
    maxConsecutiveHours: 3,
    availability: generateDefaultAvailability(),
  },
  {
    id: 5,
    name: "Dr. Hannah Goldman",
    maxDailyHours: 7,
    maxConsecutiveHours: 4,
    availability: generateDefaultAvailability(),
  },
];

// Generate default availability (all available)
function generateDefaultAvailability() {
  const availability = {};
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const times = [
    "08:30-09:20",
    "09:20-10:10",
    "10:10-11:00",
    "11:00-11:50",
    "11:50-12:20", // Break
    "12:20-13:10",
    "13:10-14:00",
    "14:00-14:50",
    "14:50-15:40",
    "15:40-16:30",
    "16:30-17:20",
    "17:20-18:10",
    "18:10-19:00",
    "19:00-19:50",
    "19:50-20:40",
  ];

  days.forEach((day) => {
    availability[day] = {};
    times.forEach((time) => {
      availability[day][time] = true; // true = available
    });
  });

  return availability;
}

export default function LecturersPage() {
  const [lecturers, setLecturers] = useState(SAMPLE_LECTURERS);
  const [selectedLecturerId, setSelectedLecturerId] = useState(lecturers[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null);

  const selectedLecturer = lecturers.find((l) => l.id === selectedLecturerId);

  const handleAddLecturer = (newLecturer) => {
    const lecturer = {
      id: Math.max(...lecturers.map((l) => l.id), 0) + 1,
      ...newLecturer,
      availability: generateDefaultAvailability(),
    };
    setLecturers([...lecturers, lecturer]);
    setSelectedLecturerId(lecturer.id);
    setIsModalOpen(false);
  };

  const handleEditLecturer = (updatedLecturer) => {
    setLecturers(
      lecturers.map((l) =>
        l.id === updatedLecturer.id ? updatedLecturer : l
      )
    );
    setIsModalOpen(false);
    setEditingLecturer(null);
  };

  const handleToggleAvailability = (day, time) => {
    setLecturers(
      lecturers.map((l) => {
        if (l.id === selectedLecturerId) {
          return {
            ...l,
            availability: {
              ...l.availability,
              [day]: {
                ...l.availability[day],
                [time]: !l.availability[day][time],
              },
            },
          };
        }
        return l;
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
    <div className="lecturers-page">
      <div className="lecturers-container">
        {/* Left Sidebar - Lecturers List */}
        <div className="lecturers-sidebar">
          <div className="lecturers-header">
            <h2>Lecturers</h2>
            <button
              className="add-lecturer-btn"
              onClick={() => {
                setEditingLecturer(null);
                setIsModalOpen(true);
              }}
              title="Add lecturer"
              aria-label="Add lecturer"
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
                <p className="lecturer-hours">Max {lecturer.maxDailyHours}h/day</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Lecturer Details and Availability */}
        {selectedLecturer && (
          <div className="lecturer-details-panel">
            {/* Header with lecturer name and edit button */}
            <div className="details-header">
              <h1>{selectedLecturer.name}</h1>
              <button className="edit-btn" onClick={openEditModal}>
                <span className="material-icons">edit</span>
                Edit
              </button>
            </div>

            {/* Lecturer Info */}
            <div className="lecturer-info">
              <div className="info-item">
                <p className="info-label">Max Daily Hours</p>
                <p className="info-value">{selectedLecturer.maxDailyHours}h</p>
              </div>
              <div className="info-item">
                <p className="info-label">Max Consecutive Hours</p>
                <p className="info-value">
                  {selectedLecturer.maxConsecutiveHours}h
                </p>
              </div>
            </div>

            {/* Weekly Availability Timetable */}
            <div className="availability-section">
              <h3>Weekly Availability</h3>
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
  const hebrewDays = [
    "ראשון",
    "שני",
    "שלישי",
    "רביעי",
    "חמישי",
    "שישי",
  ];
  const englishDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  const times = [
    { range: "08:30-09:20", isBreak: false },
    { range: "09:30-10:20", isBreak: false },
    { range: "10:30-11:20", isBreak: false },
    { range: "11:30-12:20", isBreak: false },
    { range: "12:20-12:50", isBreak: true }, // Break
    { range: "12:50-13:40", isBreak: false },
    { range: "13:50-14:40", isBreak: false },
    { range: "14:50-15:40", isBreak: false },
    { range: "15:50-16:40", isBreak: false },
    { range: "16:50-17:40", isBreak: false },
    { range: "17:50-18:40", isBreak: false },
    { range: "18:50-19:40", isBreak: false },
    { range: "19:50-20:40", isBreak: false },

  ];

  return (
    <div className="availability-table-wrapper">
      <table className="availability-table">
        <thead>
          <tr>
            <th className="time-column">Time</th>
            {hebrewDays.map((day, index) => (
              <th key={day} className="day-column">
                <div className="day-header-content">
                  <div className="day-hebrew">{day}</div>
                  <div className="day-english">{englishDays[index]}</div>
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
              {englishDays.map((day) => {
                if (timeItem.isBreak) {
                  return (
                    <td
                      key={`${day}-${timeItem.range}`}
                      className="availability-cell break-cell"
                    >
                      Break
                    </td>
                  );
                }

                const isAvailable = lecturer.availability[day][timeItem.range];
                return (
                  <td
                    key={`${day}-${timeItem.range}`}
                    className={`availability-cell ${
                      isAvailable ? "available" : "unavailable"
                    }`}
                    onClick={() => onToggle(day, timeItem.range)}
                    title={
                      isAvailable
                        ? "Click to mark unavailable"
                        : "Click to mark available"
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
