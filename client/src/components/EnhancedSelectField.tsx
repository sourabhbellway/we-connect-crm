import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface EnhancedSelectFieldProps {
  label?: string;
  placeholder?: string;
  value?: string | number;
  options: Option[];
  onChange: (value: string | number) => void;
  error?: string;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  leftIcon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const EnhancedSelectField: React.FC<EnhancedSelectFieldProps> = ({
  label,
  placeholder = "Select an option",
  value,
  options,
  onChange,
  error,
  required,
  searchable = true,
  clearable = true,
  leftIcon,
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

  const selectedOption = options.find(option => option.value === value);

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

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.children[focusedIndex] as HTMLElement;
      focusedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

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
          handleSelect(filteredOptions[focusedIndex].value);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
        break;
    }
  };

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
    setFocusedIndex(-1);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange('');
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
        {/* Main button/input */}
        <div
          className={`
            relative w-full rounded-lg border transition-all duration-200 cursor-pointer
            ${leftIcon ? 'pl-12' : 'pl-4'} pr-10 py-3
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
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          {leftIcon && (
            <span className="absolute inset-y-0 left-9 w-px bg-gray-200 dark:bg-gray-600" />
          )}

          {/* Display area */}
          <div className="flex items-center justify-between w-full">
            {isOpen && searchable ? (
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search..."
                className="bg-transparent border-none outline-none text-sm w-full"
                onKeyDown={handleKeyDown}
              />
            ) : (
              <div className="flex items-center space-x-2 text-sm">
                {selectedOption?.icon && (
                  <span className="flex-shrink-0">{selectedOption.icon}</span>
                )}
                <span className={selectedOption ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
                  {selectedOption ? selectedOption.label : placeholder}
                </span>
              </div>
            )}
          </div>

          {/* Right side icons */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
            {clearable && selectedOption && !disabled && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                tabIndex={-1}
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''
              }`} />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
            {searchable && (
              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search options..."
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            )}

            <ul ref={listRef} className="py-1">
              {filteredOptions.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  No options found
                </li>
              ) : (
                filteredOptions.map((option, index) => (
                  <li key={option.value} className="relative">
                    <button
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`
                        w-full text-left px-4 py-3 text-sm transition-colors duration-150
                        flex items-center space-x-3
                        ${index === focusedIndex
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-600'
                        }
                        ${option.value === value
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium'
                          : 'text-gray-900 dark:text-gray-100'
                        }
                      `}
                    >
                      {option.icon && (
                        <span className="flex-shrink-0">{option.icon}</span>
                      )}
                      <div className="flex-1">
                        <div>{option.label}</div>
                        {option.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {option.description}
                          </div>
                        )}
                      </div>
                      {option.value === value && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                    </button>
                  </li>
                ))
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