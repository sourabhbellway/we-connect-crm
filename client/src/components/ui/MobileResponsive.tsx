import React from 'react';

// Mobile-optimized page container
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`space-y-4 md:space-y-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen ${className}`}>
      {children}
    </div>
  );
};

// Mobile-responsive header section
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action, icon }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

// Mobile-responsive filter section
interface FilterSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const FilterSection: React.FC<FilterSectionProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-col gap-3 sm:gap-4 ${className}`}>
      {children}
    </div>
  );
};

// Mobile-responsive filter row
interface FilterRowProps {
  children: React.ReactNode;
  className?: string;
}

export const FilterRow: React.FC<FilterRowProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${className}`}>
      {children}
    </div>
  );
};

// Mobile-responsive card
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({ 
  children, 
  className = '',
  padding = 'md'
}) => {
  const paddingClasses = {
    sm: 'p-3 md:p-4',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

// Mobile-responsive grid
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
  className = ''
}) => {
  const colClasses = `grid-cols-${cols.mobile || 1} sm:grid-cols-${cols.tablet || 2} lg:grid-cols-${cols.desktop || 3}`;
  const gapClass = `gap-${gap}`;
  
  return (
    <div className={`grid ${colClasses} ${gapClass} ${className}`}>
      {children}
    </div>
  );
};

// Mobile-responsive table wrapper
interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
  mobileCardView?: boolean;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ 
  children, 
  className = '',
  mobileCardView = false
}) => {
  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className={`overflow-hidden ${mobileCardView ? 'sm:rounded-lg' : 'rounded-lg'}`}>
          <div className={mobileCardView ? 'sm:hidden' : ''}>
            {/* Mobile card view */}
            {children}
          </div>
          <div className={mobileCardView ? 'hidden sm:block' : ''}>
            {/* Desktop table view */}
            <table className={`min-w-full divide-y divide-gray-200 dark:divide-slate-700 ${className}`}>
              {children}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile-optimized button group
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ 
  children, 
  className = '',
  orientation = 'horizontal'
}) => {
  const orientationClass = orientation === 'vertical' 
    ? 'flex-col' 
    : 'flex-col sm:flex-row';
  
  return (
    <div className={`flex ${orientationClass} gap-2 sm:gap-3 ${className}`}>
      {children}
    </div>
  );
};

// Sticky mobile footer for actions
interface StickyFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const StickyFooter: React.FC<StickyFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`sticky bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 p-4 md:relative md:border-0 md:p-0 md:bg-transparent shadow-lg md:shadow-none z-20 ${className}`}>
      {children}
    </div>
  );
};

export default {
  PageContainer,
  PageHeader,
  FilterSection,
  FilterRow,
  ResponsiveCard,
  ResponsiveGrid,
  ResponsiveTable,
  ButtonGroup,
  StickyFooter,
};
