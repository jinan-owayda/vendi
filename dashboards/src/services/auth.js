import api from "./api";

const SESSION_KEY = "vendi_dashboard_session";

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveSession(token, user) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      token,
      user,
    })
  );
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function isAllowedRole(role) {
  return role === "admin" || role === "vendor";
}

export async function loginRequest(email, password) {
  const response = await api.post("/guest/login", {
    email,
    password,
  });

  return response.data;
}