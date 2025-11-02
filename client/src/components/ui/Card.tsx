import React from 'react';
import { CARD_VARIANTS } from '../../constants';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof CARD_VARIANTS;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'DEFAULT', padding = 'md', children, ...props }, ref) => {
    // Cleaner base: no scale/translate on hover, subtler transitions
    const baseStyles = 'rounded-xl border transition-shadow duration-200';

    // Subtle, consistent variants (reduced shadow intensity and motion)
    const variantStyles = {
      [CARD_VARIANTS.DEFAULT]: 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md',
      [CARD_VARIANTS.ELEVATED]: 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 shadow-md hover:shadow-lg',
      [CARD_VARIANTS.OUTLINED]: 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200 dark:border-slate-600',
      [CARD_VARIANTS.GRADIENT]: 'bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900 border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md',
    } as const;

    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-12',
    } as const;

    const combinedStyles = [
      baseStyles,
      variantStyles[variant],
      paddingStyles[padding],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={combinedStyles} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`pb-6 border-b border-gray-100 dark:border-slate-700 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`py-6 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`pt-6 border-t border-gray-100 dark:border-slate-700 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };
export default Card;
