/**
 * Pagination — Page navigation with prev/next and numbered pages.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const items = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(pages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      items.push(i);
    }
    return items;
  };

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft size={16} />
      </button>
      {getPageNumbers().map((num) => (
        <button
          key={num}
          className={`pagination-btn ${num === page ? 'active' : ''}`}
          onClick={() => onPageChange(num)}
        >
          {num}
        </button>
      ))}
      <button
        className="pagination-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
