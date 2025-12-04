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
      <div className="relative max-w-full">
<Filter className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <select
          value={typeof value === "boolean" ? value.toString() : value}
          onChange={(e) => {
            const newValue = e.target.value;
            // Handle boolean values
            if (newValue === "true") onChange(true);
            else if (newValue === "false") onChange(false);
            else onChange(newValue);
          }}
          style={{ WebkitAppearance: 'none', backgroundImage: 'none', lineHeight: '44px', verticalAlign: 'middle' }}
className="w-full max-w-full h-11 pl-11 pr-8 border border-gray-200 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer transition-colors duration-200 text-center leading-[44px]"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
};

export default DropdownFilter;
