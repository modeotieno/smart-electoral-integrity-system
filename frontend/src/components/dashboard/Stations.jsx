import React, { useEffect, useState, useCallback } from "react";
import { fetchStations, createStation, getStoredUser, ROLES, hasRole } from "../../api/api";
import Pagination from "../Pagination";
import { FiLock, FiSearch } from "react-icons/fi";

export default function Stations() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ name: "", location: "", county: "", registered_voters: "" });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  const user = getStoredUser();
  const role = user?.role || "";
  const canCreate = hasRole(...ROLES.CAN_CREATE_STATION);

  const load = useCallback(async () => {
    setErr("");
    try {
      const data = await fetchStations({ page, limit, search: q });
      if (Array.isArray(data)) { setList(data); setTotal(data.length); setTotalPages(1); }
      else { setList(data.stations || data.data || []); const p=data.pagination||{}; setTotal(p.total??0); setTotalPages(p.total_pages||1); }
    } catch(e){ setErr(e.message); }
  }, [page, limit, q]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setMsg("");
    if (!canCreate) { setErr(`Insufficient permissions — requires: ${ROLES.CAN_CREATE_STATION.join(", ")} (your role: ${role})`); return; }
    try {
      await createStation({ name: form.name, location: form.location, county: form.county, registered_voters: Number(form.registered_voters)||0 });
      setMsg("Station created"); setForm({ name:"", location:"", county:"", registered_voters:"" }); setPage(1); setQ(""); setSearch(""); load();
    } catch(ex){ setErr(ex.message); }
  };

  const onSearch = (e)=>{ e.preventDefault(); setPage(1); setQ(search.trim()); };

  return (
    <div className="dash-main">
      <div className="dash-heading"><div><b>Polling Stations</b><small>Stations are the source of results</small></div><span className="badge-status success">{total} stations</span></div>
      {err && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", color:"#dc2626", padding:10, borderRadius:8, marginBottom:12 }}>{err}</div>}
      {msg && <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", color:"#166534", padding:10, borderRadius:8, marginBottom:12 }}>{msg}</div>}

      <form onSubmit={onSearch} style={{ display:"flex", gap:8, marginBottom:12 }}>
        <div style={{ position:"relative", flex:1, maxWidth:360 }}>
          <FiSearch style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search station / county…" style={{ width:"100%", height:40, paddingLeft:34, paddingRight:12, borderRadius:9, border:"1px solid var(--slate-200)" }} />
        </div>
        <button type="submit" className="green-btn small">Search</button>
        {q && <button type="button" onClick={()=>{ setSearch(""); setQ(""); setPage(1); }} className="outline-btn" style={{ color:"var(--navy-800)", borderColor:"var(--slate-300)", minHeight:40 }}>Clear</button>}
      </form>

      <div className="dash-card" style={{ marginBottom:16, opacity: canCreate ? 1 : 0.9 }}>
        <h3 style={{ marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>{canCreate ? null : <FiLock style={{ color:"#94a3b8" }} />} Add Station {canCreate ? <span style={{ fontSize:"0.7rem", fontWeight:700, color:"#16a66a", background:"#eafaf2", padding:"2px 8px", borderRadius:999 }}>allowed: {role}</span> : <span style={{ fontSize:"0.7rem", fontWeight:700, color:"#dc2626", background:"#fef2f2", padding:"2px 8px", borderRadius:999 }}>locked — {ROLES.CAN_CREATE_STATION.join(", ")}</span>}</h3>
        {!canCreate && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", color:"#991b1b", padding:"8px 10px", borderRadius:8, fontSize:"0.8rem", marginBottom:10, display:"flex", gap:8, alignItems:"center" }}><FiLock /> Your role <b>{role}</b> cannot add stations. Requires: {ROLES.CAN_CREATE_STATION.join(", ")}.</div>}
        <form onSubmit={onSubmit} style={{ display:"grid", gap:10, opacity: canCreate ? 1 : 0.55, pointerEvents: canCreate ? "auto" : "none" }}>
          <input placeholder="Station name" value={form.name} onChange={(e)=>setForm(p=>({...p,name:e.target.value}))} required disabled={!canCreate} style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 12px" }} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <input placeholder="Location/address" value={form.location} onChange={(e)=>setForm(p=>({...p,location:e.target.value}))} required disabled={!canCreate} style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 12px" }} />
            <input placeholder="County" value={form.county} onChange={(e)=>setForm(p=>({...p,county:e.target.value}))} disabled={!canCreate} style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 12px" }} />
          </div>
          <input placeholder="Registered voters" type="number" min={0} value={form.registered_voters} onChange={(e)=>setForm(p=>({...p,registered_voters:e.target.value}))} disabled={!canCreate} style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 12px" }} />
          <button type="submit" className="green-btn" style={{ width:"fit-content", opacity: canCreate ? 1 : 0.5 }} disabled={!canCreate}>Add Station</button>
        </form>
      </div>
      <div className="dash-card"><div className="table-responsive"><table className="dash-table"><thead><tr><th>#</th><th>Station</th><th>Location</th><th>County</th><th>Voters</th></tr></thead><tbody>
        {list.map((s)=>(<tr key={s.id}><td>{s.id}</td><td style={{ fontWeight:700 }}>{s.name}</td><td>{s.location}</td><td>{s.county||"—"}</td><td>{Number(s.registered_voters).toLocaleString()}</td></tr>))}
        {list.length===0 && <tr><td colSpan={5} style={{ textAlign:"center", color:"#64748b", padding:20 }}>No stations yet</td></tr>}
      </tbody></table></div>
      <Pagination page={page} limit={limit} total={total} totalPages={totalPages} onPageChange={setPage} onLimitChange={(n)=>{ setLimit(n); setPage(1); }} />
      </div>
    </div>
  );
}
