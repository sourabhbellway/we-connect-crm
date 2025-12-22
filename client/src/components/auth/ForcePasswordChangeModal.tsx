import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertTriangle } from 'lucide-react';

interface ForcePasswordChangeModalProps {
    open: boolean;
}

const ForcePasswordChangeModal: React.FC<ForcePasswordChangeModalProps> = ({ open }) => {
    const navigate = useNavigate();

    if (!open) return null;

    const handleNavigateToProfile = () => {
        navigate('/profile', { state: { focusPassword: true } });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-800 p-6 m-4 animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                        <Lock className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Password Change Required
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            For security reasons, you must change your temporary password before continuing.
                        </p>
                    </div>

                    <div className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 text-left">
                        <div className="flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                                    Action Required
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-400">
                                    Please update your password in your profile settings to secure your account.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleNavigateToProfile}
                        className="w-full py-2.5 px-4 bg-weconnect-red hover:bg-red-700 text-white font-medium rounded-lg transition-colors focus:ring-4 focus:ring-red-500/20"
                    >
                        Go to Change Password
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForcePasswordChangeModal;
