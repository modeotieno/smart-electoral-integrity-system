import React, { useEffect, useState, useCallback } from "react";
import { fetchUsers, getToken } from "../../api/api";
import { FiUsers, FiShield, FiSearch, FiRefreshCw } from "react-icons/fi";
import { Link } from "react-router-dom";
import Pagination from "../Pagination";

export default function Voters() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try {
      const data = await fetchUsers({ page, limit, search: q });
      // support both paginated envelope and legacy array
      if (Array.isArray(data)) {
        setUsers(data); setTotal(data.length); setTotalPages(1);
      } else {
        setUsers(data.users || data.data || []);
        const p = data.pagination || {};
        setTotal(p.total ?? (data.users || data.data || []).length);
        setTotalPages(p.total_pages || 1);
      }
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [page, limit, q]);

  useEffect(() => { load(); }, [load]);

  const onSearch = (e) => { e.preventDefault(); setPage(1); setQ(search.trim()); };
  const hasToken = !!getToken();

  return (
    <div className="dash-main">
      <div className="dash-heading"><div><b>Voters & Users</b><small>All registered users — live from backend</small></div><span className="badge-status success">{total} total</span></div>

      {!hasToken && <div style={{ background:"#fffbeb", border:"1px solid #fde68a", color:"#92400e", padding:12, borderRadius:8, marginBottom:12 }}>You are not logged in. <Link to="/login" style={{ fontWeight:700, color:"#065f46" }}>Login</Link> or <Link to="/register" style={{ fontWeight:700 }}>Create account</Link> to view voters. The table requires a valid JWT.</div>}

      <form onSubmit={onSearch} style={{ display:"flex", gap:8, marginBottom:12 }}>
        <div style={{ position:"relative", flex:1, maxWidth:360 }}>
          <FiSearch style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search name or email…" style={{ width:"100%", height:40, paddingLeft:34, paddingRight:12, borderRadius:9, border:"1px solid var(--slate-200)" }} />
        </div>
        <button type="submit" className="green-btn small">Search</button>
        {q && <button type="button" onClick={()=>{ setSearch(""); setQ(""); setPage(1); }} className="outline-btn" style={{ color:"var(--navy-800)", borderColor:"var(--slate-300)", minHeight:40 }}>Clear</button>}
        <button type="button" onClick={()=>load()} className="outline-btn" style={{ minHeight:40, display:"inline-flex", gap:6, alignItems:"center" }} title="Refresh"><FiRefreshCw /> Refresh</button>
      </form>

      {err && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", color:"#dc2626", padding:10, borderRadius:8, marginBottom:12 }}>{err} — {hasToken ? "token may be expired, try re-login" : "login required"}.</div>}
      {loading ? <p>Loading voters…</p> : (
        <div className="dash-card"><div className="table-responsive"><table className="dash-table"><thead><tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Biometric</th><th>Joined</th></tr></thead><tbody>
          {users.map((u) => (
            <tr key={u.id}><td>{u.id}</td><td style={{ fontWeight: 700 }}>{u.full_name}</td><td>{u.email}</td><td><span className="badge-status success">{u.role}</span></td><td>{u.biometric_enrolled ? <FiShield style={{ color: "#16a66a" }} /> : "—"}</td><td>{new Date(u.created_at).toLocaleDateString()}</td></tr>
          ))}
          {users.length===0 && <tr><td colSpan={6} style={{ textAlign:"center", color:"#64748b", padding:20 }}>{err ? "No data — authenticate first" : "No voters yet — try different search or register accounts via Get Started"}</td></tr>}
        </tbody></table></div>
        <Pagination page={page} limit={limit} total={total} totalPages={totalPages} onPageChange={setPage} onLimitChange={(n)=>{ setLimit(n); setPage(1); }} />
        </div>
      )}
    </div>
  );
}
