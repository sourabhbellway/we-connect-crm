import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
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
  ...rest
}) => {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
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
          className={[
            "block w-full",
            leftIcon ? "pl-12" : "pl-3",
            rightIcon ? "pr-12" : "pr-3",
            "py-2 rounded-xl border transition-colors",
            "bg-white dark:bg-gray-700",
            error
              ? "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none ring-2 ring-rose-500 focus:ring-rose-500"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
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
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        {...rest}
        onChange={handleChange}
        className={[
          "w-full rounded-xl border p-2 text-sm transition-colors",
          "bg-white dark:bg-gray-700",
          error
            ? "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none ring-2 ring-rose-500 focus:ring-rose-500"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
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
  ...rest
}) => {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
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
          className={[
            "block w-full",
            leftIcon ? "pl-12 pr-3" : "px-3",
            "py-2.5 rounded-xl border text-sm transition-colors",
            "bg-white dark:bg-gray-700",
            error
              ? "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none ring-2 ring-rose-500 focus:ring-rose-500"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
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
