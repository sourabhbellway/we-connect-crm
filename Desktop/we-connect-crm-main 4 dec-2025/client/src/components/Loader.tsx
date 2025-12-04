import React from "react";

type LoaderProps = {
  containerClassName?: string;
  showTitle?: boolean;
  titleWidthClassName?: string; // e.g., w-1/4
  blocks?: number; // number of skeleton blocks
  gridColsClassName?: string; // e.g., grid-cols-1 md:grid-cols-2 lg:grid-cols-4
  blockHeightClassName?: string; // e.g., h-32, h-64
  blockClassName?: string;
  ariaLabel?: string;
  sizeClassName?: string; // e.g., h-12 w-12
};

const Loader: React.FC<LoaderProps> = ({
  containerClassName = "space-y-6 p-6",
  showTitle = true,
  titleWidthClassName = "w-1/4",
  blocks = 0,
  gridColsClassName = "grid-cols-1",
  blockHeightClassName = "h-24",
  blockClassName = "",
  ariaLabel = "Loading",
  sizeClassName = "h-12 w-12",
}) => {
  return (
    <div
      className={containerClassName}
      aria-busy="true"
      aria-label={ariaLabel}
      role="status"
    >
      <div className="animate-pulse">
        {showTitle && (
          <div
            className={`h-8 ${titleWidthClassName} mb-4 rounded bg-gray-300 dark:bg-gray-600`}
          />
        )}

        {blocks > 0 ? (
          <div className={`grid ${gridColsClassName} gap-6`}>
            {Array.from({ length: blocks }).map((_, i) => (
              <div
                key={i}
                className={`rounded-xl bg-gray-300 dark:bg-gray-700 ${blockHeightClassName} ${blockClassName}`}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <div className={`relative ${sizeClassName}`}>
              {/* Track */}
              <svg
                viewBox="0 0 50 50"
                className="absolute inset-0 animate-spin"
                aria-hidden="true"
              >
                {/* Background track (white/gray) */}
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  strokeWidth="6"
                  stroke="#FFFFFF"
                  className="dark:opacity-10 opacity-60"
                />
                {/* WeConnect Red arc */}
                <path
                  d="M25 5
                     a 20 20 0 0 1 0 40"
                  fill="none"
                  stroke="#EF444E"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                {/* WeConnect Black arc */}
                <path
                  d="M25 45
                     a 20 20 0 0 1 0 -40"
                  fill="none"
                  stroke="#2B2C2B"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>

              {/* Soft glow accent */}
              <div className="absolute inset-0 rounded-full blur-md opacity-20 bg-gradient-to-tr from-[#EF444E] to-[#2B2C2B]" />
            </div>
            <p className="mt-3 text-sm text-[#2B2C2B] dark:text-gray-300">
              Loading...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loader;
