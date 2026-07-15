// const BASE_URL = "http://localhost:5000/api";
const BASE_URL =  "https://pomodoro-tracker-backend-b8rl.onrender.com/api";

const TOKEN_KEY = "embers_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (res.status === 401) {
    setToken(null);
    window.dispatchEvent(new CustomEvent("embers:unauthorized"));
  }

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
    } catch (_) {}
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Auth
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: () => request("/auth/me"),

  // Tasks
  getTasks: () => request("/tasks"),
  createTask: (data) => request("/tasks", { method: "POST", body: JSON.stringify(data) }),
  updateTask: (id, data) =>
    request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: "DELETE" }),

  // Sessions
  getSessions: () => request("/sessions"),
  createSession: (data) => request("/sessions", { method: "POST", body: JSON.stringify(data) }),
  deleteSession: (id) => request(`/sessions/${id}`, { method: "DELETE" }),

  // Analytics
  getSummary: () => request("/analytics/summary"),
  getDaily: (days = 7) => request(`/analytics/daily?days=${days}`),
  getWeekly: (weeks = 6) => request(`/analytics/weekly?weeks=${weeks}`),
  getStreaks: () => request("/analytics/streaks"),

  // Settings
  getSettings: () => request("/settings"),
  updateSettings: (data) =>
    request("/settings", { method: "PATCH", body: JSON.stringify(data) }),
};
