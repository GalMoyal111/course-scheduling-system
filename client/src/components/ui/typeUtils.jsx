import React from "react";

// Return a styled badge element for a given type string. Normalizes casing and
// maps known keywords to consistent labels and CSS classes.
export function typeBadge(type) {
  const raw = String(type || "").trim();
  const t = raw.toUpperCase(); // עובדים עם UpperCase כדי להתאים ל-Enum ב-Java

  if (!t) return <span className="type-badge type-normal">Unknown</span>;

  // 1. בדיקת התאמה מדויקת ל-Enums (עדיפות עליונה)
  const exactMatch = {
    "PHYSICS_LAB": { label: "Physics Lab", className: "type-physics" },
    "NETWORKING_LAB": { label: "Networking Lab", className: "type-network" },
    "LAB": { label: "Laboratory", className: "type-lab" },
    "LECTURE": { label: "Lecture", className: "type-lecture" },
    "TUTORIAL": { label: "Practice", className: "type-practice" },
    "NORMAL": { label: "Normal", className: "type-normal" },
    "PBL": { label: "PBL", className: "type-pbl" },
    "PROJECT": { label: "Project", className: "type-pbl" },
    "AUDITORIUM": { label: "Auditorium", className: "type-auditorium" },
  };

  if (exactMatch[t]) {
    return (
      <span className={`type-badge ${exactMatch[t].className}`}>
        {exactMatch[t].label}
      </span>
    );
  }

  // 2. לוגיקת "חילוץ" במקרה שהטקסט מגיע בפורמט אחר (למשל מהאקסל הישן)
  const lower = t.toLowerCase();

  if (lower.includes("physics")) 
    return <span className="type-badge type-physics">Physics Lab</span>;
  
  if (lower.includes("network")) 
    return <span className="type-badge type-network">Networking Lab</span>;
  
  if (lower.includes("lab")) 
    return <span className="type-badge type-lab">Laboratory</span>;

  if (lower.includes("lecture") || lower === "lec") 
    return <span className="type-badge type-lecture">Lecture</span>;

  if (lower.includes("practice") || lower.includes("tutorial") || lower === "tut") 
    return <span className="type-badge type-practice">Practice</span>;

  if (lower.includes("pbl") || lower.includes("project")) 
    return <span className="type-badge type-pbl">PBL</span>;

  // 3. ברירת מחדל: מציג את הטקסט הגולמי עם אות גדולה בהתחלה
  const capitalized = raw
    .toLowerCase()
    .split(/_|\s/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return <span className="type-badge type-normal">{capitalized}</span>;
}

export default typeBadge;
