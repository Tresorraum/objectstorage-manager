import React from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';

interface LogsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function LogsPagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
}: LogsPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 7;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-700">
          Showing <span className="font-semibold">{((currentPage - 1) * limit) + 1}</span> to{' '}
          <span className="font-semibold">{Math.min(currentPage * limit, totalItems)}</span> of{' '}
          <span className="font-semibold">{totalItems}</span> results
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="First page"
          >
            <ChevronDoubleLeftIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                1
              </button>
              {startPage > 2 && <span className="text-gray-400">...</span>}
            </>
          )}

          {pages.map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                pageNum === currentPage
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-gray-400">...</span>}
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Last page"
          >
            <ChevronDoubleRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
