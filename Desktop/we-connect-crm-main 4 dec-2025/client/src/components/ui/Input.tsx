import React from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { UI_CONFIG } from '../../constants';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  fullWidth?: boolean;
  variant?: 'default' | 'outlined' | 'filled';
  divided?: boolean; // For divided icon style from mockboard
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      fullWidth = true,
      variant = 'outlined',
      divided = false,
      type = 'text',
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [inputType, setInputType] = React.useState(type);
    const [isFocused, setIsFocused] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);

    React.useEffect(() => {
      if (showPasswordToggle && type === 'password') {
        setInputType(showPassword ? 'text' : 'password');
      }
    }, [showPassword, showPasswordToggle, type]);

    // Base styles following WeConnect design system
    const baseStyles = 'transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed font-medium';

    // Variant styles based on mockboard
    const variantStyles = {
      default: 'border-0 border-b-2 bg-transparent rounded-none px-0 py-3',
      outlined: 'border-2 rounded-xl px-4 py-3 bg-white dark:bg-gray-800',
      filled: 'border-0 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700',
    };

    // State-based styles using WeConnect colors
    const getStateStyles = () => {
      if (error) {
        return 'border-weconnect-red focus:border-weconnect-red text-weconnect-red';
      }
      if (success) {
        return 'border-brand-green focus:border-brand-green text-brand-green';
      }
      if (disabled) {
        return 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed';
      }
      if (isFocused) {
        return 'border-brand-blue shadow-sm';
      }
      if (isHovered) {
        return 'border-gray-400';
      }
      return 'border-gray-300';
    };

    const combinedStyles = [
      baseStyles,
      variantStyles[variant],
      getStateStyles(),
      fullWidth && 'w-full',
      leftIcon && !divided && 'pl-12',
      leftIcon && divided && 'pl-16',
      (rightIcon || showPasswordToggle || error || success) && 'pr-12',
      'text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const togglePassword = () => {
      setShowPassword(!showPassword);
    };

    const getRightIcon = () => {
      if (showPasswordToggle && type === 'password') {
        return (
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={togglePassword}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        );
      }
      if (error) {
        return <AlertCircle className="h-5 w-5 text-weconnect-red" />;
      }
      if (success) {
        return <CheckCircle className="h-5 w-5 text-brand-green" />;
      }
      return rightIcon;
    };

    const rightIconElement = getRightIcon();

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}
        
        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {leftIcon && (
            <div className={`absolute inset-y-0 left-0 flex items-center pointer-events-none ${
              divided 
                ? 'pl-4 border-r border-gray-300 w-12 justify-center'
                : 'pl-4'
            }`}>
              <div className="text-gray-400">{leftIcon}</div>
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={combinedStyles}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {rightIconElement && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              {rightIconElement}
            </div>
          )}
        </div>

        {(error || success || helperText) && (
          <div className="mt-2 text-sm">
            {error && (
              <div className="flex items-center text-weconnect-red">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}
            {success && !error && (
              <div className="flex items-center text-brand-green">
                <CheckCircle className="h-4 w-4 mr-1" />
                {success}
              </div>
            )}
            {helperText && !error && !success && (
              <div className="text-gray-500 dark:text-gray-400">{helperText}</div>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;