import React from "react";

export default function Pagination({ page, limit, total, totalPages, onPageChange, onLimitChange }) {
  if (!totalPages || totalPages < 1) return null;
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--slate-200)" }}>
      <div style={{ fontSize: "0.85rem", color: "var(--slate-500)" }}>
        Page <b style={{ color: "var(--navy-900)" }}>{page}</b> of <b>{totalPages}</b> • {total} total
        {onLimitChange && (
          <span style={{ marginLeft: 12 }}>
            per page{" "}
            <select value={String(limit)} onChange={(e) => onLimitChange(Number(e.target.value))} style={{ height: 32, borderRadius: 8, border: "1px solid var(--slate-200)", padding: "0 6px", marginLeft: 4 }}>
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button disabled={page <= 1} onClick={() => onPageChange(1)} style={btnStyle(page <= 1)} title="First">«</button>
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} style={btnStyle(page <= 1)}>Prev</button>
        {start > 1 && <span style={{ padding: "0 4px", color: "var(--slate-400)" }}>…</span>}
        {pages.map((p) => (
          <button key={p} onClick={() => onPageChange(p)} style={p === page ? activeBtnStyle : btnStyle(false)}>{p}</button>
        ))}
        {end < totalPages && <span style={{ padding: "0 4px", color: "var(--slate-400)" }}>…</span>}
        <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} style={btnStyle(page >= totalPages)}>Next</button>
        <button disabled={page >= totalPages} onClick={() => onPageChange(totalPages)} style={btnStyle(page >= totalPages)} title="Last">»</button>
      </div>
    </div>
  );
}

const btnStyle = (disabled) => ({
  minWidth: 36,
  height: 34,
  padding: "0 10px",
  borderRadius: 8,
  border: "1px solid var(--slate-200)",
  background: disabled ? "var(--slate-100)" : "white",
  color: disabled ? "var(--slate-400)" : "var(--navy-800)",
  fontWeight: 700,
  fontSize: "0.8rem",
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.6 : 1,
});

const activeBtnStyle = {
  minWidth: 36,
  height: 34,
  padding: "0 10px",
  borderRadius: 8,
  border: "2px solid var(--green-500)",
  background: "#eafaf2",
  color: "var(--green-600)",
  fontWeight: 800,
  fontSize: "0.8rem",
  cursor: "pointer",
};
