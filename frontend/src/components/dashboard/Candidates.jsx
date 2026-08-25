import React, { useEffect, useState, useCallback } from "react";
import { fetchCandidates, fetchElections, createCandidate, getStoredUser, ROLES, hasRole } from "../../api/api";
import { FiLock, FiSearch } from "react-icons/fi";
import Pagination from "../Pagination";

export default function Candidates() {
  const [list, setList] = useState([]);
  const [elections, setElections] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ election_id: "", full_name: "", party: "", position: "President", manifesto: "" });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setErr("");
    try {
      const data = await fetchCandidates({ page, limit, search: q });
      if (Array.isArray(data)) { setList(data); setTotal(data.length); setTotalPages(1); }
      else { setList(data.candidates || data.data || []); const p = data.pagination||{}; setTotal(p.total ?? 0); setTotalPages(p.total_pages||1); }
    } catch (e) { setErr(e.message); }
  }, [page, limit, q]);

  const user = getStoredUser();
  const role = user?.role || "";
  const canCreate = hasRole(...ROLES.CAN_CREATE_CANDIDATE);

  const loadElections = () => fetchElections().then((d)=> setElections(Array.isArray(d)?d:(d.elections||d.data||[]))).catch(()=>{});

  useEffect(() => { load(); }, [load]);
  useEffect(loadElections, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setMsg("");
    if (!canCreate) { setErr(`Insufficient permissions — requires: ${ROLES.CAN_CREATE_CANDIDATE.join(", ")} (your role: ${role})`); return; }
    try {
      await createCandidate({ election_id: Number(form.election_id), full_name: form.full_name, party: form.party, position: form.position, manifesto: form.manifesto });
      setMsg("Candidate created"); setForm({ election_id: "", full_name: "", party: "", position: "President", manifesto: "" }); setPage(1); setQ(""); setSearch(""); load();
    } catch (ex) { setErr(ex.message); }
  };

  const onSearch = (e)=>{ e.preventDefault(); setPage(1); setQ(search.trim()); };

  return (
    <div className="dash-main">
      <div className="dash-heading"><div><b>Candidates</b><small>Manage candidates per election</small></div><span className="badge-status success">{total} total</span></div>
      {err && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", color:"#dc2626", padding:10, borderRadius:8, marginBottom:12 }}>{err}</div>}
      {msg && <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", color:"#166534", padding:10, borderRadius:8, marginBottom:12 }}>{msg}</div>}

      <form onSubmit={onSearch} style={{ display:"flex", gap:8, marginBottom:12 }}>
        <div style={{ position:"relative", flex:1, maxWidth:360 }}>
          <FiSearch style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search name or party…" style={{ width:"100%", height:40, paddingLeft:34, paddingRight:12, borderRadius:9, border:"1px solid var(--slate-200)" }} />
        </div>
        <button type="submit" className="green-btn small">Search</button>
        {q && <button type="button" onClick={()=>{ setSearch(""); setQ(""); setPage(1); }} className="outline-btn" style={{ color:"var(--navy-800)", borderColor:"var(--slate-300)", minHeight:40 }}>Clear</button>}
      </form>

      <div className="dash-card" style={{ marginBottom:16, opacity: canCreate ? 1 : 0.9 }}>
        <h3 style={{ marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>{canCreate ? null : <FiLock style={{ color:"#94a3b8" }} />} Add Candidate {canCreate ? <span style={{ fontSize:"0.7rem", fontWeight:700, color:"#16a66a", background:"#eafaf2", padding:"2px 8px", borderRadius:999 }}>allowed: {role}</span> : <span style={{ fontSize:"0.7rem", fontWeight:700, color:"#dc2626", background:"#fef2f2", padding:"2px 8px", borderRadius:999 }}>locked — {ROLES.CAN_CREATE_CANDIDATE.join(", ")}</span>}</h3>
        {!canCreate && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", color:"#991b1b", padding:"8px 10px", borderRadius:8, fontSize:"0.8rem", marginBottom:10, display:"flex", gap:8, alignItems:"center" }}><FiLock /> Your role <b>{role}</b> cannot add candidates. Requires: {ROLES.CAN_CREATE_CANDIDATE.join(", ")}.</div>}
        <form onSubmit={onSubmit} style={{ display:"grid", gap:10, opacity: canCreate ? 1 : 0.55, pointerEvents: canCreate ? "auto" : "none" }}>
          <select value={form.election_id} onChange={(e)=>setForm(p=>({...p,election_id:e.target.value}))} required disabled={!canCreate} style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 10px" }}>
            <option value="">Select election</option>{elections.map((el)=><option key={el.id} value={el.id}>{el.name}</option>)}
          </select>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <input placeholder="Full name" value={form.full_name} onChange={(e)=>setForm(p=>({...p,full_name:e.target.value}))} required disabled={!canCreate} style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 12px" }} />
            <input placeholder="Party" value={form.party} onChange={(e)=>setForm(p=>({...p,party:e.target.value}))} disabled={!canCreate} style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 12px" }} />
          </div>
          <input placeholder="Position" value={form.position} onChange={(e)=>setForm(p=>({...p,position:e.target.value}))} required disabled={!canCreate} style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 12px" }} />
          <textarea placeholder="Manifesto (optional)" value={form.manifesto} onChange={(e)=>setForm(p=>({...p,manifesto:e.target.value}))} rows={2} disabled={!canCreate} style={{ border:"1px solid var(--slate-200)", borderRadius:9, padding:10 }} />
          <button type="submit" className="green-btn" style={{ width:"fit-content", opacity: canCreate ? 1 : 0.5 }} disabled={!canCreate}>Add Candidate</button>
        </form>
      </div>
      <div className="dash-card"><div className="table-responsive"><table className="dash-table"><thead><tr><th>#</th><th>Name</th><th>Party</th><th>Position</th><th>Election</th></tr></thead><tbody>
        {list.map((c)=>(<tr key={c.id}><td>{c.id}</td><td style={{ fontWeight:700 }}>{c.full_name}</td><td>{c.party || "—"}</td><td>{c.position}</td><td>{c.election}</td></tr>))}
        {list.length===0 && <tr><td colSpan={5} style={{ textAlign:"center", color:"#64748b", padding:20 }}>No candidates yet</td></tr>}
      </tbody></table></div>
      <Pagination page={page} limit={limit} total={total} totalPages={totalPages} onPageChange={setPage} onLimitChange={(n)=>{ setLimit(n); setPage(1); }} />
      </div>
    </div>
  );
}
