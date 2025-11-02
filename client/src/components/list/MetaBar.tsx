import React from 'react';
import { ChevronLeft, ChevronRight, Settings, MoreHorizontal } from 'lucide-react';

interface MetaBarProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onItemsPerPageChange?: (n: number) => void;
  rightNode?: React.ReactNode;
}

const MetaBar: React.FC<MetaBarProps> = ({ currentPage, itemsPerPage, totalItems, onItemsPerPageChange, rightNode }) => {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-2">
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-600 dark:text-gray-400">Per Page</span>
        <select
          value={String(itemsPerPage)}
          onChange={(e) => onItemsPerPageChange?.(Number(e.target.value))}
          className="h-9 px-3 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span className="text-gray-500 dark:text-gray-400">{start} - {end} of {totalItems}</span>
      </div>
      <div className="flex items-center gap-2">
        {rightNode}
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
          <Settings className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MetaBar;