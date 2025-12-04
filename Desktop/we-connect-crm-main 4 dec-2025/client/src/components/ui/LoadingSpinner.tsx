import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  variant = 'spinner'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  if (variant === 'dots') {
    return (
      <div className={`flex space-x-2 ${className}`}>
        <div className="w-2 h-2 bg-weconnect-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-weconnect-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-weconnect-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`rounded-full bg-weconnect-red animate-pulse ${sizeClasses[size]} ${className}`} />
    );
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-weconnect-red ${sizeClasses[size]} ${className}`} />
  );
};

// Page Loader - Full screen loading
interface PageLoaderProps {
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">
      <LoadingSpinner size="xl" className="mb-4" />
      <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
    </div>
  );
};

// Card Loader - For loading cards/sections
export const CardLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-lg">
      <LoadingSpinner size="lg" className="mb-3" />
      <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
    </div>
  );
};

// Inline Loader - Small loader for inline elements
export const InlineLoader: React.FC = () => {
  return <LoadingSpinner size="sm" variant="dots" />;
};

// Skeleton Loader - For content placeholders
interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-200 dark:bg-slate-800 rounded ${className}`}
        />
      ))}
    </>
  );
};

// Table Skeleton - For loading tables
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
