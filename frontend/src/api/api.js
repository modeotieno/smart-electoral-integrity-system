// Flexible API URL: supports empty string (relative via nginx proxy), explicit URL, or localhost fallback.
// In prod behind nginx, set VITE_API_URL="" to use same-origin /api via proxy.
const API_URL = (() => {
  const raw = import.meta.env.VITE_API_URL;
  if (raw !== undefined && raw !== null) {
    const trimmed = String(raw).trim();
    if (trimmed === "") return ""; // relative — uses nginx /api proxy
    return trimmed.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return window.location.origin;
  }
  return "http://localhost:8080";
})();

function authHeaders() {
  const token = localStorage.getItem("seis_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path, options = {}) {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...(options.headers || {}) },
  });
  // 401 → token expired/invalid → auto logout
  if (res.status === 401) {
    const body = await res.clone().json().catch(() => ({}));
    // only auto-logout for auth endpoints, not public ones
    if (path.includes("/auth/") || path.includes("/biometric/") || path.includes("/users") || path.includes("/audit-logs")) {
      // Don't auto-redirect during background poll; just clear
      if (body.error && body.error.includes("expired")) {
        logout();
        // soft redirect if in browser
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          console.warn("Session expired, logged out");
        }
      }
    }
  }
  return res;
}

async function parseJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

export async function checkBackend() {
  const res = await apiFetch(`/api/health`);
  if (!res.ok) throw new Error("Backend request failed");
  return parseJson(res);
}

export async function register({ full_name, email, password, role }) {
  const res = await apiFetch(`/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name, email, password, role }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Registration failed");
  if (data.token) localStorage.setItem("seis_token", data.token);
  if (data.user) localStorage.setItem("seis_user", JSON.stringify(data.user));
  // notify AuthContext listeners
  window.dispatchEvent(new Event("seis-auth-change"));
  return data;
}

export async function login({ email, password }) {
  const res = await apiFetch(`/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Login failed");
  if (data.token) localStorage.setItem("seis_token", data.token);
  if (data.user) localStorage.setItem("seis_user", JSON.stringify(data.user));
  window.dispatchEvent(new Event("seis-auth-change"));
  return data;
}

export async function me() {
  const res = await apiFetch(`/api/auth/me`, {
    headers: { ...authHeaders() },
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Auth check failed");
  return data;
}

export function logout() {
  localStorage.removeItem("seis_token");
  localStorage.removeItem("seis_user");
  window.dispatchEvent(new Event("seis-auth-change"));
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

export function getRole() {
  const u = getStoredUser();
  return u?.role || "";
}

export function hasRole(...allowed) {
  const role = getRole();
  return allowed.includes(role);
}

// Centralized RBAC map mirrors backend middleware.RequireRole
export const ROLES = {
  CAN_CREATE_ELECTION: ["election_administrator", "returning_officer", "presiding_officer"],
  CAN_CREATE_CANDIDATE: ["election_administrator", "returning_officer"],
  CAN_CREATE_STATION: ["election_administrator", "returning_officer"],
  CAN_SUBMIT_RESULT: ["presiding_officer", "returning_officer", "election_administrator"],
  CAN_VERIFY_RESULT: ["returning_officer", "election_administrator"],
  CAN_MANAGE_USERS: ["election_administrator", "system_administrator"],
};

export function can(permission) {
  const allowed = ROLES[permission] || [];
  return hasRole(...allowed);
}

export async function enrollBiometric({ biometric_type, biometric_data }) {
  const res = await apiFetch(`/api/biometric/enroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ biometric_type, biometric_data }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Biometric enroll failed");
  return data;
}
export async function verifyBiometric({ email, biometric_data }) {
  const res = await apiFetch(`/api/biometric/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, biometric_data }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Biometric verify failed");
  return data;
}
export async function biometricStatus() {
  const res = await apiFetch(`/api/biometric/status`, { headers: { ...authHeaders() } });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Status failed");
  return data;
}
export async function fetchStats() {
  const res = await apiFetch(`/api/stats`);
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Stats failed");
  return data;
}

function buildQS(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== "") qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export async function fetchElections(opts = {}) {
  const qs = buildQS(opts);
  const res = await apiFetch(`/api/elections${qs}`);
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Elections fetch failed");
  if (opts.page || opts.limit || opts.search !== undefined) return data;
  return data.elections || data.data || [];
}
export async function fetchCandidates(opts = {}) {
  const qs = buildQS(opts);
  const res = await apiFetch(`/api/candidates${qs}`);
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Candidates fetch failed");
  if (opts.page || opts.limit || opts.search !== undefined) return data;
  return data.candidates || data.data || [];
}
export async function fetchStations(opts = {}) {
  const qs = buildQS(opts);
  const res = await apiFetch(`/api/stations${qs}`);
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Stations fetch failed");
  if (opts.page || opts.limit || opts.search !== undefined) return data;
  return data.stations || data.data || [];
}
export async function fetchUsers(opts = {}) {
  const qs = buildQS(opts);
  const res = await apiFetch(`/api/users${qs}`, { headers: { ...authHeaders() } });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Users fetch failed");
  if (opts.page || opts.limit || opts.search !== undefined) return data;
  return data.users || data.data || [];
}
export async function fetchResults(opts = {}) {
  const qs = buildQS(opts);
  const res = await apiFetch(`/api/results${qs}`);
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Results fetch failed");
  if (opts.page || opts.limit || opts.search !== undefined) return data;
  return data;
}
export async function fetchAuditLogs(opts = {}) {
  const qs = buildQS(opts);
  const res = await apiFetch(`/api/audit-logs${qs}`, { headers: { ...authHeaders() } });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Audit logs fetch failed");
  if (opts.page || opts.limit || opts.search !== undefined) return data;
  return data.logs || data.data || [];
}
export async function fetchIncidents(opts = {}) {
  const qs = buildQS(opts);
  const res = await apiFetch(`/api/incidents${qs}`, { headers: { ...authHeaders() } });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Incidents fetch failed");
  if (opts.page || opts.limit || opts.search !== undefined) return data;
  return data.incidents || data.data || [];
}
export async function createElection(payload) {
  const res = await apiFetch(`/api/elections`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(payload) });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Create election failed");
  return data;
}
export async function createCandidate(payload) {
  const res = await apiFetch(`/api/candidates`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(payload) });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Create candidate failed");
  return data;
}
export async function createStation(payload) {
  const res = await apiFetch(`/api/stations`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(payload) });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Create station failed");
  return data;
}
export async function submitResult(payload) {
  const res = await apiFetch(`/api/results`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(payload) });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Submit result failed");
  return data;
}
export async function verifyResult(id) {
  const res = await apiFetch(`/api/results/${id}/verify`, { method: "POST", headers: { ...authHeaders() } });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Verify failed");
  return data;
}
export async function reportIncident(payload) {
  const res = await apiFetch(`/api/incidents`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(payload) });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Incident report failed");
  return data;
}

export function getApiUrl() {
  return API_URL || "(relative)";
}
