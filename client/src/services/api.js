const BASE_URL = "http://localhost:8080/api";

export async function ping() {
  const res = await fetch(`${BASE_URL}/ping`);
  return res.text();
}

export async function uploadLessons(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  return res.text();
}

export async function uploadCourses(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/courses/upload`, {
    method: "POST",
    body: formData,
  });
  return res.text();
}

// Download courses data as an Excel file (returns the Blob).
export async function exportCourses() {
  const res = await fetch(`${BASE_URL}/courses/export`, {
    method: "GET",
    headers: {
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Export failed: ${res.status} ${text}`);
  }

  return res.blob();
}

export async function addCourse(course) {
  const res = await fetch(`${BASE_URL}/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(course),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Add course failed: ${res.status} ${text}`);
  }

  return res.text();
}

export async function uploadRooms(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/rooms/upload`, {
    method: "POST",
    body: formData,
  });

  return res.text();
}

// Download rooms data as an Excel file (returns the Blob).
export async function exportRooms() {
  const res = await fetch(`${BASE_URL}/rooms/export`, {
    method: "GET",
    headers: {
      // Accepting binary Excel data
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Export failed: ${res.status} ${text}`);
  }

  const blob = await res.blob();
  return blob;
}


export async function addRoom(classroom) {
  const res = await fetch(`${BASE_URL}/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(classroom),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Add room failed: ${res.status} ${text}`);
  }

  return res.text();
}