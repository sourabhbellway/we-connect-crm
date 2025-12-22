import React from "react";

interface TableLoaderProps {
  rows?: number;
  columns?: number;
}

// Skeleton loader for tables, scoped to the table container
const TableLoader: React.FC<TableLoaderProps> = ({ rows = 5, columns = 6 }) => {
  return (
    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx}>
          {Array.from({ length: columns }).map((__, colIdx) => (
            <td key={colIdx} className="px-6 py-4 whitespace-nowrap">
              <div className="w-full">
                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-[#EF444E]/30 via-[#ff5a64]/40 to-[#EF444E]/30 animate-[shimmer_1.6s_infinite]" />
                </div>
              </div>
            </td>
          ))}
        </tr>
      ))}
      <style>
        {`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}
      </style>
    </tbody>
  );
};

export default TableLoader;


