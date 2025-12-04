import React from "react";
import { AlertTriangle, LogIn } from "lucide-react";

interface TokenExpiryModalProps {
  isOpen: boolean;
  onLogin: () => void;
  title?: string;
  message?: string;
}

const TokenExpiryModal: React.FC<TokenExpiryModalProps> = ({
  isOpen,
  onLogin,
  title = "Session Expired",
  message = "Your session has expired for security reasons. Please login again to continue using the application.",
}) => {
  // Auto-focus on login button when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const loginButton = document.querySelector('[data-testid="login-again-button"]') as HTMLButtonElement;
        if (loginButton) {
          loginButton.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>

        <div className="flex justify-center">
          <button
            data-testid="login-again-button"
            onClick={onLogin}
            className="flex items-center px-6 py-3 bg-[#ef444e] text-white rounded-lg hover:bg-[#f26971] transition-colors focus:outline-none focus:ring-2 focus:ring-[#ef444e] focus:ring-offset-2"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Login Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenExpiryModal;
