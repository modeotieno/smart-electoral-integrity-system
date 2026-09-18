import React, { useEffect, useState, useCallback } from "react";
import { fetchResults, fetchCandidates, fetchStations, fetchElections, submitResult, verifyResult, getStoredUser, ROLES, hasRole } from "../../api/api";
import LiveUpdateManager from "../../api/liveUpdates";
import Pagination from "../Pagination";
import { FiLock, FiSearch } from "react-icons/fi";

export default function Results() {
  const [data, setData] = useState({ results: [], totals: [], pagination: null });
  const [candidates, setCandidates] = useState([]);
  const [stations, setStations] = useState([]);
  const [elections, setElections] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ election_id: "", candidate_id: "", polling_station_id: "", votes: "" });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const user = getStoredUser();
  const role = user?.role || "";
  const canSubmit = hasRole(...ROLES.CAN_SUBMIT_RESULT);
  const canVerify = hasRole(...ROLES.CAN_VERIFY_RESULT);

  const loadResults = useCallback(async () => {
    try {
      const res = await fetchResults({ page, limit, search: q });
      // res is either full envelope with pagination or legacy {results,totals}
      if (res.results !== undefined) {
        // normalize: backend now returns data+pagination+totals
        const results = res.results || res.data || [];
        setData({ results, totals: res.totals || [], pagination: res.pagination || null });
      } else if (Array.isArray(res.data)) {
        setData({ results: res.data, totals: res.totals || [], pagination: res.pagination || null });
      } else {
        setData({ results: [], totals: [], pagination: null });
      }
    } catch(e){ setErr(e.message); }
  }, [page, limit, q]);

  const loadMeta = () => {
    fetchCandidates().then((d)=> setCandidates(Array.isArray(d)?d:(d.candidates||d.data||[]))).catch(()=>{});
    fetchStations().then((d)=> setStations(Array.isArray(d)?d:(d.stations||d.data||[]))).catch(()=>{});
    fetchElections().then((d)=> setElections(Array.isArray(d)?d:(d.elections||d.data||[]))).catch(()=>{});
  };

  useEffect(()=>{ loadResults(); }, [loadResults]);
  useEffect(loadMeta, []);

  // Setup WebSocket for real-time result updates
  useEffect(() => {
    const wsUrl = (() => {
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = import.meta.env.VITE_API_URL 
        ? new URL(import.meta.env.VITE_API_URL).host 
        : window.location.host;
      return `${proto}//${host}/api/ws/live`;
    })();
    
    const manager = new LiveUpdateManager(wsUrl);
    
    const onConnected = () => {
      setWsConnected(true);
      // Subscribe to all active elections (in production, filter by user)
      elections.forEach(el => manager.subscribe(el.id));
    };
    
    const onDisconnected = () => {
      setWsConnected(false);
    };
    
    // Refresh results when new update comes in
    const onResultUpdate = () => {
      loadResults();
    };
    
    manager.on("connected", onConnected);
    manager.on("disconnected", onDisconnected);
    manager.on("result_update", onResultUpdate);
    manager.on("tally_update", onResultUpdate);
    
    manager.connect().catch(() => {
      console.warn("WebSocket unavailable, using HTTP polling only");
    });
    
    // Fallback: refresh every 15 seconds if WS not available
    const pollId = setInterval(() => {
      if (!wsConnected) {
        loadResults();
      }
    }, 15000);
    
    return () => {
      clearInterval(pollId);
      manager.disconnect();
    };
  }, [elections, loadResults]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setMsg("");
    if (!canSubmit) { setErr(`Insufficient permissions — submit requires: ${ROLES.CAN_SUBMIT_RESULT.join(", ")} (your role: ${role})`); return; }
    try {
      await submitResult({ election_id: Number(form.election_id), candidate_id: Number(form.candidate_id), polling_station_id: Number(form.polling_station_id), votes: Number(form.votes) });
      setMsg("Result submitted"); setForm({ election_id:"", candidate_id:"", polling_station_id:"", votes:"" }); setPage(1); loadResults();
    } catch(ex){ setErr(ex.message); }
  };
  const onVerify = async (id) => {
    setErr(""); setMsg("");
    if (!canVerify) { setErr(`Insufficient permissions — verify requires: ${ROLES.CAN_VERIFY_RESULT.join(", ")} (your role: ${role})`); return; }
    try { await verifyResult(id); setMsg("Verified #"+id); loadResults(); } catch(ex){ setErr(ex.message); }
  };
  const onSearch = (e)=>{ e.preventDefault(); setPage(1); setQ(search.trim()); };
  const pag = data.pagination;

  return (
    <div className="dash-main">
      <div className="dash-heading">
        <div>
          <b>Results</b>
          <small>
            Submit and verify — role-gated {wsConnected ? (
              <span style={{ color: "#10b981", fontWeight: 700, marginLeft: 8 }}>🔴 Live WebSocket</span>
            ) : (
              <span style={{ color: "#f59e0b", fontWeight: 700, marginLeft: 8 }}>📡 Polling</span>
            )}
          </small>
        </div>
        <span className="badge-status success">{pag ? `${pag.total} records` : `${data.results.length} records`}</span>
      </div>
      {err && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", color:"#dc2626", padding:10, borderRadius:8, marginBottom:12 }}>{err}</div>}
      {msg && <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", color:"#166534", padding:10, borderRadius:8, marginBottom:12 }}>{msg}</div>}

      <div className="dash-card" style={{ marginBottom:16 }}>
        <h3>Vote Totals (aggregated)</h3>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:10 }}>
          {data.totals.map((t)=>(<div key={t.candidate} style={{ background:"var(--slate-50)", border:"1px solid var(--slate-200)", borderRadius:10, padding:"10px 14px" }}><b>{t.candidate}</b><div style={{ color:"var(--green-600)", fontWeight:800 }}>{Number(t.total_votes).toLocaleString()} votes</div></div>))}
          {data.totals.length===0 && <span style={{ color:"#64748b" }}>No votes yet</span>}
        </div>
      </div>

      <form onSubmit={onSearch} style={{ display:"flex", gap:8, marginBottom:12 }}>
        <div style={{ position:"relative", flex:1, maxWidth:360 }}>
          <FiSearch style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search candidate / station…" style={{ width:"100%", height:40, paddingLeft:34, paddingRight:12, borderRadius:9, border:"1px solid var(--slate-200)" }} />
        </div>
        <button type="submit" className="green-btn small">Search</button>
        {q && <button type="button" onClick={()=>{ setSearch(""); setQ(""); setPage(1); }} className="outline-btn" style={{ color:"var(--navy-800)", borderColor:"var(--slate-300)", minHeight:40 }}>Clear</button>}
      </form>

      <div className="dash-card" style={{ marginBottom:16, opacity: canSubmit ? 1 : 0.9 }}>
        <h3 style={{ marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>{canSubmit ? null : <FiLock style={{ color:"#94a3b8" }} />} Submit Result {canSubmit ? <span style={{ fontSize:"0.7rem", fontWeight:700, color:"#16a66a", background:"#eafaf2", padding:"2px 8px", borderRadius:999 }}>allowed: {role}</span> : <span style={{ fontSize:"0.7rem", fontWeight:700, color:"#dc2626", background:"#fef2f2", padding:"2px 8px", borderRadius:999 }}>locked — {ROLES.CAN_SUBMIT_RESULT.join(", ")}</span>}</h3>
        {!canSubmit && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", color:"#991b1b", padding:"8px 10px", borderRadius:8, fontSize:"0.8rem", marginBottom:10, display:"flex", gap:8, alignItems:"center" }}><FiLock /> Your role <b>{role}</b> cannot submit results. Requires: {ROLES.CAN_SUBMIT_RESULT.join(", ")}.</div>}
        <form onSubmit={onSubmit} style={{ display:"grid", gap:10, opacity: canSubmit ? 1 : 0.55, pointerEvents: canSubmit ? "auto" : "none" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <select value={form.election_id} onChange={(e)=>setForm(p=>({...p,election_id:e.target.value}))} required disabled={!canSubmit} style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 10px" }}>
              <option value="">Election</option>{elections.map((el)=><option key={el.id} value={el.id}>{el.name}</option>)}
            </select>
            <select value={form.candidate_id} onChange={(e)=>setForm(p=>({...p,candidate_id:e.target.value}))} required disabled={!canSubmit} style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 10px" }}>
              <option value="">Candidate</option>{candidates.map((c)=><option key={c.id} value={c.id}>{c.full_name} — {c.position}</option>)}
            </select>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <select value={form.polling_station_id} onChange={(e)=>setForm(p=>({...p,polling_station_id:e.target.value}))} required disabled={!canSubmit} style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 10px" }}>
              <option value="">Polling Station</option>{stations.map((s)=><option key={s.id} value={s.id}>{s.name} — {s.location}</option>)}
            </select>
            <input placeholder="Votes" type="number" min={0} value={form.votes} onChange={(e)=>setForm(p=>({...p,votes:e.target.value}))} required disabled={!canSubmit} style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 12px" }} />
          </div>
          <button type="submit" className="green-btn" style={{ width:"fit-content", opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit}>Submit Result</button>
          <small style={{ color:"var(--slate-500)", display:"flex", alignItems:"center", gap:6 }}>{!canSubmit && <FiLock style={{ width:12, height:12 }} />} Your role: <b>{role||"unknown"}</b> — submit: {ROLES.CAN_SUBMIT_RESULT.join(", ")} • verify: {ROLES.CAN_VERIFY_RESULT.join(", ")}</small>
        </form>
      </div>
      <div className="dash-card"><div className="table-responsive"><table className="dash-table"><thead><tr><th>#</th><th>Election</th><th>Candidate</th><th>Station</th><th>Votes</th><th>Verified</th><th>Action</th></tr></thead><tbody>
        {data.results.map((r)=>(<tr key={r.id}><td>{r.id}</td><td>{r.election}</td><td style={{ fontWeight:700 }}>{r.candidate}</td><td>{r.station}</td><td>{r.votes}</td><td>{r.verified ? <span className="badge-status success">verified</span> : <span className="badge-status warning">pending</span>}</td><td>{!r.verified ? (canVerify ? <button onClick={()=>onVerify(r.id)} className="green-btn small" style={{ minHeight:30 }}>Verify</button> : <span title={`Requires: ${ROLES.CAN_VERIFY_RESULT.join(", ")}`} style={{ display:"inline-flex", alignItems:"center", gap:4, color:"#94a3b8", fontSize:"0.75rem", border:"1px solid var(--slate-200)", padding:"4px 8px", borderRadius:999 }}><FiLock style={{ width:12, height:12 }} />Locked</span>) : "—"}</td></tr>))}
        {data.results.length===0 && <tr><td colSpan={7} style={{ textAlign:"center", color:"#64748b", padding:20 }}>No results yet — submit one above</td></tr>}
      </tbody></table></div>
      {pag && <Pagination page={pag.page} limit={pag.limit} total={pag.total} totalPages={pag.total_pages} onPageChange={setPage} onLimitChange={(n)=>{ setLimit(n); setPage(1); }} />}
      {!pag && <Pagination page={page} limit={limit} total={data.results.length} totalPages={1} onPageChange={setPage} onLimitChange={(n)=>{ setLimit(n); setPage(1); }} />}
      </div>
    </div>
  );
}
