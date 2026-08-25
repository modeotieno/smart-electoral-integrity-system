import React, { useEffect, useState, useCallback } from "react";
import { fetchElections, createElection, getStoredUser, ROLES, hasRole } from "../../api/api";
import Pagination from "../Pagination";
import { FiLock, FiSearch } from "react-icons/fi";

export default function Elections() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ name:"", description:"", start_date:"", end_date:"", status:"planned" });

  const user = getStoredUser();
  const role = user?.role || "";
  const canCreate = hasRole(...ROLES.CAN_CREATE_ELECTION);

  const load = useCallback(async ()=>{
    setErr("");
    try {
      const data = await fetchElections({ page, limit, search: q });
      if (Array.isArray(data)) { setList(data); setTotal(data.length); setTotalPages(1); }
      else { setList(data.elections||data.data||[]); const p=data.pagination||{}; setTotal(p.total??0); setTotalPages(p.total_pages||1); }
    } catch(e){ setErr(e.message); }
  }, [page, limit, q]);

  useEffect(()=>{ load(); }, [load]);

  const onSubmit = async (e)=>{
    e.preventDefault(); setErr(""); setMsg("");
    if (!canCreate) { setErr(`Insufficient permissions — requires: ${ROLES.CAN_CREATE_ELECTION.join(", ")} (your role: ${role})`); return; }
    try {
      await createElection({ name: form.name, description: form.description, start_date: form.start_date, end_date: form.end_date, status: form.status });
      setMsg("Election created"); setForm({ name:"", description:"", start_date:"", end_date:"", status:"planned" }); setPage(1); load();
    } catch(ex){ setErr(ex.message); }
  };

  return (
    <div className="dash-main">
      <div className="dash-heading"><div><b>Elections</b><small>All elections — paginated</small></div><span className="badge-status success">{total} total</span></div>
      {err && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", color:"#dc2626", padding:10, borderRadius:8, marginBottom:12 }}>{err}</div>}
      {msg && <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", color:"#166534", padding:10, borderRadius:8, marginBottom:12 }}>{msg}</div>}

      <form onSubmit={(e)=>{ e.preventDefault(); setPage(1); setQ(search.trim()); }} style={{ display:"flex", gap:8, marginBottom:12 }}>
        <div style={{ position:"relative", flex:1, maxWidth:360 }}>
          <FiSearch style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search elections…" style={{ width:"100%", height:40, paddingLeft:34, paddingRight:12, borderRadius:9, border:"1px solid var(--slate-200)" }} />
        </div>
        <button type="submit" className="green-btn small">Search</button>
        {q && <button type="button" onClick={()=>{ setSearch(""); setQ(""); setPage(1); }} className="outline-btn" style={{ color:"var(--navy-800)", borderColor:"var(--slate-300)", minHeight:40 }}>Clear</button>}
      </form>

      <div className="dash-card" style={{ marginBottom:16, opacity: canCreate ? 1 : 0.9 }}>
        <h3 style={{ marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>{canCreate ? null : <FiLock style={{ color:"#94a3b8" }} />} Create Election {canCreate ? <span style={{ fontSize:"0.7rem", fontWeight:700, color:"#16a66a", background:"#eafaf2", padding:"2px 8px", borderRadius:999 }}>allowed: {role}</span> : <span style={{ fontSize:"0.7rem", fontWeight:700, color:"#dc2626", background:"#fef2f2", padding:"2px 8px", borderRadius:999 }}>locked — {ROLES.CAN_CREATE_ELECTION.join(", ")}</span>}</h3>
        {!canCreate && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", color:"#991b1b", padding:"8px 10px", borderRadius:8, fontSize:"0.8rem", marginBottom:10, display:"flex", gap:8, alignItems:"center" }}><FiLock /> Insufficient permissions. Your role <b>{role}</b> cannot create elections. Requires: {ROLES.CAN_CREATE_ELECTION.join(", ")}.</div>}
        <form onSubmit={onSubmit} style={{ display:"grid", gap:10, opacity: canCreate ? 1 : 0.55, pointerEvents: canCreate ? "auto" : "none" }}>
          <input placeholder="Name" value={form.name} onChange={(e)=>setForm(p=>({...p,name:e.target.value}))} required disabled={!canCreate} style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 12px" }} />
          <textarea placeholder="Description" value={form.description} onChange={(e)=>setForm(p=>({...p,description:e.target.value}))} rows={2} disabled={!canCreate} style={{ border:"1px solid var(--slate-200)", borderRadius:9, padding:10 }} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            <input type="date" value={form.start_date} onChange={(e)=>setForm(p=>({...p,start_date:e.target.value}))} required disabled={!canCreate} style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 12px" }} />
            <input type="date" value={form.end_date} onChange={(e)=>setForm(p=>({...p,end_date:e.target.value}))} required disabled={!canCreate} style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 12px" }} />
            <select value={form.status} onChange={(e)=>setForm(p=>({...p,status:e.target.value}))} disabled={!canCreate} style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 10px" }}>
              <option value="planned">planned</option><option value="active">active</option><option value="closed">closed</option>
            </select>
          </div>
          <button type="submit" className="green-btn" style={{ width:"fit-content", opacity: canCreate ? 1 : 0.5 }} disabled={!canCreate}>Create Election</button>
        </form>
      </div>

      <div className="dash-card"><div className="table-responsive"><table className="dash-table"><thead><tr><th>#</th><th>Name</th><th>Status</th><th>Period</th></tr></thead><tbody>
        {list.map((el)=>(<tr key={el.id}><td>{el.id}</td><td style={{ fontWeight:700 }}>{el.name}</td><td><span className={`badge-status ${el.status==="active"?"success":"warning"}`}>{el.status}</span></td><td style={{ fontSize:"0.8rem" }}>{new Date(el.start_date).toLocaleDateString()} → {new Date(el.end_date).toLocaleDateString()}</td></tr>))}
        {list.length===0 && <tr><td colSpan={4} style={{ textAlign:"center", color:"#64748b", padding:20 }}>No elections</td></tr>}
      </tbody></table></div>
      <Pagination page={page} limit={limit} total={total} totalPages={totalPages} onPageChange={setPage} onLimitChange={(n)=>{ setLimit(n); setPage(1); }} />
      </div>
    </div>
  );
}
