function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="pagination">
      <button className="btn-icon" disabled={page === 1} onClick={() => onPageChange(page - 1)}>‹</button>
      {pages.map(p => (
        <button key={p} className={`page-num ${p === page ? 'is-active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
      ))}
      <button className="btn-icon" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>›</button>
    </div>
  );
}
export default Pagination;