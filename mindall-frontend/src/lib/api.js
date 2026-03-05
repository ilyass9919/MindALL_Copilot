// ── Base URL — reads from .env in production, falls back to localhost ────────
export const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ── Auth helpers ─────────────────────────────────────────────────────────────
export const getToken = () => sessionStorage.getItem("mindall_token");
export const getUser  = () => {
  try { return JSON.parse(sessionStorage.getItem("mindall_user")); }
  catch { return null; }
};
export const setAuth = (token, user) => {
  sessionStorage.setItem("mindall_token", token);
  sessionStorage.setItem("mindall_user", JSON.stringify(user));
};
export const clearAuth = () => {
  sessionStorage.removeItem("mindall_token");
  sessionStorage.removeItem("mindall_user");
};
export const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`
});

// ── Auth endpoints ───────────────────────────────────────────────────────────
export const authLogin = async (email, password) => {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Login failed");
  return data;
};

export const authRegister = async (name, email, password) => {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Registration failed");
  return data;
};

// ── Project endpoints ────────────────────────────────────────────────────────
export const fetchProjects = async () => {
  const res = await fetch(`${API}/projects`, { headers: authHeaders() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  return res.json();
};

export const fetchProject = async (id) => {
  const res = await fetch(`${API}/projects/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Project not found");
  return res.json();
};

export const createProject = async (basic) => {
  const res = await fetch(`${API}/projects`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(basic)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to create project");
  return data;
};

export const updateProjectOnboarding = async (id, payload) => {
  const res = await fetch(`${API}/projects/${id}/onboarding`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to save context");
  return res.json();
};

// ── Chat endpoints ───────────────────────────────────────────────────────────
export const fetchMessages = async (projectId) => {
  const res = await fetch(`${API}/projects/${projectId}/messages`, {
    headers: authHeaders()
  });
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
};

export const sendChatMessage = async (projectId, query) => {
  const res = await fetch(`${API}/projects/${projectId}/chat`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error("Chat request failed");
  return res.json();
};