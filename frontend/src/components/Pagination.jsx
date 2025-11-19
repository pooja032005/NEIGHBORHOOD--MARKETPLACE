// src/components/Pagination.jsx
import React from "react";

export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="pagination">
      <button disabled={page===1} onClick={()=>onPage(page-1)}>Prev</button>
      {start > 1 && <button onClick={()=>onPage(1)}>1</button>}
      {start > 2 && <span>…</span>}
      {pages.map(p => (
        <button key={p} className={p===page ? "active" : ""} onClick={()=>onPage(p)}>{p}</button>
      ))}
      {end < totalPages-1 && <span>…</span>}
      {end < totalPages && <button onClick={()=>onPage(totalPages)}>{totalPages}</button>}
      <button disabled={page===totalPages} onClick={()=>onPage(page+1)}>Next</button>
    </div>
  );
}
