import React from 'react';
import { UI_CONFIG } from '../../constants';

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: number;
  gap?: number;
  fullWidth?: boolean;
}

interface GridItemProps {
  children: React.ReactNode;
  className?: string;
  span?: number;
  offset?: number;
}

// Main Grid Container
export const Grid: React.FC<GridProps> = ({ 
  children, 
  className = '', 
  cols = 12,
  gap = 1,
  fullWidth = true 
}) => {
  const gridStyles = `
    grid-template-columns: repeat(${cols}, minmax(0, 1fr));
    gap: ${gap * UI_CONFIG.GRID.COLUMN_WIDTH}px;
  `;

  return (
    <div 
      className={`grid ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{ 
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: `${gap * UI_CONFIG.GRID.GUTTER}px`
      }}
    >
      {children}
    </div>
  );
};

// Grid Item
export const GridItem: React.FC<GridItemProps> = ({ 
  children, 
  className = '', 
  span = 1,
  offset = 0 
}) => {
  const spanClass = span ? `col-span-${span}` : '';
  const offsetClass = offset ? `col-start-${offset + 1}` : '';

  return (
    <div className={`${spanClass} ${offsetClass} ${className}`}>
      {children}
    </div>
  );
};

// Container with WeConnect grid system
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centered?: boolean;
}

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  className = '', 
  size = 'full',
  centered = true 
}) => {
  const sizeClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md', 
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    full: 'max-w-full'
  };

  return (
    <div className={`${sizeClasses[size]} ${centered ? 'mx-auto' : ''} px-4 ${className}`}>
      {children}
    </div>
  );
};

// Column-based layout following WeConnect 30px system
interface ColumnProps {
  children: React.ReactNode;
  className?: string;
  width?: number; // In grid columns (30px each)
}

export const Column: React.FC<ColumnProps> = ({ 
  children, 
  className = '', 
  width = 1 
}) => {
  const widthStyle = {
    width: `${width * UI_CONFIG.GRID.COLUMN_WIDTH}px`,
    minWidth: `${width * UI_CONFIG.GRID.COLUMN_WIDTH}px`,
  };

  return (
    <div 
      className={`${className}`}
      style={widthStyle}
    >
      {children}
    </div>
  );
};

// Spacer component for consistent spacing
interface SpacerProps {
  size?: number; // In grid units (30px)
  direction?: 'horizontal' | 'vertical';
}

export const Spacer: React.FC<SpacerProps> = ({ 
  size = 1, 
  direction = 'vertical' 
}) => {
  const spacing = size * UI_CONFIG.GRID.COLUMN_WIDTH;
  
  if (direction === 'horizontal') {
    return <div style={{ width: `${spacing}px`, minWidth: `${spacing}px` }} />;
  }
  
  return <div style={{ height: `${spacing}px`, minHeight: `${spacing}px` }} />;
};

export default Grid;