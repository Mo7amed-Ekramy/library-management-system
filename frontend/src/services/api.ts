const API_URL = "http://localhost:5000/api";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "API Error");
  }

  return res.json();
}
