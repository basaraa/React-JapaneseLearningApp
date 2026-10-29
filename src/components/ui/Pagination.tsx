import { useLanguage } from '../../context';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  pageSizeOptions = [25, 100, 200, 500, 1000],
  onPageChange,
  onPageSizeChange,
  className = '',
}: PaginationProps) {
  const { language } = useLanguage();

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (validPage - 1) * pageSize + 1;
  const endItem = Math.min(validPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (validPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (validPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', validPage - 1, validPage, validPage + 1, '...', totalPages];
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 border-t border-gray-200 dark:border-gray-700/80 ${className}`}
    >
      {/* Left: Item range summary & Page size select */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-600 dark:text-gray-400">
        <span>
          {language === 'sk' ? (
            <>
              Zobrazené <span className="font-semibold text-gray-900 dark:text-white">{startItem}–{endItem}</span> z{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{totalItems}</span> slovíčok
            </>
          ) : (
            <>
              Showing <span className="font-semibold text-gray-900 dark:text-white">{startItem}–{endItem}</span> of{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{totalItems}</span> words
            </>
          )}
        </span>

        <div className="flex items-center gap-1.5 pl-2 sm:border-l border-gray-200 dark:border-gray-700">
          <label htmlFor="page-size-select" className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {language === 'sk' ? 'Na stránku:' : 'Per page:'}
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="px-2 py-1 text-xs font-semibold rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-sakura-500 cursor-pointer"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Navigation buttons */}
      <div className="flex items-center gap-1">
        {/* First page (desktop) */}
        <button
          onClick={() => onPageChange(1)}
          disabled={validPage <= 1}
          className="hidden sm:inline-flex p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title={language === 'sk' ? 'Prvá strana' : 'First page'}
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(validPage - 1)}
          disabled={validPage <= 1}
          className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title={language === 'sk' ? 'Predchádzajúca strana' : 'Previous page'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Mobile current page indicator */}
        <span className="sm:hidden px-2 text-xs font-medium text-gray-700 dark:text-gray-300">
          {validPage} / {totalPages}
        </span>

        {/* Desktop page number buttons */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((p, idx) =>
            typeof p === 'number' ? (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-colors ${
                  validPage === p
                    ? 'bg-sakura-600 text-white font-bold shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={`ellipsis-${idx}`} className="px-1 text-xs text-gray-400 select-none">
                …
              </span>
            )
          )}
        </div>

        {/* Next page */}
        <button
          onClick={() => onPageChange(validPage + 1)}
          disabled={validPage >= totalPages}
          className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title={language === 'sk' ? 'Ďalšia strana' : 'Next page'}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last page (desktop) */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={validPage >= totalPages}
          className="hidden sm:inline-flex p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title={language === 'sk' ? 'Posledná strana' : 'Last page'}
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

