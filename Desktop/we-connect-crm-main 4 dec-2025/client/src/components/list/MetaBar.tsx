import React, { useState } from 'react';
import { Settings } from 'lucide-react';

interface ColumnConfigItem {
  id: string;
  label: string;
}

interface ColumnConfigProps {
  columns: ColumnConfigItem[];
  visibleColumns: string[];
  onChange: (nextVisible: string[]) => void;
  minVisible?: number;
}

interface MetaBarProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onItemsPerPageChange?: (n: number) => void;
  rightNode?: React.ReactNode;
  columnConfig?: ColumnConfigProps;
}

const MetaBar: React.FC<MetaBarProps> = ({
  currentPage,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange,
  rightNode,
  columnConfig,
}) => {
  const [open, setOpen] = useState(false);
  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  const toggleColumn = (id: string) => {
    if (!columnConfig) return;
    const { visibleColumns, onChange, minVisible = 1 } = columnConfig;
    const isVisible = visibleColumns.includes(id);

    if (!isVisible) {
      onChange([...visibleColumns, id]);
      return;
    }

    // Prevent hiding all columns
    if (visibleColumns.length <= minVisible) return;
    onChange(visibleColumns.filter((c) => c !== id));
  };

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
      <div className="relative flex items-center gap-2">
        {rightNode}
        {columnConfig && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
              title="Configure columns"
            >
              <Settings className="w-4 h-4" />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-20">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Columns
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {columnConfig.columns.map((col) => {
                    const checked = columnConfig.visibleColumns.includes(col.id);
                    return (
                      <label
                        key={col.id}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer gap-2"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#ef444e] focus:ring-[#ef444e]"
                          checked={checked}
                          onChange={() => toggleColumn(col.id)}
                        />
                        <span className="truncate">{col.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaBar;
