import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
}) => {
  const { isAuthenticated, hasPermission, hasRole, isLoading, user, logout } = useAuth();

  // If backend deactivates the user during an active session, force logout
  useEffect(() => {
    if (user && typeof (user as any).isActive !== 'undefined' && (user as any).isActive === false) {
      // Inform user and log out
      toast.info('Your account has been deactivated. You will be logged out.');
      // Call logout (will clear local state)
      logout();
    }
  }, [user, logout]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is deactivated, prevent access to routes
  if (user && typeof (user as any).isActive !== 'undefined' && (user as any).isActive === false) {
    return <Navigate to="/login" replace />;
  }

  // Force users who must change password to go to Profile page first
  if (user?.mustChangePassword && window.location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have the required role to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
