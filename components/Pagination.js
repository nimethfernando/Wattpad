'use client';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages,
  onPageChange,
  totalItems = 0,
  itemsPerPage,
  pageSize,
  onItemsPerPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 6, 9, 10, 12, 20, 24],
  syncToUrl = false,
  urlParam = 'page',
  hideOnSinglePage = false,
  className = ''
}) {
  const effectivePageSize = pageSize || itemsPerPage || 9;
  const computedTotalPages = totalPages || (totalItems > 0 ? Math.ceil(totalItems / effectivePageSize) : 1);
  const handlePageSizeChange = onPageSizeChange || onItemsPerPageChange;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, computedTotalPages));

  const handlePageSelect = (page) => {
    if (page < 1 || page > computedTotalPages || page === safeCurrentPage) return;
    if (onPageChange) onPageChange(page);

    if (syncToUrl && typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set(urlParam, page.toString());
        window.history.pushState({}, '', url.toString());
      } catch (e) {
        // Fallback gracefully
      }
    }
  };

  // If there are zero items, hide pagination
  if (totalItems === 0 && (!totalPages || totalPages <= 0)) {
    return null;
  }

  // If there is only 1 page AND no page size selector is available, hide only if explicitly requested or untracked
  if (computedTotalPages <= 1 && !handlePageSizeChange && (hideOnSinglePage || !totalItems)) {
    return null;
  }

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (computedTotalPages <= maxVisible) {
      for (let i = 1; i <= computedTotalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', computedTotalPages);
      } else if (safeCurrentPage >= computedTotalPages - 2) {
        pages.push(1, '...', computedTotalPages - 3, computedTotalPages - 2, computedTotalPages - 1, computedTotalPages);
      } else {
        pages.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', computedTotalPages);
      }
    }
    return pages;
  };

  const startItem = totalItems > 0 ? (safeCurrentPage - 1) * effectivePageSize + 1 : 0;
  const endItem = totalItems > 0 ? Math.min(safeCurrentPage * effectivePageSize, totalItems) : 0;
  const uniqueOptions = Array.from(new Set([...(pageSizeOptions || []), effectivePageSize])).sort((a, b) => a - b);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 text-xs text-slate-500 dark:text-slate-400 ${className}`}>
      {/* Items count summary & Per Page Selector */}
      <div className="flex flex-wrap items-center gap-3">
        {totalItems > 0 && (
          <span>
            Showing <strong className="text-slate-900 dark:text-white font-bold">{startItem}</strong> to <strong className="text-slate-900 dark:text-white font-bold">{endItem}</strong> of <strong className="text-slate-900 dark:text-white font-bold">{totalItems}</strong> entries
          </span>
        )}

        {handlePageSizeChange && (
          <div className="flex items-center gap-1.5 ml-1">
            <span>Per page:</span>
            <select
              value={effectivePageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                handlePageSizeChange(newSize);
                if (onPageChange) onPageChange(1);
              }}
              className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              {uniqueOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page controls */}
      {computedTotalPages > 1 ? (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageSelect(1)}
            disabled={safeCurrentPage === 1}
            aria-label="First page"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => handlePageSelect(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            aria-label="Previous page"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 mx-1">
            {getPageNumbers().map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 select-none">
                    ...
                  </span>
                );
              }
              const isCurrent = p === safeCurrentPage;
              return (
                <button
                  key={p}
                  onClick={() => handlePageSelect(p)}
                  className={`min-w-[32px] h-8 px-2 rounded-lg font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                      : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageSelect(safeCurrentPage + 1)}
            disabled={safeCurrentPage === computedTotalPages}
            aria-label="Next page"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handlePageSelect(computedTotalPages)}
            disabled={safeCurrentPage === computedTotalPages}
            aria-label="Last page"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
            Page 1 of 1
          </span>
        </div>
      )}
    </div>
  );
}
