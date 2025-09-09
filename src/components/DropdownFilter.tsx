import React from "react";
import { ChevronDown, Filter } from "lucide-react";

interface DropdownFilterProps {
  value: string | boolean;
  onChange: (value: string | boolean) => void;
  options: Array<{ value: string | boolean; label: string }>;
  placeholder?: string;
  label?: string;
  className?: string;
}

const DropdownFilter: React.FC<DropdownFilterProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select option",
  label,
  className = "",
}) => {

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <select
          value={typeof value === "boolean" ? value.toString() : value}
          onChange={(e) => {
            const newValue = e.target.value;
            // Handle boolean values
            if (newValue === "true") onChange(true);
            else if (newValue === "false") onChange(false);
            else onChange(newValue);
          }}
          className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer transition-all duration-200"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
};

export default DropdownFilter;
