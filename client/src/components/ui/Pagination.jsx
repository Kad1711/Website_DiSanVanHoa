import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, hasPrevPage, hasNextPage } = pagination;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 my-4 select-none">
      {/* Prev Button */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevPage}
        className="px-2.5 sm:px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm font-medium hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-1"
        aria-label="Trang trước"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Trước</span>
      </button>

      {/* Mobile Page Indicator */}
      <div className="sm:hidden px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 shadow-sm">
        {page} / {totalPages}
      </div>

      {/* Desktop / Tablet Page Numbers */}
      <div className="hidden sm:flex items-center gap-1">
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={i} className="px-2 text-gray-400 text-sm">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-sm ${
                p === page
                  ? 'bg-primary text-white font-bold ring-2 ring-primary/30'
                  : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage}
        className="px-2.5 sm:px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm font-medium hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-1"
        aria-label="Trang sau"
      >
        <span className="hidden sm:inline">Sau</span>
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
