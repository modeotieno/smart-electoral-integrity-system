const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function authHeaders() {
  const token = localStorage.getItem("seis_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function checkBackend() {
  const response = await fetch(`${API_URL}/api/health`);
  if (!response.ok) throw new Error("Backend request failed");
  return response.json();
}

export async function register({ full_name, email, password, role }) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name, email, password, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  if (data.token) localStorage.setItem("seis_token", data.token);
  if (data.user) localStorage.setItem("seis_user", JSON.stringify(data.user));
  return data;
}

export async function login({ email, password }) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  if (data.token) localStorage.setItem("seis_token", data.token);
  if (data.user) localStorage.setItem("seis_user", JSON.stringify(data.user));
  return data;
}

export async function me() {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { ...authHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Auth check failed");
  return data;
}

export function logout() {
  localStorage.removeItem("seis_token");
  localStorage.removeItem("seis_user");
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("seis_user") || "null");
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem("seis_token");
}

export async function enrollBiometric({ biometric_type, biometric_data }) {
  const res = await fetch(`${API_URL}/api/biometric/enroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ biometric_type, biometric_data }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Biometric enroll failed");
  return data;
}
export async function verifyBiometric({ email, biometric_data }) {
  const res = await fetch(`${API_URL}/api/biometric/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, biometric_data }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Biometric verify failed");
  return data;
}
export async function biometricStatus() {
  const res = await fetch(`${API_URL}/api/biometric/status`, { headers: { ...authHeaders() } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Status failed");
  return data;
}
export async function fetchStats() {
  const res = await fetch(`${API_URL}/api/stats`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Stats failed");
  return data;
}
