import React, { useCallback, useEffect, useMemo, useState } from "react";
import { fetchElections, fetchResults } from "../../api/api";
import LiveUpdateManager from "../../api/liveUpdates";

const normalizeRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.results)) return payload.results;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
};

const aggregateTotals = (rows = []) => {
  const map = new Map();

  rows.forEach((row) => {
    const candidate = row.candidate || row.full_name || row.name || "Unknown Candidate";
    const votes = Number(row.votes ?? row.total_votes ?? 0);
    const party = row.party || row.candidate_party || "";

    if (!map.has(candidate)) {
      map.set(candidate, {
        candidate,
        party,
        total_votes: 0,
      });
    }

    map.get(candidate).total_votes += votes;
  });

  return [...map.values()].sort((a, b) => Number(b.total_votes) - Number(a.total_votes));
};

export default function LiveStreamPage() {
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [totals, setTotals] = useState([]);
  const [results, setResults] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [message, setMessage] = useState("Waiting for voting to begin");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadData = useCallback(async () => {
    try {
      const [electionData, resultData] = await Promise.all([
        fetchElections(),
        fetchResults({ page: 1, limit: 200 })
      ]);

      const electionList = Array.isArray(electionData)
        ? electionData
        : electionData?.elections || electionData?.data || [];

      setElections(electionList);

      if (electionList.length) {
        const current = electionList.find((el) => String(el.id) === String(selectedElectionId)) ||
          electionList.find((el) => el.status === "active" || el.status === "ongoing" || el.status === "open") ||
          electionList[0];

        if (current) {
          setSelectedElectionId((prev) => prev || String(current.id));
        }
      }

      const rows = normalizeRows(resultData);
      const liveTotals = Array.isArray(resultData?.totals) && resultData.totals.length
        ? resultData.totals
        : aggregateTotals(rows);

      setResults(rows);
      setTotals(liveTotals);
      setLastUpdated(new Date());
      setMessage(
        liveTotals.length
          ? "Live election counts are updating in real time"
          : "Votes are coming in — results will appear here soon"
      );
    } catch (error) {
      console.error("Failed to load live election stream:", error);
      setMessage("Live stream is temporarily unavailable");
    }
  }, [selectedElectionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!elections.length) return undefined;

    const wsUrl = (() => {
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = import.meta.env.VITE_API_URL
        ? new URL(import.meta.env.VITE_API_URL).host
        : window.location.host;
      return `${proto}//${host}/api/ws/live`;
    })();

    const manager = new LiveUpdateManager(wsUrl);

    const onConnected = () => {
      setIsLive(true);
      setMessage("Live stream connected");
      elections.forEach((election) => manager.subscribe(Number(election.id)));
    };

    const onDisconnected = () => {
      setIsLive(false);
      setMessage("Connection paused — polling for the latest results");
    };

    const onResultUpdate = () => {
      setLastUpdated(new Date());
      loadData();
    };

    manager.on("connected", onConnected);
    manager.on("disconnected", onDisconnected);
    manager.on("result_update", onResultUpdate);
    manager.on("tally_update", onResultUpdate);

    manager.connect().catch(() => {
      setIsLive(false);
      setMessage("WebSocket unavailable — using polling updates");
    });

    return () => {
      manager.disconnect();
    };
  }, [elections, loadData]);

  const sortedTotals = useMemo(
    () => [...totals].sort((a, b) => Number(b.total_votes ?? b.votes ?? 0) - Number(a.total_votes ?? a.votes ?? 0)),
    [totals]
  );

  const leader = sortedTotals[0];
  const totalVotesCast = results.reduce((sum, item) => sum + Number(item.votes ?? 0), 0);
  const activeElection = elections.find((election) => String(election.id) === String(selectedElectionId)) || elections[0];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px 72px" }}>
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 0.9fr",
          gap: 24,
          background: "linear-gradient(135deg, rgba(14,116,144,0.14), rgba(16,185,129,0.08))",
          border: "1px solid rgba(148,163,184,0.25)",
          borderRadius: 24,
          padding: 28,
        }}
      >
        <div>
          <span className="badge" style={{ background: "rgba(16,185,129,0.12)", color: "#065f46" }}>
            LIVE ELECTION STREAM
          </span>
          <h1 style={{ fontSize: "clamp(2.1rem, 4vw, 3.1rem)", margin: "16px 0 12px", lineHeight: 1.1 }}>
            {activeElection ? `${activeElection.name} Live Results` : "Student Representative Election Live Results"}
          </h1>
          <p style={{ maxWidth: 620, color: "#475569", fontSize: "1.02rem", lineHeight: 1.7 }}>
            A public, real-time election stream for students and the wider community to follow the vote count,
            monitor live tallies, and stay informed as body representatives are confirmed.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: isLive ? "#dcfce7" : "#fef3c7",
                color: isLive ? "#166534" : "#92400e",
                borderRadius: 999,
                padding: "8px 14px",
                fontWeight: 700,
              }}
            >
              {isLive ? "● Live" : "● Syncing"}
            </span>
            <span
              style={{
                border: "1px solid rgba(148,163,184,0.35)",
                borderRadius: 999,
                padding: "8px 14px",
                background: "rgba(255,255,255,0.63)",
                color: "#334155",
                fontWeight: 600,
              }}
            >
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>
        </div>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.92)",
            borderRadius: 20,
            padding: 20,
            color: "#e2e8f0",
            boxShadow: "0 20px 50px rgba(15,23,42,0.18)",
          }}
        >
          <div style={{ fontSize: 12, letterSpacing: 1.3, textTransform: "uppercase", opacity: 0.7 }}>Live status</div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>{message}</div>
          <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ opacity: 0.8 }}>Votes counted</span>
              <strong>{totalVotesCast.toLocaleString()}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ opacity: 0.8 }}>Leading candidate</span>
              <strong>{leader ? leader.candidate : "Awaiting results"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ opacity: 0.8 }}>Participation</span>
              <strong>{elections.length ? `${elections.length} election stream(s)` : "Monitoring"}</strong>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 26, background: "#fff", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 20, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, color: "#0f172a" }}>Live leaderboard</h3>
            <p style={{ margin: "6px 0 0", color: "#64748b" }}>
              Real-time count for the body representative election.
            </p>
          </div>

          <select
            value={selectedElectionId}
            onChange={(event) => setSelectedElectionId(event.target.value)}
            style={{
              minWidth: 220,
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              padding: "10px 12px",
              background: "#fff",
              color: "#0f172a",
              fontWeight: 600,
            }}
          >
            {elections.length === 0 ? (
              <option value="">Loading elections...</option>
            ) : (
              elections.map((election) => (
                <option key={election.id} value={election.id}>
                  {election.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          {sortedTotals.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", padding: 26, textAlign: "center", borderRadius: 16, background: "#f8fafc", color: "#64748b" }}>
              No vote totals yet. The stream will update when ballots are submitted.
            </div>
          ) : (
            sortedTotals.map((candidate, index) => (
              <div
                key={`${candidate.candidate}-${index}`}
                style={{
                  position: "relative",
                  border: index === 0 ? "1px solid rgba(16,185,129,0.35)" : "1px solid rgba(148,163,184,0.22)",
                  borderRadius: 18,
                  padding: 20,
                  background: index === 0 ? "linear-gradient(135deg, rgba(16,185,129,0.09), #fff)" : "#f8fafc",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, letterSpacing: 1.1, textTransform: "uppercase", color: "#64748b" }}>
                    Rank #{index + 1}
                  </span>
                  {index === 0 && (
                    <span style={{ background: "#dcfce7", color: "#166534", borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>
                      Leading
                    </span>
                  )}
                </div>

                <h4 style={{ margin: "14px 0 8px", fontSize: 21, color: "#0f172a" }}>{candidate.candidate}</h4>
                <div style={{ color: "#64748b", fontSize: 13 }}>{candidate.party || "Student representative candidate"}</div>

                <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: 30, color: "#0f172a" }}>{Number(candidate.total_votes ?? candidate.votes ?? 0).toLocaleString()}</strong>
                  <span style={{ color: "#64748b", fontWeight: 600 }}>votes</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section style={{ marginTop: 26, background: "#fff", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 20, padding: 22 }}>
        <h3 style={{ marginTop: 0, color: "#0f172a" }}>Recent result feed</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", color: "#334155" }}>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Candidate</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Station</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Votes</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "#64748b", padding: 18 }}>
                    No live results yet.
                  </td>
                </tr>
              ) : (
                results.slice(0, 8).map((item, index) => (
                  <tr key={`${item.candidate || "result"}-${index}`} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "12px 10px", fontWeight: 600 }}>{item.candidate || item.full_name || "Candidate"}</td>
                    <td style={{ padding: "12px 10px" }}>{item.station || "Polling station"}</td>
                    <td style={{ padding: "12px 10px" }}>{Number(item.votes ?? 0).toLocaleString()}</td>
                    <td style={{ padding: "12px 10px" }}>
                      <span
                        style={{
                          background: "#e0f2fe",
                          color: "#075985",
                          borderRadius: 999,
                          padding: "5px 10px",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {item.verified ? "Verified" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
