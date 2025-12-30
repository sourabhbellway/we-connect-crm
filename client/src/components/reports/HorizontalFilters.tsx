import React from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';

export interface FilterField {
    key: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'number';
    placeholder?: string;
    options?: { label: string; value: any }[];
}

interface HorizontalFiltersProps {
    fields: FilterField[];
    values: any;
    onChange: (key: string, value: any) => void;
    itemsPerPage?: number;
    onItemsPerPageChange?: (value: number) => void;
}

const HorizontalFilters: React.FC<HorizontalFiltersProps> = ({
    fields,
    values,
    onChange,
    itemsPerPage,
    onItemsPerPageChange,
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm mb-6">
            <div className="flex flex-wrap items-end gap-4">
                {fields.map((field) => (
                    <div key={field.key} className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            {field.label}
                        </label>
                        <div className="relative group">
                            {field.type === 'select' ? (
                                <>
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-weconnect-red transition-colors">
                                        <Filter className="w-4 h-4" />
                                    </div>
                                    <select
                                        value={values[field.key] || ''}
                                        onChange={(e) => onChange(field.key, e.target.value)}
                                        className="w-full h-11 pl-10 pr-10 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-sm focus:ring-2 focus:ring-weconnect-red/20 focus:border-weconnect-red focus:bg-white dark:focus:bg-slate-900 transition-all appearance-none"
                                    >
                                        <option value="">{field.placeholder || 'Select option'}</option>
                                        {field.options?.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-weconnect-red transition-colors">
                                        <Search className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={field.type}
                                        placeholder={field.placeholder || `Search ${field.label.toLowerCase()}...`}
                                        value={values[field.key] || ''}
                                        onChange={(e) => onChange(field.key, e.target.value)}
                                        className="w-full h-11 pl-10 pr-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-sm focus:ring-2 focus:ring-weconnect-red/20 focus:border-weconnect-red focus:bg-white dark:focus:bg-slate-900 transition-all"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {onItemsPerPageChange && (
                    <div className="flex-initial w-32">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Items per page
                        </label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-weconnect-red transition-colors">
                                <Filter className="w-4 h-4" />
                            </div>
                            <select
                                value={itemsPerPage || 10}
                                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                                className="w-full h-11 pl-10 pr-10 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-sm focus:ring-2 focus:ring-weconnect-red/20 focus:border-weconnect-red focus:bg-white dark:focus:bg-slate-900 transition-all appearance-none"
                            >
                                {[10, 20, 50, 100].map((num) => (
                                    <option key={num} value={num}>
                                        {num}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HorizontalFilters;
