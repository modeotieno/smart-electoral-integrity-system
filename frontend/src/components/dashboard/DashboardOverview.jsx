import React, { useEffect, useMemo, useState } from "react";
import { FiAward, FiBarChart2, FiCheck, FiMapPin, FiShield, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import { fetchResults, fetchStats, getStoredUser } from "../../api/api";
import LiveUpdateManager from "../../api/liveUpdates";

const toNumeric = (value, fallback = 0) => {
  const n = Number(value ?? fallback);
  return Number.isFinite(n) ? n : fallback;
};

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [liveConnected, setLiveConnected] = useState(false);
  const [stream, setStream] = useState({ totals: [], results: [] });

  const loadLiveData = () => {
    fetchStats().then(setStats).catch(() => setStats({ registered_voters: 0, candidates: 18, polling_stations: 1250 }));
    fetchResults({ page: 1, limit: 10 }).then((payload) => {
      const results = Array.isArray(payload?.results) ? payload.results : Array.isArray(payload?.data) ? payload.data : [];
      const totals = Array.isArray(payload?.totals) && payload.totals.length ? payload.totals : [];
      setStream({ results, totals });
    }).catch(() => setStream({ results: [], totals: [] }));
  };

  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem("seis_user") || "null")); } catch {}

    loadLiveData();
    const pollId = setInterval(loadLiveData, 10000);

    const wsUrl = (() => {
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = import.meta.env.VITE_API_URL
        ? new URL(import.meta.env.VITE_API_URL).host
        : window.location.host;
      return `${proto}//${host}/api/ws/live`;
    })();

    const manager = new LiveUpdateManager(wsUrl);

    const onConnected = () => {
      setLiveConnected(true);
      manager.subscribe(1);
    };

    const onDisconnected = () => {
      setLiveConnected(false);
    };

    const onResultUpdate = () => {
      loadLiveData();
    };

    manager.on("connected", onConnected);
    manager.on("disconnected", onDisconnected);
    manager.on("result_update", onResultUpdate);
    manager.on("tally_update", onResultUpdate);

    manager.connect().catch(() => {
      console.warn("WebSocket unavailable, using HTTP polling");
    });

    const onAuth = () => loadLiveData();
    window.addEventListener("seis-auth-change", onAuth);

    return () => {
      clearInterval(pollId);
      window.removeEventListener("seis-auth-change", onAuth);
      if (manager) {
        manager.disconnect();
      }
    };
  }, []);

  const totals = useMemo(() => {
    if (stream.totals.length) return [...stream.totals].sort((a, b) => toNumeric(b.total_votes ?? b.votes ?? 0) - toNumeric(a.total_votes ?? a.votes ?? 0));
    const byCandidate = new Map();
    stream.results.forEach((row) => {
      const name = row.candidate || row.full_name || "Candidate";
      byCandidate.set(name, (byCandidate.get(name) || 0) + toNumeric(row.votes ?? 0));
    });
    return [...byCandidate.entries()].map(([candidate, total_votes]) => ({ candidate, total_votes }));
  }, [stream]);

  const liveLeader = totals[0];
  const totalVotesCast = stream.results.reduce((sum, row) => sum + toNumeric(row.votes ?? 0), 0);
  const maxVotes = totals.length ? Math.max(...totals.map((item) => toNumeric(item.total_votes ?? item.votes ?? 0))) : 1;

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
          <small style={{ display: "block", color: "var(--slate-500)" }}>
            {user?.role ? `Role: ${user.role}` : "General overview of the election"} • 
            {liveConnected ? (
              <span style={{ color: "#10b981", fontWeight: 700 }}>🔴 Live stream active</span>
            ) : (
              <span style={{ color: "#f59e0b", fontWeight: 700 }}>📡 Polling live updates</span>
            )}
          </small>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/live-stream" className="green-btn small"><FiBarChart2 /> Live Stream</Link>
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
          <div className="dash-card-header"><h3>Live Election Progress</h3><span className="view-all">{liveConnected ? "Live • active" : "Standby"}</span></div>
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
              <div>
                <div style={{ color: "var(--slate-500)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Votes counted</div>
                <b style={{ fontSize: "1.8rem", color: "var(--navy-900)" }}>{totalVotesCast.toLocaleString()}</b>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "var(--slate-500)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Leading</div>
                <b style={{ color: "var(--green-600)" }}>{liveLeader ? liveLeader.candidate : "Waiting for votes"}</b>
              </div>
            </div>

            {totals.length === 0 ? (
              <div style={{ padding: 16, borderRadius: 10, background: "#f8fafc", color: "#64748b" }}>No live totals yet. Results will appear as ballots are submitted.</div>
            ) : (
              totals.slice(0, 4).map((item) => {
                const voteValue = toNumeric(item.total_votes ?? item.votes ?? 0);
                const percent = Math.max(10, (voteValue / maxVotes) * 100);
                return (
                  <div key={`${item.candidate}-progress`}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontWeight: 700 }}>{item.candidate}</span>
                      <span style={{ color: "var(--slate-500)" }}>{voteValue.toLocaleString()} votes</span>
                    </div>
                    <div style={{ height: 10, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                      <div style={{ width: `${percent}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #10b981 0%, #22c55e 100%)" }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

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
      </div>
    </div>
  );
}
