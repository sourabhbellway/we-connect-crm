import React from "react";
import { AlertTriangle, LogIn } from "lucide-react";

interface TokenExpiryModalProps {
  isOpen: boolean;
  onLogin: () => void;
}

const TokenExpiryModal: React.FC<TokenExpiryModalProps> = ({
  isOpen,
  onLogin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Session Expired
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your session has expired. Please login again to continue.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onLogin}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
