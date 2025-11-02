import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export type SortOrder = 'asc' | 'desc';

interface Props<T extends string> {
  label: string;
  column: T;
  sortBy: T;
  sortOrder: SortOrder;
  onChange: (column: T) => void;
  className?: string;
}

const TableSortHeader = <T extends string>({ label, column, sortBy, sortOrder, onChange, className = '' }: Props<T>) => {
  const active = sortBy === column;
  return (
    <button
      type="button"
      onClick={() => onChange(column)}
      className={`inline-flex items-center gap-1 select-none ${className}`}
    >
      <span>{label}</span>
      {active ? (
        sortOrder === 'asc' ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )
      ) : null}
    </button>
  );
};

export default TableSortHeader;
