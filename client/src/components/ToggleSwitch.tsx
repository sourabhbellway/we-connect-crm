import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  activeLabel?: string;
  inactiveLabel?: string;
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  className = "",
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mr-3">
          {label}
        </label>
      )}

      <div className="flex items-center space-x-3">
        {/* Toggle Switch */}
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#ef444e] focus:ring-offset-2 ${
            checked
              ? "bg-gradient-to-r from-[#ef444e] to-[#f26971]"
              : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              checked ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>

        {/* Status Label */}
        <div className="flex items-center space-x-1">
          {checked ? (
            <>
              <CheckCircle className="h-4 w-4 text-[#ef444e]" />
              <span className="text-sm font-medium text-[#ef444e] dark:text-[#f26971]">
                {activeLabel}
              </span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {inactiveLabel}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToggleSwitch;
