import React from 'react';
import { Loader2 } from 'lucide-react';
import { BUTTON_VARIANTS, BUTTON_SIZES } from '../../constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Use the KEYS (e.g., 'PRIMARY') to match how components pass the prop
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof BUTTON_SIZES;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'PRIMARY',
      size = 'MD',
      loading = false,
      loadingText,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
// Base styles with modern design
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    // Map styles by the UPPERCASE keys (PRIMARY, SECONDARY, ...)
    const variantStyles: Record<keyof typeof BUTTON_VARIANTS, string> = {
PRIMARY: 'bg-weconnect-red text-white hover:bg-red-500 focus:ring-red-400 shadow-md ',
SECONDARY: 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 focus:ring-gray-300 shadow border border-gray-200 dark:border-slate-600',
OUTLINE: 'border border-weconnect-red text-weconnect-red hover:bg-weconnect-red hover:text-white focus:ring-red-400 shadow-sm',
      GHOST: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 focus:ring-gray-300',
      DESTRUCTIVE: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-400 shadow-lg hover:shadow-xl',
    };

    // Size styles by the UPPERCASE keys (SM, MD, ...)
    const sizeStyles: Record<keyof typeof BUTTON_SIZES, string> = {
SM: 'text-xs px-3 h-9',
      MD: 'text-sm px-5 h-11',
      LG: 'text-base px-6 h-12',
      XL: 'text-lg px-8 h-14',
    };

    // Icon sizes based on button size
    const iconSizes: Record<keyof typeof BUTTON_SIZES, string> = {
      SM: 'w-3 h-3',
      MD: 'w-4 h-4',
      LG: 'w-5 h-5',
      XL: 'w-6 h-6',
    };

    const combinedStyles = [
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && 'w-full',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const isDisabled = disabled || loading;

    const iconElement = loading ? (
      <Loader2 className={`${iconSizes[size]} animate-spin`} />
    ) : (
      icon
    );

    const contentText = loading && loadingText ? loadingText : children;

    return (
      <button
        ref={ref}
        className={`${combinedStyles} gap-2`}
        disabled={isDisabled}
        style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          verticalAlign: 'middle'
        }}
        {...props}
      >
        {iconElement && iconPosition === 'left' && (
          <span 
            className="inline-flex items-center justify-center shrink-0" 
            style={{ 
              lineHeight: 1,
              display: 'inline-flex',
              alignItems: 'center',
              verticalAlign: 'middle'
            }}
          >
            {iconElement}
          </span>
        )}
        {contentText && (
          <span 
            className="inline-flex items-center" 
            style={{ 
              lineHeight: 1,
              display: 'inline-flex',
              alignItems: 'center',
              verticalAlign: 'middle'
            }}
          >
            {contentText}
          </span>
        )}
        {iconElement && iconPosition === 'right' && (
          <span 
            className="inline-flex items-center justify-center shrink-0" 
            style={{ 
              lineHeight: 1,
              display: 'inline-flex',
              alignItems: 'center',
              verticalAlign: 'middle'
            }}
          >
            {iconElement}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
