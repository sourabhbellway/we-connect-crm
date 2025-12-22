import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputRef?: React.Ref<HTMLInputElement>;
}

interface TextAreaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  className,
  required,
  inputRef,
  ...rest
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 pr-2 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        {leftIcon && (
          <span className="absolute inset-y-0 left-9 w-px bg-gray-200 dark:bg-gray-600" />
        )}
        <input
          {...rest}
          ref={inputRef}
          required={required}
          className={[
            "block w-full",
            leftIcon ? "pl-12" : "pl-4",
            rightIcon ? "pr-12" : "pr-4",
            "py-3 rounded-lg border transition-all duration-200",
            "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
            "placeholder:text-gray-500 dark:placeholder:text-gray-400",
            error
              ? "border-red-300 dark:border-red-600 hover:border-red-400 dark:hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            className || "",
          ].join(" ")}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
};

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  error,
  className,
  rows = 3,
  onChange,
  required,
  ...rest
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value;
    
    // Restrict special characters that could be harmful
    const restrictedChars = /<script|<\/script|javascript:|on\w+\s*=|<iframe|<object|<embed/i;
    if (restrictedChars.test(value)) {
      // Remove restricted content
      value = value.replace(restrictedChars, '');
    }
    
    // Update the event target value
    e.target.value = value;
    
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        {...rest}
        onChange={handleChange}
        required={required}
        className={[
          "w-full rounded-lg border p-4 text-sm transition-all duration-200",
          "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
          "placeholder:text-gray-500 dark:placeholder:text-gray-400",
          "resize-y",
          error
            ? "border-red-300 dark:border-red-600 hover:border-red-400 dark:hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          className || "",
        ].join(" ")}
      />
      {error && (
        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
};

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  error,
  leftIcon,
  className,
  children,
  required,
  ...rest
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 pr-2 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        {leftIcon && (
          <span className="absolute inset-y-0 left-9 w-px bg-gray-200 dark:bg-gray-600" />
        )}
        <select
          {...rest}
          required={required}
          className={[
            "block w-full",
            leftIcon ? "pl-12 pr-4" : "px-4",
            "py-3 rounded-lg border text-sm transition-all duration-200",
            "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
            "appearance-none cursor-pointer",
            error
              ? "border-red-300 dark:border-red-600 hover:border-red-400 dark:hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            className || "",
          ].join(" ")}
        >
          {children}
        </select>
      </div>
      {error && (
        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
};

export default InputField;
