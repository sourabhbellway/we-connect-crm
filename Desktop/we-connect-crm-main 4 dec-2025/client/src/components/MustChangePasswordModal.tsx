import React, { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  onNavigateToProfile?: () => void;
  message?: string;
};

const MustChangePasswordModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onNavigateToProfile,
  message = "You must change your password before continuing.",
}) => {
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setShowModal(false);
    onClose?.();
  };

  const handleNavigate = () => {
    onNavigateToProfile?.();
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 animation-fade-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon and heading */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Password Change Required
            </h2>
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Action buttons */}
        <div className="flex gap-3 justify-end">
         
          <button
            onClick={handleNavigate}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 dark:bg-red-500 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default MustChangePasswordModal;
