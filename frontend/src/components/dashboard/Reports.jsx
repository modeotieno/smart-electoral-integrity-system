import React, { useEffect, useState, useCallback } from "react";
import { fetchAuditLogs, fetchIncidents, reportIncident, fetchStations, fetchStats } from "../../api/api";
import { FiAlertTriangle, FiShield, FiFileText, FiSearch } from "react-icons/fi";
import Pagination from "../Pagination";

export default function Reports() {
  const [logs, setLogs] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [stations, setStations] = useState([]);
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ title: "", description: "", polling_station_id: "", severity: "medium" });
  const [logPage, setLogPage] = useState(1);
  const [logLimit, setLogLimit] = useState(10);
  const [logTotal, setLogTotal] = useState(0);
  const [logPages, setLogPages] = useState(1);
  const [logSearch, setLogSearch] = useState("");
  const [logQ, setLogQ] = useState("");
  const [incPage, setIncPage] = useState(1);
  const [incLimit, setIncLimit] = useState(5);
  const [incTotal, setIncTotal] = useState(0);
  const [incPages, setIncPages] = useState(1);
  const [incSearch, setIncSearch] = useState("");
  const [incQ, setIncQ] = useState("");

  const loadLogs = useCallback(async () => {
    try {
      const data = await fetchAuditLogs({ page: logPage, limit: logLimit, search: logQ });
      if (Array.isArray(data)) { setLogs(data); setLogTotal(data.length); setLogPages(1); }
      else { setLogs(data.logs || data.data || []); const p=data.pagination||{}; setLogTotal(p.total??0); setLogPages(p.total_pages||1); }
    } catch (e) { setErr(e.message); }
  }, [logPage, logLimit, logQ]);

  const loadIncidents = useCallback(async () => {
    try {
      const data = await fetchIncidents({ page: incPage, limit: incLimit, search: incQ });
      if (Array.isArray(data)) { setIncidents(data); setIncTotal(data.length); setIncPages(1); }
      else { setIncidents(data.incidents || data.data || []); const p=data.pagination||{}; setIncTotal(p.total??0); setIncPages(p.total_pages||1); }
    } catch {}
  }, [incPage, incLimit, incQ]);

  const loadStations = () => fetchStations().then((d)=> setStations(Array.isArray(d)?d:(d.stations||d.data||[]))).catch(()=>{});

  useEffect(()=>{ loadLogs(); }, [loadLogs]);
  useEffect(()=>{ loadIncidents(); }, [loadIncidents]);
  useEffect(()=>{ loadStations(); fetchStats().then(setStats).catch(()=>{}); }, []);

  const onReport = async (e) => {
    e.preventDefault();
    setErr(""); setMsg("");
    try {
      await reportIncident({ title: form.title, description: form.description, polling_station_id: form.polling_station_id ? Number(form.polling_station_id) : null, severity: form.severity });
      setMsg("Incident reported"); setForm({ title:"", description:"", polling_station_id:"", severity:"medium" }); setIncPage(1); loadIncidents(); loadLogs();
    } catch(ex){ setErr(ex.message); }
  };

  return (
    <div className="dash-main">
      <div className="dash-heading"><div><b>Reports & Audit</b><small>Traceability and incident monitoring</small></div><span className="badge-status success">Live</span></div>
      {err && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", color:"#dc2626", padding:10, borderRadius:8, marginBottom:12 }}>{err} — login required for audit view.</div>}
      {msg && <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", color:"#166534", padding:10, borderRadius:8, marginBottom:12 }}>{msg}</div>}
      {stats && <div className="dash-cards" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", marginBottom:16 }}>
        <div><small>Registered Voters</small><b>{stats.registered_voters}</b></div>
        <div><small>Elections</small><b>{stats.elections}</b></div>
        <div><small>Stations</small><b>{stats.polling_stations}</b></div>
        <div><small>Biometric Enrolled</small><b>{stats.biometric_enrolled}</b></div>
      </div>}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div className="dash-card">
          <div className="dash-card-header"><h3><FiFileText style={{ verticalAlign:"middle" }} /> Audit Logs</h3><span className="view-all">{logTotal} entries</span></div>
          <form onSubmit={(e)=>{ e.preventDefault(); setLogPage(1); setLogQ(logSearch.trim()); }} style={{ display:"flex", gap:6, marginBottom:10 }}>
            <div style={{ position:"relative", flex:1 }}>
              <FiSearch style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", width:14, height:14 }} />
              <input value={logSearch} onChange={(e)=>setLogSearch(e.target.value)} placeholder="Search action…" style={{ width:"100%", height:36, paddingLeft:28, paddingRight:8, borderRadius:8, border:"1px solid var(--slate-200)", fontSize:"0.85rem" }} />
            </div>
            <button type="submit" className="green-btn small" style={{ minHeight:36 }}>Go</button>
            {logQ && <button type="button" onClick={()=>{ setLogSearch(""); setLogQ(""); setLogPage(1); }} style={{ height:36, padding:"0 10px", borderRadius:8, border:"1px solid var(--slate-200)", background:"white", fontSize:"0.8rem" }}>Clear</button>}
          </form>
          <div style={{ maxHeight:380, overflowY:"auto", display:"grid", gap:8 }}>
            {logs.map((l, idx)=>(<div key={idx} style={{ display:"flex", gap:10, padding:"8px 10px", background:"var(--slate-50)", border:"1px solid var(--slate-100)", borderRadius:8 }}>
              <span style={{ width:32, height:32, borderRadius:999, background:"#eafaf2", display:"flex", alignItems:"center", justifyContent:"center", color:"#16a66a" }}><FiShield /></span>
              <div style={{ flex:1 }}><b style={{ fontSize:"0.85rem" }}>{l.action}</b><div style={{ fontSize:"0.75rem", color:"#64748b" }}>{l.description}</div><small style={{ color:"#94a3b8" }}>{new Date(l.created_at).toLocaleString()}</small></div>
            </div>))}
            {logs.length===0 && <p style={{ color:"#64748b", textAlign:"center", padding:20 }}>No audit logs yet — perform actions to generate logs.</p>}
          </div>
          <Pagination page={logPage} limit={logLimit} total={logTotal} totalPages={logPages} onPageChange={setLogPage} onLimitChange={(n)=>{ setLogLimit(n); setLogPage(1); }} />
          <div style={{ background:"#0b132b", color:"#cbd5e1", padding:10, borderRadius:10, fontFamily:"monospace", fontSize:"0.75rem", marginTop:12 }}>
            [audit] user_register • hashed bcrypt <br />[audit] biometric_enroll • sha256 <br />[audit] result_submit • upsert + verify
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className="dash-card">
            <h3 style={{ display:"flex", gap:8, alignItems:"center" }}><FiAlertTriangle /> Report Incident</h3>
            <form onSubmit={onReport} style={{ display:"grid", gap:10, marginTop:10 }}>
              <input placeholder="Title" value={form.title} onChange={(e)=>setForm(p=>({...p,title:e.target.value}))} required style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 12px" }} />
              <textarea placeholder="Description" value={form.description} onChange={(e)=>setForm(p=>({...p,description:e.target.value}))} rows={2} style={{ border:"1px solid var(--slate-200)", borderRadius:9, padding:10 }} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <select value={form.polling_station_id} onChange={(e)=>setForm(p=>({...p,polling_station_id:e.target.value}))} style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 10px" }}>
                  <option value="">No station</option>{stations.map((s)=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select value={form.severity} onChange={(e)=>setForm(p=>({...p,severity:e.target.value}))} style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 10px" }}>
                  <option value="low">low</option><option value="medium">medium</option><option value="high">high</option><option value="critical">critical</option>
                </select>
              </div>
              <button type="submit" className="green-btn" style={{ width:"fit-content" }}>Report</button>
            </form>
          </div>
          <div className="dash-card">
            <div className="dash-card-header"><h3>Incidents</h3><span className="view-all">{incTotal} total</span></div>
            <form onSubmit={(e)=>{ e.preventDefault(); setIncPage(1); setIncQ(incSearch.trim()); }} style={{ display:"flex", gap:6, marginBottom:10 }}>
              <div style={{ position:"relative", flex:1 }}>
                <FiSearch style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", width:14, height:14 }} />
                <input value={incSearch} onChange={(e)=>setIncSearch(e.target.value)} placeholder="Search incidents…" style={{ width:"100%", height:36, paddingLeft:28, paddingRight:8, borderRadius:8, border:"1px solid var(--slate-200)", fontSize:"0.85rem" }} />
              </div>
              <button type="submit" className="green-btn small" style={{ minHeight:36 }}>Go</button>
              {incQ && <button type="button" onClick={()=>{ setIncSearch(""); setIncQ(""); setIncPage(1); }} style={{ height:36, padding:"0 10px", borderRadius:8, border:"1px solid var(--slate-200)", background:"white", fontSize:"0.8rem" }}>Clear</button>}
            </form>
            <div style={{ display:"grid", gap:8, maxHeight:240, overflowY:"auto" }}>
              {incidents.map((inc)=>(<div key={inc.id} style={{ padding:"8px 10px", border:"1px solid var(--slate-200)", borderRadius:8, background:"white" }}>
                <b style={{ fontSize:"0.85rem" }}>{inc.title}</b> <span className={`badge-status ${inc.severity==="critical"||inc.severity==="high"?"warning":"success"}`} style={{ marginLeft:6 }}>{inc.severity}</span>
                <div style={{ fontSize:"0.8rem", color:"#64748b" }}>{inc.description||"—"}</div><small style={{ color:"#94a3b8" }}>{inc.status} • {new Date(inc.created_at).toLocaleString()}</small>
              </div>))}
              {incidents.length===0 && <p style={{ color:"#64748b", padding:10 }}>No incidents reported</p>}
            </div>
            <Pagination page={incPage} limit={incLimit} total={incTotal} totalPages={incPages} onPageChange={setIncPage} onLimitChange={(n)=>{ setIncLimit(n); setIncPage(1); }} />
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){div[style*="grid-template-columns:1fr 1fr"]{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}
