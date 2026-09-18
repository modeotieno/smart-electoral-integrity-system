import React, { useEffect, useState } from "react";
import { FiActivity, FiAlertCircle, FiCheck, FiClock, FiWifi } from "react-icons/fi";
import { getApiUrl, getToken } from "../../api/api";

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const apiUrl = getApiUrl() === "(relative)" ? "" : getApiUrl();
        const res = await fetch(`${apiUrl}/api/metrics`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error("Failed to fetch metrics");
        const data = await res.json();
        setMetrics(data.metrics);
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    // Refresh metrics every 5 seconds
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="dash-main">Loading metrics...</div>;

  return (
    <div className="dash-main">
      <div className="dash-heading">
        <div>
          <b>System Performance</b>
          <small>Real-time metrics during election operations</small>
        </div>
        <span className="badge-status success">Live Monitoring</span>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: 12, borderRadius: 8, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
          <FiAlertCircle /> {error}
        </div>
      )}

      {metrics && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
          {/* Uptime */}
          <div className="dash-card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <FiClock style={{ color: "#3b82f6" }} />
              <b>System Uptime</b>
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#10b981", fontFamily: "monospace" }}>
              {metrics.uptime}
            </div>
            <small style={{ color: "#64748b" }}>Time since restart</small>
          </div>

          {/* Requests */}
          <div className="dash-card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <FiActivity style={{ color: "#06b6d4" }} />
              <b>Total Requests</b>
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#06b6d4", fontFamily: "monospace" }}>
              {Number(metrics.total_requests).toLocaleString()}
            </div>
            <small style={{ color: "#64748b" }}>
              {metrics.total_errors} errors ({metrics.error_rate_percent.toFixed(2)}%)
            </small>
          </div>

          {/* Response Time */}
          <div className="dash-card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <FiClock style={{ color: "#8b5cf6" }} />
              <b>Response Time</b>
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#8b5cf6", fontFamily: "monospace" }}>
              {metrics.avg_response_time_ms.toFixed(2)}ms avg
            </div>
            <small style={{ color: "#64748b" }}>
              max: {metrics.max_response_time_ms.toFixed(2)}ms
            </small>
          </div>

          {/* Database Queries */}
          <div className="dash-card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <FiActivity style={{ color: "#f59e0b" }} />
              <b>Query Performance</b>
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f59e0b", fontFamily: "monospace" }}>
              {metrics.avg_query_time_ms.toFixed(2)}ms avg
            </div>
            <small style={{ color: "#64748b" }}>
              {metrics.recent_queries} recent queries
            </small>
          </div>

          {/* WebSocket Connections */}
          <div className="dash-card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <FiWifi style={{ color: "#10b981" }} />
              <b>Live Connections</b>
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#10b981", fontFamily: "monospace" }}>
              {metrics.active_websockets}
            </div>
            <small style={{ color: "#64748b" }}>
              {Number(metrics.websocket_messages_sent).toLocaleString()} messages sent
            </small>
          </div>

          {/* Health Status */}
          <div className="dash-card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <FiCheck style={{ color: metrics.error_rate_percent < 5 ? "#10b981" : "#dc2626" }} />
              <b>System Health</b>
            </div>
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: 800,
                color: metrics.error_rate_percent < 5 ? "#10b981" : metrics.error_rate_percent < 10 ? "#f59e0b" : "#dc2626",
              }}
            >
              {metrics.error_rate_percent < 5 ? "✅ Excellent" : metrics.error_rate_percent < 10 ? "⚠️ Good" : "🔴 Degraded"}
            </div>
            <small style={{ color: "#64748b" }}>
              Error rate: {metrics.error_rate_percent.toFixed(2)}%
            </small>
          </div>
        </div>
      )}

      <div className="dash-card" style={{ marginTop: 24 }}>
        <h3>Performance Recommendations</h3>
        <ul style={{ marginLeft: 20, color: "#64748b", lineHeight: 1.8 }}>
          <li>
            <b>Average Response Time:</b> {metrics?.avg_response_time_ms < 100 ? "✅ Excellent" : metrics?.avg_response_time_ms < 300 ? "⚠️ Acceptable" : "🔴 Slow"}
          </li>
          <li>
            <b>Query Performance:</b> {metrics?.avg_query_time_ms < 50 ? "✅ Well-indexed" : "⚠️ Consider adding indexes"}
          </li>
          <li>
            <b>WebSocket Load:</b> {metrics?.active_websockets < 100 ? "✅ Light load" : metrics?.active_websockets < 500 ? "⚠️ Moderate load" : "🔴 High load"}
          </li>
          <li>
            <b>Error Rate:</b> {metrics?.error_rate_percent < 1 ? "✅ Minimal errors" : "⚠️ Monitor error logs"}
          </li>
        </ul>
      </div>
    </div>
  );
}
