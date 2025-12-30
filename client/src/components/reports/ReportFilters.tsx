import React, { useState } from 'react';
import { Filter, X, Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent } from '../ui';

export interface FilterField {
    key: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'number' | 'boolean';
    options?: { label: string; value: any }[];
}

interface ReportFiltersProps {
    fields: FilterField[];
    onApply: (filters: any) => void;
    onClear: () => void;
    currentFilters: any;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({ fields, onApply, onClear, currentFilters }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState<any>(currentFilters || {});

    const handleAddField = (fieldKey: string) => {
        if (!localFilters[fieldKey]) {
            setLocalFilters({ ...localFilters, [fieldKey]: '' });
        }
    };

    const handleRemoveField = (fieldKey: string) => {
        const newFilters = { ...localFilters };
        delete newFilters[fieldKey];
        setLocalFilters(newFilters);
    };

    const handleValueChange = (fieldKey: string, value: any) => {
        setLocalFilters({ ...localFilters, [fieldKey]: value });
    };

    const handleApply = () => {
        onApply(localFilters);
        setIsOpen(false);
    };

    const handleClear = () => {
        setLocalFilters({});
        onClear();
        setIsOpen(false);
    };

    const activeFilterCount = Object.keys(localFilters).length;

    return (
        <div className="relative">
            <Button
                variant="OUTLINE"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 ${activeFilterCount > 0 ? 'border-weconnect-red text-weconnect-red bg-red-50 dark:bg-red-950/20' : ''}`}
            >
                <Filter className="w-4 h-4" />
                Filter
                {activeFilterCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-weconnect-red text-white rounded-full">
                        {activeFilterCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Card className="shadow-2xl border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Filter className="w-4 h-4 text-weconnect-red" />
                                Dynamic Filters
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <CardContent className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                            {Object.keys(localFilters).length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No active filters. Select a field to start filtering.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {Object.keys(localFilters).map((fieldKey) => {
                                        const field = fields.find(f => f.key === fieldKey);
                                        if (!field) return null;

                                        return (
                                            <div key={fieldKey} className="space-y-1.5 p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        {field.label}
                                                    </label>
                                                    <button
                                                        onClick={() => handleRemoveField(fieldKey)}
                                                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                {field.type === 'select' ? (
                                                    <select
                                                        className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-weconnect-red/20 focus:border-weconnect-red transition-all"
                                                        value={localFilters[fieldKey]}
                                                        onChange={(e) => handleValueChange(fieldKey, e.target.value)}
                                                    >
                                                        <option value="">Any {field.label}</option>
                                                        {field.options?.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                ) : field.type === 'boolean' ? (
                                                    <select
                                                        className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-weconnect-red/20 focus:border-weconnect-red transition-all"
                                                        value={localFilters[fieldKey]}
                                                        onChange={(e) => handleValueChange(fieldKey, e.target.value)}
                                                    >
                                                        <option value="">Any</option>
                                                        <option value="true">Yes</option>
                                                        <option value="false">No</option>
                                                    </select>
                                                ) : field.type === 'date' ? (
                                                    <input
                                                        type="date"
                                                        className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-weconnect-red/20 focus:border-weconnect-red transition-all"
                                                        value={localFilters[fieldKey]}
                                                        onChange={(e) => handleValueChange(fieldKey, e.target.value)}
                                                    />
                                                ) : (
                                                    <input
                                                        type={field.type}
                                                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                                                        className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-weconnect-red/20 focus:border-weconnect-red transition-all"
                                                        value={localFilters[fieldKey]}
                                                        onChange={(e) => handleValueChange(fieldKey, e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="pt-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block mb-2">Available Fields</label>
                                <div className="flex flex-wrap gap-2">
                                    {fields.filter(f => !localFilters[f.key]).map(field => (
                                        <button
                                            key={field.key}
                                            onClick={() => handleAddField(field.key)}
                                            className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-weconnect-red/10 hover:text-weconnect-red transition-all flex items-center gap-1 border border-transparent hover:border-weconnect-red/20"
                                        >
                                            <Plus className="w-3 h-3" />
                                            {field.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <div className="p-4 bg-gray-50 dark:bg-slate-950/50 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between rounded-b-xl">
                            <Button variant="GHOST" size="SM" onClick={handleClear} className="text-gray-500 dark:text-gray-400 hover:text-red-500">
                                Reset All
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="OUTLINE" size="SM" onClick={() => setIsOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="PRIMARY" size="SM" onClick={handleApply}>
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ReportFilters;
