import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui';
import { Plus } from 'lucide-react';

export interface ToolbarAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface ListToolbarProps {
  title: string;
  subtitle?: string;
  addLabel?: string;
  onAdd?: () => void;
  bulkActions?: ToolbarAction[];
}

const ListToolbar: React.FC<ListToolbarProps> = ({ title, subtitle, addLabel = 'Add', onAdd, bulkActions = [] }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="space-y-4" ref={containerRef}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {subtitle && <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {bulkActions.length > 0 && (
            <div className="relative">
              <Button variant="SECONDARY" size="MD" onClick={() => setOpen((v) => !v)}>
                Bulk Actions
              </Button>
              {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-20">
                  <div className="py-2">
                    {bulkActions.map((ba, idx) => (
                      <button
                        key={idx}
                        disabled={ba.disabled}
                        onClick={() => {
                          ba.onClick();
                          setOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        <span className="inline-flex items-center gap-2">{ba.icon}{ba.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {onAdd && (
            <Button variant="PRIMARY" size="MD" onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              {addLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListToolbar;