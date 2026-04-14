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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }

  return res.json(); // Assuming the server returns JSON with details about the upload
}

export async function uploadCourses(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/courses/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }

  return res.json();
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

export async function getAllCourses(caller = "Unknown") {
  console.warn(`%c [API GET] getAllCourses | Called by: ${caller}`, "color: white; background: #4f46e5; padding: 4px; border-radius: 4px;");
  const res = await fetch(`${BASE_URL}/getAllCourses`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch courses failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function getAllCoursesGrouped(caller = "Unknown") {
  console.warn(`%c [API GET] getAllCoursesGrouped | Called by: ${caller}`, "color: white; background: #6366f1; padding: 4px; border-radius: 4px;");
  const res = await fetch(`${BASE_URL}/getAllCoursesGrouped`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch grouped courses failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function deleteCourses(courses) {
  const res = await fetch(`${BASE_URL}/deleteCourses`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(courses),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Delete courses failed: ${res.status} ${text}`);
  }

  return res.text();
}

export async function updateCourse(request) {
  const res = await fetch(`${BASE_URL}/courses/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Update course failed: ${res.status} ${text}`);
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


// Download lessons data as an Excel file (returns the Blob).
export async function exportLessons() {
  const res = await fetch(`${BASE_URL}/lessons/export`, {
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

export async function getAllClassrooms(caller = "Unknown") {
  console.warn(`%c [API GET] getAllClassrooms | Called by: ${caller}`, "color: white; background: #059669; padding: 4px; border-radius: 4px;");
  const res = await fetch(`${BASE_URL}/getAllClassrooms`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch classrooms failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function deleteClassrooms(classrooms) {
  const res = await fetch(`${BASE_URL}/classrooms/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(classrooms),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Delete classrooms failed: ${res.status} ${text}`);
  }

  return res.text();
}

export async function updateClassroom(request) {
  const res = await fetch(`${BASE_URL}/classrooms/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Update classroom failed: ${res.status} ${text}`);
  }

  return res.text();
}

export async function getAllLessons(caller = "Unknown") {
  console.warn(`%c [API GET] getAllLessons | Called by: ${caller}`, "color: white; background: #0891b2; padding: 4px; border-radius: 4px;");
  const res = await fetch(`${BASE_URL}/getAlllessons`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch lessons failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function addLesson(lesson) {
  const res = await fetch(`${BASE_URL}/addSingleLesson`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lesson),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Add lesson failed: ${res.status} ${text}`);
  }

  return res.text();
}

export async function deleteLessons(lessons) {
  const res = await fetch(`${BASE_URL}/deleteLessons`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lessons),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Delete lessons failed: ${res.status} ${text}`);
  }

  return res.text();
}



export async function getUserRole(token) {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to get user role");
  }

  return res.json();
}



export async function getAllUsers(token) {
  const res = await fetch(`${BASE_URL}/auth/users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  return res.json();
}

export async function updateUserRole(uid, role, token) {
  const res = await fetch(
    `${BASE_URL}/auth/users/${uid}/role?role=${role}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update role");
  }
}


export async function createUser(email, password, role, token) {
  const res = await fetch(
    `${BASE_URL}/auth/users?email=${email}&password=${password}&role=${role}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to create user");
  }

  return res.text(); 
}

export async function deleteUser(uid, token) {
  const res = await fetch(
    `${BASE_URL}/auth/users/${uid}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete user");
  }
}

export async function generateTimetable() {
  const res = await fetch(`${BASE_URL}/timetable/generate`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Generation failed: ${res.status} ${text}`);
  }

  return res.json();
}


export async function getAllLecturers(caller = "Unknown") {
  console.warn(`%c [API GET] getAllLecturers | Called by: ${caller}`, "color: white; background: #d97706; padding: 4px; border-radius: 4px;");
  const res = await fetch(`${BASE_URL}/getAllLecturers`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch lecturers failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function addLecturer(lecturer) {
  const res = await fetch(`${BASE_URL}/addSingleLecturer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(lecturer),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Add lecturer failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function updateLecturer(lecturer) {
  const res = await fetch(`${BASE_URL}/updateLecturer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(lecturer),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Update lecturer failed: ${res.status} ${text}`);
  }

  return res.text();
}

export async function deleteLecturers(lecturers) {
  const res = await fetch(`${BASE_URL}/deleteLecturers`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(lecturers),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Delete lecturers failed: ${res.status} ${text}`);
  }

  return res.text();
}


export async function uploadLecturersExcel(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/lecturers/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function exportLecturersExcel() {
  const res = await fetch(`${BASE_URL}/lecturers/export`, {
    method: "GET",
    headers: { Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  });
  if (!res.ok) throw new Error("Export failed");
  return res.blob();
}



