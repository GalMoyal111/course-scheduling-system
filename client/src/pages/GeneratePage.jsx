import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateTimetable } from "../services/api";
import Button from "../components/ui/Button";

export default function GeneratePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [semester, setSemester] = useState("A");
  
  // 1. המילון האמיתי שנשלח לשרת (חייב להיות תואם ל-Java!)
  const [weights, setWeights] = useState({
    "RoomSizeEfficiency": 5.0,
    "PreferMorningForHardCourses": 5.0,
    "LecturerCompactSchedule": 5.0,
    "CourseComponentsOverlap": 5.0,
    "MandatoryMorningPreferred": 5.0,
    "ElectiveEveningPreferred": 5.0,
    "InconvenientTiming": 5.0,
    "ElectiveCourseInTheSameClassroom": 5.0
  });

  // 2. מילון תרגום - מה שהמשתמש רואה בעיניים (כדי שלא יקרא קוד)
  const constraintLabels = {
    "RoomSizeEfficiency": "Optimize Classroom Capacity",
    "PreferMorningForHardCourses": "Hard Courses in the Morning",
    "LecturerCompactSchedule": "Compact Lecturer Schedule (Avoid Holes)",
    "CourseComponentsOverlap": "Prevent Overlap of Lectures/Tutorials",
    "MandatoryMorningPreferred": "Mandatory Courses in the Morning",
    "ElectiveEveningPreferred": "Elective Courses in the Evening",
    "InconvenientTiming": "Avoid Late Hours & Fridays",
    "ElectiveCourseInTheSameClassroom": "Keep Elective Groups in Same Room"
  };

  const handleWeightChange = (constraintName, value) => {
    setWeights((prev) => ({
      ...prev,
      [constraintName]: parseFloat(value),
    }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    try {
      // אורזים את הנתונים בדיוק במבנה של ה-DTO שבנינו ב-Java
      const requestData = {
        semester: semester,
        softConstraintWeights: weights
      };

      // שולחים לשרת
      const generatedSchedule = await generateTimetable(requestData);

      // קופצים לדף התצוגה ומעבירים אליו את התוצאה!
      navigate("/timetable", { state: { schedule: generatedSchedule } });
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Generate Timetable AI ✨</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Configure your preferences for the upcoming semester scheduling.
      </p>

      {error && <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>}

      <div style={{ marginBottom: "30px", padding: "15px", background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h3>1. Select Semester</h3>
        <select 
          value={semester} 
          onChange={(e) => setSemester(e.target.value)}
          style={{ padding: "8px", fontSize: "16px", borderRadius: "4px", width: "200px", marginTop: "10px" }}
        >
          <option value="A">Semester A</option>
          <option value="B">Semester B</option>
          <option value="SUMMER">Summer</option>
        </select>
      </div>

      <div style={{ marginBottom: "30px", padding: "15px", background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h3>2. Adjust Preferences (1-10)</h3>
        <p style={{ fontSize: "14px", color: "#666" }}>1 = Don't care, 10 = Extremely important</p>
        
        {Object.keys(weights).map((constraint) => (
          <div key={constraint} style={{ marginTop: "15px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ width: "300px", fontWeight: "500" }}>{constraintLabels[constraint]}</span>
            <input 
              type="range" 
              min="1" max="10" step="0.5" 
              value={weights[constraint]} 
              onChange={(e) => handleWeightChange(constraint, e.target.value)}
              style={{ flex: 1, margin: "0 15px" }}
            />
            <span style={{ width: "40px", textAlign: "right", fontWeight: "bold" }}>{weights[constraint]}</span>
          </div>
        ))}
      </div>

      <Button onClick={handleGenerate} disabled={loading} style={{ width: "100%", padding: "15px", fontSize: "18px" }}>
        {loading ? "Generating Magic... ⏳" : "Generate Timetable 🚀"}
      </Button>
    </div>
  );
}