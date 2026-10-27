import React, { useEffect, useState, useCallback } from "react";
import { fetchCandidates, fetchElections, fetchMyCandidates, applyCandidate, updateCandidateStatus, getStoredUser, hasRole, ROLES } from "../../api/api";
import Pagination from "../Pagination";
import { FiCheck, FiClock, FiX, FiSearch, FiAward } from "react-icons/fi";

const toArray = (value) => Array.isArray(value) ? value : [];
const normalizePageData = (payload, fallback = []) => {
  if (Array.isArray(payload)) return { items: payload, total: payload.length, totalPages: 1 };
  if (!payload || typeof payload !== "object") return { items: fallback, total: 0, totalPages: 1 };
  const items = toArray(payload.candidates ?? payload.data ?? payload.results ?? fallback);
  const pageMeta = payload.pagination || {};
  return {
    items,
    total: Number(pageMeta.total ?? items.length ?? 0),
    totalPages: Number(pageMeta.total_pages || 1),
  };
};

export default function CandidatePortal() {
  const user = getStoredUser();
  const role = user?.role || "";
  const isReviewer = hasRole(...ROLES.CAN_REVIEW_CANDIDATE);
  const [elections, setElections] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ election_id: "", full_name: user?.full_name || "", party: "", position: "President", manifesto: "" });
  const [pageMy, setPageMy] = useState(1);
  const [limitMy] = useState(10);
  const [totalMy, setTotalMy] = useState(0);
  const [totalPagesMy, setTotalPagesMy] = useState(1);
  const [pageAll, setPageAll] = useState(1);
  const [limitAll, setLimitAll] = useState(10);
  const [totalAll, setTotalAll] = useState(0);
  const [totalPagesAll, setTotalPagesAll] = useState(1);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => { setForm((p) => ({ ...p, full_name: user?.full_name || p.full_name })); }, [user?.full_name]);

  const loadElections = useCallback(() => {
    fetchElections().then((d) => setElections(Array.isArray(d) ? d : toArray(d?.elections ?? d?.data))).catch(() => setElections([]));
  }, []);
  const loadMy = useCallback(async () => {
    try {
      const data = await fetchMyCandidates({ page: pageMy, limit: limitMy });
      const normalized = normalizePageData(data, []);
      setMyApps(normalized.items);
      setTotalMy(normalized.total);
      setTotalPagesMy(Math.max(1, normalized.totalPages || 1));
    } catch (e) {
      setMyApps([]);
      setErr(e?.message || "Unable to load candidate applications.");
    }
  }, [pageMy, limitMy]);
  const loadAll = useCallback(async () => {
    try {
      const data = await fetchCandidates({ page: pageAll, limit: limitAll, search: q });
      const normalized = normalizePageData(data, []);
      setAllCandidates(normalized.items);
      setTotalAll(normalized.total);
      setTotalPagesAll(Math.max(1, normalized.totalPages || 1));
      setErr("");
    } catch (e) {
      setAllCandidates([]);
      setErr(e?.message || "Unable to load candidates.");
    }
  }, [pageAll, limitAll, q]);

  useEffect(() => { loadElections(); }, [loadElections]);
  useEffect(() => { loadMy(); }, [loadMy]);
  useEffect(() => { loadAll(); }, [loadAll]);

  const onApply = async (e) => {
    e.preventDefault();
    setErr(""); setMsg("");
    try {
      await applyCandidate({ election_id: Number(form.election_id), full_name: form.full_name, party: form.party, position: form.position, manifesto: form.manifesto });
      setMsg("Application submitted — pending approval");
      setForm((p) => ({ ...p, party: "", manifesto: "", election_id: "" }));
      loadMy(); loadAll();
    } catch (ex) { setErr(ex.message); }
  };

  const onReview = async (id, status) => {
    setErr(""); setMsg("");
    try {
      await updateCandidateStatus(id, { status });
      setMsg(`Candidate ${status}`);
      loadAll(); loadMy();
    } catch (ex) { setErr(ex.message); }
  };

  const badge = (s) => {
    if (s === "approved") return <span className="badge-status success" style={{ display:"inline-flex", gap:4, alignItems:"center" }}><FiCheck /> approved</span>;
    if (s === "rejected") return <span className="badge-status" style={{ display:"inline-flex", gap:4, alignItems:"center", background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca" }}><FiX /> rejected</span>;
    return <span className="badge-status warning" style={{ display:"inline-flex", gap:4, alignItems:"center" }}><FiClock /> pending</span>;
  };

  const totalVotesMe = myApps.reduce((a, c) => a + (Number(c.votes) || 0), 0);
  const approvedCount = myApps.filter((c) => c.status === "approved").length;

  return (
    <div className="dash-main">
      <div className="dash-heading"><div><b>Candidate Portal</b><small>Register as candidate & track your progress</small></div><span className="badge-status success">{totalMy} my applications</span></div>
      {err && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", color:"#dc2626", padding:10, borderRadius:8, marginBottom:12 }}>{err}</div>}
      {msg && <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", color:"#166534", padding:10, borderRadius:8, marginBottom:12 }}>{msg}</div>}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:10, marginBottom:16 }}>
        <div className="dash-card" style={{ textAlign:"center" }}><small style={{ color:"#64748b" }}>Applications</small><div style={{ fontSize:"1.4rem", fontWeight:800 }}>{totalMy}</div><small style={{ color:"#16a34a" }}>{approvedCount} approved</small></div>
        <div className="dash-card" style={{ textAlign:"center" }}><small style={{ color:"#64748b" }}>Total Votes</small><div style={{ fontSize:"1.4rem", fontWeight:800, color:"var(--green-600)" }}>{totalVotesMe.toLocaleString()}</div><small>across all elections</small></div>
        <div className="dash-card" style={{ textAlign:"center" }}><small style={{ color:"#64748b" }}>Role</small><div style={{ fontSize:"0.95rem", fontWeight:700 }}>{role}</div><small>{isReviewer ? "can review applications" : "applicant view"}</small></div>
      </div>

      <div className="dash-card" style={{ marginBottom:16 }}>
        <h3 style={{ marginBottom:10, display:"flex", alignItems:"center", gap:8 }}><FiAward /> Apply as Candidate</h3>
        <form onSubmit={onApply} style={{ display:"grid", gap:10 }}>
          <select value={form.election_id} onChange={(e) => setForm((p) => ({ ...p, election_id: e.target.value }))} required style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 10px" }}>
            <option value="">Select election</option>{elections.map((el) => <option key={el.id} value={el.id}>{el.name} — {el.status}</option>)}
          </select>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <input placeholder="Full name" value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} required style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 12px" }} />
            <input placeholder="Party" value={form.party} onChange={(e) => setForm((p) => ({ ...p, party: e.target.value }))} style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 12px" }} />
          </div>
          <input placeholder="Position (e.g. President, Governor)" value={form.position} onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))} required style={{ height:42, border:"1px solid var(--slate-200)", borderRadius:9, padding:"0 12px" }} />
          <textarea placeholder="Manifesto (optional)" value={form.manifesto} onChange={(e) => setForm((p) => ({ ...p, manifesto: e.target.value }))} rows={2} style={{ border:"1px solid var(--slate-200)", borderRadius:9, padding:10 }} />
          <button type="submit" className="green-btn" style={{ width:"fit-content" }}>Submit Application</button>
          <small style={{ color:"#64748b" }}>All applications start as <b>pending</b> and require approval by {ROLES.CAN_REVIEW_CANDIDATE.join(", ")}.</small>
        </form>
      </div>

      <div className="dash-card" style={{ marginBottom:16 }}>
        <h3 style={{ marginBottom:10 }}>My Applications & Progress</h3>
        <div className="table-responsive"><table className="dash-table"><thead><tr><th>#</th><th>Election</th><th>Position</th><th>Party</th><th>Status</th><th>Votes</th><th>Applied</th></tr></thead><tbody>
          {myApps.map((c) => (<tr key={c.id}><td>{c.id}</td><td style={{ fontWeight:700 }}>{c.election || c.election_id}</td><td>{c.position}</td><td>{c.party || "—"}</td><td>{badge(c.status || "pending")}{c.rejection_reason ? <div style={{ fontSize:"0.7rem", color:"#dc2626" }}>{c.rejection_reason}</div> : null}</td><td style={{ fontWeight:700, color:"var(--green-600)" }}>{Number(c.votes||0).toLocaleString()}</td><td style={{ fontSize:"0.8rem", color:"#64748b" }}>{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td></tr>))}
          {myApps.length===0 && <tr><td colSpan={7} style={{ textAlign:"center", color:"#64748b", padding:20 }}>No applications yet — apply above</td></tr>}
        </tbody></table></div>
        <Pagination page={pageMy} limit={limitMy} total={totalMy} totalPages={totalPagesMy} onPageChange={setPageMy} onLimitChange={() => {}} />
      </div>

      <form onSubmit={(e)=>{ e.preventDefault(); setPageAll(1); setQ(search.trim()); }} style={{ display:"flex", gap:8, marginBottom:12 }}>
        <div style={{ position:"relative", flex:1, maxWidth:360 }}>
          <FiSearch style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search candidates…" style={{ width:"100%", height:40, paddingLeft:34, paddingRight:12, borderRadius:9, border:"1px solid var(--slate-200)" }} />
        </div>
        <button type="submit" className="green-btn small">Search</button>
        {q && <button type="button" onClick={()=>{ setSearch(""); setQ(""); setPageAll(1); }} className="outline-btn" style={{ color:"var(--navy-800)", borderColor:"var(--slate-300)", minHeight:40 }}>Clear</button>}
      </form>

      <div className="dash-card">
        <h3 style={{ marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>All Candidates {isReviewer && <span style={{ fontSize:"0.7rem", background:"#eafaf2", color:"#16a66a", padding:"2px 8px", borderRadius:999 }}>reviewer: {role}</span>}</h3>
        <div className="table-responsive"><table className="dash-table"><thead><tr><th>#</th><th>Name</th><th>Party</th><th>Position</th><th>Election</th><th>Status</th><th>Votes</th>{isReviewer && <th>Review</th>}</tr></thead><tbody>
          {allCandidates.map((c)=>(<tr key={c.id}><td>{c.id}</td><td style={{ fontWeight:700 }}>{c.full_name}</td><td>{c.party || "—"}</td><td>{c.position}</td><td>{c.election}</td><td>{badge(c.status || "approved")}</td><td style={{ fontWeight:700 }}>{Number(c.votes||0).toLocaleString()}</td>{isReviewer && <td><div style={{ display:"flex", gap:6 }}>{c.status!="approved" && <button onClick={()=>onReview(c.id,"approved")} className="green-btn small" style={{ minHeight:28, padding:"0 10px" }}>Approve</button>}{c.status!="rejected" && <button onClick={()=>onReview(c.id,"rejected")} className="outline-btn" style={{ minHeight:28, padding:"0 10px", color:"#dc2626", borderColor:"#fecaca" }}>Reject</button>}</div></td>}</tr>))}
          {allCandidates.length===0 && <tr><td colSpan={isReviewer ? 8 : 7} style={{ textAlign:"center", color:"#64748b", padding:20 }}>No candidates yet</td></tr>}
        </tbody></table></div>
        <Pagination page={pageAll} limit={limitAll} total={totalAll} totalPages={totalPagesAll} onPageChange={setPageAll} onLimitChange={(n)=>{ setLimitAll(n); setPageAll(1); }} />
      </div>
    </div>
  );
}
