import React from "react";

// Return a styled badge element for a given type string. Normalizes casing and
// maps known keywords to consistent labels and CSS classes.
export function typeBadge(type) {
  const raw = String(type || "").trim();
  const t = raw.toLowerCase();

  if (!t) return <span className="type-badge type-normal">Unknown</span>;

  // Normalize to four canonical English types: Lecture, Practice, Laboratory, PBL
  // Map common synonyms/casing variants to these canonical labels.
  if (t === "lecture" || t === "lec" || t === "lect") {
    return <span className="type-badge type-lecture">Lecture</span>;
  }

  if (t === "practice" || t === "practical" || t === "tutorial" || t === "tutorials" || t === "tutor" || t === "tut") {
    return <span className="type-badge type-practice">Practice</span>;
  }

  if (t === "laboratory" || t === "lab") {
    return <span className="type-badge type-lab">Laboratory</span>;
  }

  if (t === "pbl" || t === "project" || t === "project-based" || t === "project-based learning" || t === "project-based-learning") {
    return <span className="type-badge type-pbl">PBL</span>;
  }

  // Additional domain-specific fallbacks
  if (t.includes("project")) return <span className="type-badge type-pbl">PBL</span>;
  if (t.includes("tutorial") || t.includes("tut")) return <span className="type-badge type-practice">Practice</span>;
  if (t.includes("lab")) return <span className="type-badge type-lab">Laboratory</span>;

  if (t.includes("network")) return <span className="type-badge type-network">Networking Lab</span>;
  if (t.includes("physics")) return <span className="type-badge type-physics">Physics Lab</span>;

  // Last resort: show the raw value but capitalized (English-only requirement: if raw contains non-latin chars, still display raw)
  const capitalized = raw.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  return <span className="type-badge type-normal">{capitalized}</span>;
}

export default typeBadge;
