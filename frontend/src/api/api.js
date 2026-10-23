import {
  clearAuthSession,
  getStoredUser as readStoredUser,
  getToken as readToken,
  saveAuthSession,
} from "../auth/session";

// API URL resolution:
// - VITE_API_URL="" (docker/prod) → relative /api via nginx proxy
// - VITE_API_URL unset (npm run dev) → relative /api via vite dev proxy (see vite.config.js)
// - Never hardcode an absolute host — relative URLs work from any address the site is opened on.
const API_URL = (() => {
  const raw = import.meta.env.VITE_API_URL;
  if (raw !== undefined && raw !== null) {
    return String(raw).trim().replace(/\/$/, "");
  }
  return "";
})();

function authHeaders() {
  const token = readToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path, options = {}) {
  const url = `${API_URL}${path}`;
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: { ...(options.headers || {}) },
    });
  } catch {
    throw new Error(
      `Cannot reach the SEIS server at ${API_URL || window.location.origin}. Please make sure the backend is running (docker compose up -d) and you opened the site from http://localhost:5173.`
    );
  }
  if (res.status === 401) {
    let body = {};
    try {
      const src = typeof res.clone === "function" ? res.clone() : res;
      body = await src.json().catch(() => ({}));
    } catch {
      body = {};
    }
    if (path.includes("/auth/") || path.includes("/biometric/") || path.includes("/users") || path.includes("/audit-logs")) {
      if (body.error && body.error.includes("expired")) {
        clearAuthSession();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          console.warn("Session expired, logged out");
        }
      }
    }
  }
  return res;
}

async function parseJson(res) {
  if (typeof res.text === "function") {
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return { raw: text };
    }
  }
  if (typeof res.json === "function") {
    try {
      return await res.json();
    } catch {
      return {};
    }
  }
  return {};
}

export async function checkBackend() {
  const res = await apiFetch(`/api/health`);
  if (!res.ok) throw new Error("Backend request failed");
  return parseJson(res);
}

function normalizeRegisterInput(input = {}) {
  const rawFullName = input.full_name ?? input.name ?? input.fullName ?? input.fullname ?? "";
  const rawEmail = input.email ?? input.username ?? "";
  const rawRole = input.role ?? input.userType ?? input.accountType ?? input.role_name ?? input.roleName ?? "citizen";

  return {
    full_name: String(rawFullName).trim(),
    name: String(rawFullName).trim(),
    email: String(rawEmail).trim().toLowerCase(),
    password: String(input.password ?? ""),
    role: String(rawRole).trim() || "citizen",
    userType: String(rawRole).trim() || "citizen",
    accountType: String(rawRole).trim() || "citizen",
  };
}

export async function register(input = {}) {
  const payload = normalizeRegisterInput(input);
  const res = await apiFetch(`/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      full_name: payload.full_name,
      name: payload.name,
      role: payload.role,
      userType: payload.userType,
      accountType: payload.accountType,
    }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || `Registration failed (server responded HTTP ${res.status})`);

  if (data.token) {
    await saveAuthSession(data.token, data.user || null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("seis-auth-change"));
    }
  }

  return data;
}

function normalizeLoginInput(input = {}) {
  const rawEmail = input.email ?? input.username ?? input.userName ?? "";
  return {
    email: String(rawEmail).trim().toLowerCase(),
    username: String(rawEmail).trim().toLowerCase(),
    password: String(input.password ?? ""),
  };
}

export async function login(input = {}) {
  const payload = normalizeLoginInput(input);
  const res = await apiFetch(`/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      email: payload.email,
      username: payload.username,
    }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || `Login failed (server responded HTTP ${res.status})`);

  if (data.token) {
    await saveAuthSession(data.token, data.user || null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("seis-auth-change"));
    }
  }

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

export async function logout() {
  await clearAuthSession();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("seis-auth-change"));
  }
}

export function getStoredUser() {
  return readStoredUser();
}

export function getToken() {
  return readToken();
}

export function getRole() {
  const u = readStoredUser();
  return u?.role || "";
}

export function hasRole(...allowed) {
  const role = getRole();
  return allowed.includes(role);
}

export const ROLES = {
  CAN_CREATE_ELECTION: ["election_administrator", "returning_officer", "presiding_officer"],
  CAN_CREATE_CANDIDATE: ["election_administrator", "returning_officer"],
  CAN_APPLY_CANDIDATE: ["candidate", "citizen", "observer", "presiding_officer", "returning_officer", "election_administrator"],
  CAN_CREATE_STATION: ["election_administrator", "returning_officer", "presiding_officer"],
  CAN_SUBMIT_RESULT: ["presiding_officer", "returning_officer", "election_administrator"],
  CAN_VERIFY_RESULT: ["returning_officer", "election_administrator"],
  CAN_MANAGE_USERS: ["election_administrator", "system_administrator"],
  CAN_REVIEW_CANDIDATE: ["election_administrator", "returning_officer"],
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
export async function applyCandidate(payload) {
  const res = await apiFetch(`/api/candidates/apply`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(payload) });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Application failed");
  return data;
}
export async function fetchMyCandidates(opts = {}) {
  const qs = buildQS(opts);
  const res = await apiFetch(`/api/candidates/my${qs}`, { headers: { ...authHeaders() } });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "My candidates fetch failed");
  if (opts.page || opts.limit) return data;
  return data.candidates || data.data || [];
}
export async function updateCandidateStatus(id, payload) {
  const res = await apiFetch(`/api/candidates/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(payload) });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Status update failed");
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
