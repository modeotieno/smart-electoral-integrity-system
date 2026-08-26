import React, { useEffect, useState } from "react";
import { FiAward, FiBarChart2, FiCheck, FiMapPin, FiShield, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import { fetchStats } from "../../api/api";

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem("seis_user") || "null")); } catch {}
    const load = () => fetchStats().then(setStats).catch(() => setStats({ registered_voters: 0, candidates: 18, polling_stations: 1250 }));
    load();
    const id = setInterval(load, 5000);
    const onAuth = () => load();
    window.addEventListener("seis-auth-change", onAuth);
    return () => { clearInterval(id); window.removeEventListener("seis-auth-change", onAuth); };
  }, []);
  const cards = [
    { label: "Registered Voters", value: stats ? `${Number(stats.registered_voters).toLocaleString()}+` : "2.5M+", icon: FiUsers, color: "#e0f2fe" },
    { label: "Candidates", value: stats?.candidates ?? 18, icon: FiAward, color: "#f3e8ff" },
    { label: "Polling Stations", value: stats ? Number(stats.polling_stations).toLocaleString() : "1,250", icon: FiMapPin, color: "#ffedd5" },
    { label: "Biometric Enrolled", value: stats?.biometric_enrolled ?? "—", icon: FiShield, color: "#eafaf2" },
  ];
  return (
    <div className="dash-main" style={{ background: "var(--slate-50)", minHeight: "100vh" }}>
      <div className="dash-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <b style={{ fontSize: "1.4rem" }}>Welcome, {user?.full_name || "Election Official"} 👋</b>
          <small style={{ display: "block", color: "var(--slate-500)" }}>{user?.role ? `Role: ${user.role}` : "General overview of the election"} • Live data from backend</small>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/biometric" className="green-btn small"><FiShield /> Biometric</Link>
          <Link to="/dashboard/reports" className="outline-btn" style={{ color: "var(--navy-900)", borderColor: "var(--slate-300)", minHeight: 40 }}><FiBarChart2 /> Reports</Link>
        </div>
      </div>

      <div className="dash-cards" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: "white", padding: 16, borderRadius: 14, border: "1px solid var(--slate-200)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--navy-800)" }}><Icon /></span>
            <div><small style={{ color: "var(--slate-500)" }}>{label}</small><b style={{ display: "block", fontSize: "1.3rem", color: "var(--navy-900)" }}>{value}</b></div>
          </div>
        ))}
      </div>



      <div className="dash-content-grid" style={{ marginTop: 18 }}>
        <div className="dash-card">
          <div className="dash-card-header"><h3>Integrity Timeline</h3><span className="view-all">{stats ? `Live • ${new Date().toLocaleTimeString()}` : "Live"}</span></div>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ width: 36, height: 36, borderRadius: 999, background: "#eafaf2", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green-600)" }}><FiCheck /></span>
              <div><b>Biometric verification active</b><p className="text-muted" style={{ margin: 0 }}>Fingerprint / Face / Iris hashed with SHA-256</p></div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ width: 36, height: 36, borderRadius: 999, background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7" }}><FiBarChart2 /></span>
              <div><b>Results pipeline</b><p className="text-muted" style={{ margin: 0 }}>Aggregating from {stats?.polling_stations ?? 3} stations</p></div>
            </div>
          </div>
        </div>
        <div className="dash-card">
          <div className="dash-card-header"><h3>Audit Preview</h3><Link to="/dashboard/reports" className="view-all">View all →</Link></div>
          <p className="text-muted">Recent actions are cryptographically logged.</p>
          <div style={{ background: "#0b132b", color: "#cbd5e1", padding: 12, borderRadius: 10, fontFamily: "monospace", fontSize: "0.8rem", marginTop: 10 }}>
            [audit] user_register • SEIS demo <br /> [audit] biometric_enroll • fingerprint <br /> [audit] user_login • token issued
          </div>
          <Link to="/biometric" style={{ display: "inline-flex", marginTop: 12, color: "var(--green-600)", fontWeight: 700 }}>Enroll biometric →</Link>
        </div>
      </div>
    </div>
  );
}
