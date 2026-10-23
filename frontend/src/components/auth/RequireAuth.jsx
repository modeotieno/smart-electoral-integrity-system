import { Link } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import { getToken, getStoredUser } from "../../api/api";

export function RequireAuth({ children }) {
  if (!getToken()) {
    return (
      <div className="login-page" style={{ justifyContent: "center" }}>
        <div className="login-card" style={{ maxWidth: 480, textAlign: "center" }}>
          <h3>Authentication required</h3>
          <p className="text-muted" style={{ marginTop: 8 }}>Please create an account or log in to access the dashboard.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 18 }}>
            <Link to="/register" className="green-btn">Create Account</Link>
            <Link to="/login" className="login-btn" style={{ color: "var(--green-600)", borderColor: "var(--green-600)" }}>Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export function RequireRole({ roles, children }) {
  if (!getToken()) return <RequireAuth>{children}</RequireAuth>;

  const user = getStoredUser();
  const role = user?.role || "";

  if (roles && roles.length && !roles.includes(role)) {
    return (
      <div className="dash-main" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
        <div className="dash-card" style={{ maxWidth: 520, textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 999, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#dc2626" }}><FiLock /></div>
          <h3>Access restricted</h3>
          <p className="text-muted" style={{ marginTop: 8 }}>Your role <b>{role || "unknown"}</b> cannot access this section.<br />Requires: <code>{roles.join(", ")}</code></p>
          <Link to="/dashboard" className="green-btn small" style={{ marginTop: 14 }}>Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return children;
}
