import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  itemsPerPageOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  itemsPerPageOptions = [5, 10, 25, 50],
  className = ''
}) => {
  if (totalPages <= 1 && !showItemsPerPage) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 4) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Items per page selector */}
      {showItemsPerPage && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Page info and navigation */}
      <div className="flex items-center space-x-4">
        {/* Page info */}
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing {startItem} to {endItem} of {totalItems} entries
        </div>

        {/* Navigation buttons */}
        {totalPages > 1 && (
          <div className="flex items-center space-x-1">
            {/* First page */}
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>

            {/* Previous page */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page numbers */}
            {visiblePages.map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={page === '...' || page === currentPage}
                className={`px-3 py-1 rounded border text-sm transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : page === '...'
                    ? 'border-gray-300 dark:border-gray-600 cursor-default'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next page */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Last page */}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};