import React from "react";

interface NoResultsProps {
  title?: string;
  description?: string;
  showClearButton?: boolean;
  onClear?: () => void;
  icon?: React.ReactNode;
  className?: string;
  isError?: boolean;
}

const NoResults: React.FC<NoResultsProps> = ({
  title = "No users found",
  description = "Try adjusting your filters or search terms. You can also clear all filters to see all users.",
  showClearButton = false,
  onClear,
  icon,
  className = "",
  isError = false,
}) => {
  return (
    <div className={`flex flex-col items-center ${className} h-full`}>
      {icon && <div className="mb-4">{icon}</div>}
      <h3
        className={`text-lg font-medium mb-2 ${
          isError
            ? "text-red-600 dark:text-red-400"
            : "text-gray-900 dark:text-white"
        }`}
      >
        {title}
      </h3>
      <p
        className={`${
          isError
            ? "text-red-600 dark:text-red-400"
            : "text-gray-500 dark:text-gray-400"
        } mb-4 text-center max-w-md`}
      >
        {description}
      </p>
      {showClearButton && (
        <button
          onClick={onClear}
          className="flex items-center px-4 py-2.5 bg-blue-700 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
};

export default NoResults;
