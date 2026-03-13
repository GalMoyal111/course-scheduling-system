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

export async function uploadRooms(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/rooms/upload`, {
    method: "POST",
    body: formData,
  });

  return res.text();
}