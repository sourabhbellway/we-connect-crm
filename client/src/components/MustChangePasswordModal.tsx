import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../services/userService";
import { toast } from "react-toastify";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

interface MustChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProfile: () => void;
}

const MustChangePasswordModal: React.FC<MustChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onNavigateToProfile,
}) => {
  const { user, updateUser } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    setError(null);

    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);
    const hasLength = value.length >= 8;

    setPasswordCriteria({
      length: hasLength,
      lowercase: hasLower,
      uppercase: hasUpper,
      number: hasNumber,
      special: hasSpecial,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    // Strong password validation
    const pwd = newPassword;
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    const hasLength = pwd.length >= 8;

    const allOk = hasLength && hasLower && hasUpper && hasNumber && hasSpecial;
    if (!allOk) {
      setError("Password must be 8+ characters with uppercase, lowercase, number, and special symbol");
      return;
    }

    try {
      setLoading(true);
      const resp = await userService.changePasswordForNewUser(newPassword);

      const updatedUserFromServer = (resp as any)?.data?.user
        || (resp as any)?.user
        || resp;

      if (updatedUserFromServer) {
        updateUser({ ...(user as any), ...updatedUserFromServer, mustChangePassword: false } as any);
      } else if (user?.mustChangePassword) {
        // At least clear the flag locally if backend succeeded but didn't return user
        updateUser({ ...(user as any), mustChangePassword: false } as any);
      }

      toast.success("Password updated successfully! You can now access all features.", {
        toastId: "password_change_success",
      });

      onClose();
      onNavigateToProfile();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to update password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Change Your Password
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            For security reasons, you must change your temporary password before accessing the system.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white pr-10"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white pr-10"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Password strength indicators */}
          <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
            <div className="font-medium">Password must include:</div>
            <div className="grid grid-cols-1 gap-1">
              <div className="flex items-center">
                {passwordCriteria.length ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400 mr-1" />
                )}
                <span>At least 8 characters</span>
              </div>
              <div className="flex items-center">
                {passwordCriteria.lowercase ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400 mr-1" />
                )}
                <span>Lowercase letter (a-z)</span>
              </div>
              <div className="flex items-center">
                {passwordCriteria.uppercase ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400 mr-1" />
                )}
                <span>Uppercase letter (A-Z)</span>
              </div>
              <div className="flex items-center">
                {passwordCriteria.number ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400 mr-1" />
                )}
                <span>Number (0-9)</span>
              </div>
              <div className="flex items-center">
                {passwordCriteria.special ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400 mr-1" />
                )}
                <span>Special symbol (!@#$%^&*...)</span>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Updating Password...
              </>
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MustChangePasswordModal;
