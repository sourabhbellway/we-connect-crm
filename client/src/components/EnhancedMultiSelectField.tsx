import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

interface Option {
    value: string | number;
    label: string;
    icon?: React.ReactNode;
    description?: string;
}

interface EnhancedMultiSelectFieldProps {
    label?: string;
    placeholder?: string;
    value: (string | number)[];
    options: Option[];
    onChange: (value: (string | number)[]) => void;
    error?: string;
    required?: boolean;
    searchable?: boolean;
    clearable?: boolean;
    disabled?: boolean;
    className?: string;
}

export const EnhancedMultiSelectField: React.FC<EnhancedMultiSelectFieldProps> = ({
    label,
    placeholder = "Select options",
    value = [],
    options,
    onChange,
    error,
    required,
    searchable = true,
    clearable = true,
    disabled,
    className
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOptions = options.filter(option => value.includes(option.value));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
                setFocusedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && searchable && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen, searchable]);

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (!isOpen) {
            if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setIsOpen(true);
                setFocusedIndex(0);
            }
            return;
        }

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setFocusedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                event.preventDefault();
                setFocusedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
                break;
            case 'Enter':
                event.preventDefault();
                if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
                    handleToggle(filteredOptions[focusedIndex].value);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSearchTerm('');
                setFocusedIndex(-1);
                break;
        }
    };

    const handleToggle = (optionValue: string | number) => {
        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];
        onChange(newValue);
        setSearchTerm('');
    };

    const handleRemove = (event: React.MouseEvent, optionValue: string | number) => {
        event.stopPropagation();
        onChange(value.filter(v => v !== optionValue));
    };

    const handleClear = (event: React.MouseEvent) => {
        event.stopPropagation();
        onChange([]);
        setSearchTerm('');
    };

    const toggleDropdown = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
        if (!isOpen) {
            setFocusedIndex(-1);
        }
    };

    return (
        <div className={`relative ${className || ''}`} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                    {required && (
                        <span className="text-red-500 ml-1">*</span>
                    )}
                </label>
            )}

            <div className="relative">
                <div
                    className={`
            relative w-full rounded-lg border transition-all duration-200 cursor-pointer
            min-h-[46px] px-4 py-2 flex flex-wrap gap-2
            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
            ${error
                            ? 'border-red-300 dark:border-red-600 hover:border-red-400 dark:hover:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }
            ${isOpen
                            ? 'ring-2 ring-blue-500 border-blue-500'
                            : 'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500'
                        }
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' : ''}
          `}
                    onClick={toggleDropdown}
                    onKeyDown={handleKeyDown}
                    tabIndex={disabled ? -1 : 0}
                >
                    {selectedOptions.length > 0 ? (
                        selectedOptions.map(option => (
                            <span
                                key={option.value}
                                className="inline-flex items-center px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium"
                            >
                                {option.label}
                                <button
                                    type="button"
                                    onClick={(e) => handleRemove(e, option.value)}
                                    className="ml-1 p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))
                    ) : (
                        !isOpen && <span className="text-gray-500 dark:text-gray-400 text-sm py-1">{placeholder}</span>
                    )}

                    {isOpen && searchable && (
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={selectedOptions.length === 0 ? "Search..." : ""}
                            className="bg-transparent border-none outline-none text-sm flex-1 min-w-[60px]"
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}

                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
                        {clearable && selectedOptions.length > 0 && !disabled && (
                            <button
                                onClick={handleClear}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                                tabIndex={-1}
                            >
                                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
                    </div>
                </div>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                        <ul ref={listRef} className="py-1">
                            {filteredOptions.length === 0 ? (
                                <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                    No options found
                                </li>
                            ) : (
                                filteredOptions.map((option, index) => {
                                    const isSelected = value.includes(option.value);
                                    return (
                                        <li key={option.value} className="relative">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggle(option.value);
                                                }}
                                                className={`
                          w-full text-left px-4 py-2 text-sm transition-colors duration-150
                          flex items-center space-x-3
                          ${index === focusedIndex
                                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-600'
                                                    }
                          ${isSelected
                                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium'
                                                        : 'text-gray-900 dark:text-gray-100'
                                                    }
                        `}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                                    {isSelected && <Check className="h-3 w-3 text-white" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div>{option.label}</div>
                                                    {option.description && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {option.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    );
};
