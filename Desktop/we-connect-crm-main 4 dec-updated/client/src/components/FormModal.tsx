import React from "react";

interface FormModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitText?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

const FormModal: React.FC<FormModalProps> = ({
  open,
  title,
  onClose,
  onSubmit,
  submitText = "Save",
  disabled,
  children,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md">
        <div className="relative overflow-hidden rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white dark:bg-gray-900 shadow-xl max-h-[85vh] flex flex-col">
          <form onSubmit={onSubmit} noValidate>
            <div className="flex items-start justify-between px-5 pt-5 pb-3">
              <h3 id="modal-title" className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-5 pb-5 space-y-4 overflow-y-auto flex-1">
              {children}
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md text-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={disabled}
                className={`px-4 py-2 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-colors ${
                  disabled
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
                }`}
              >
                {submitText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormModal;


