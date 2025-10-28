import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PERMISSIONS } from '../../constants';
import Dashboard from '../../components/Dashboard';

const DashboardPage: React.FC = () => {
  const { hasPermission } = useAuth();

  // Check if user has permission to view dashboard
  if (!hasPermission(PERMISSIONS.DASHBOARD.READ)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to view the dashboard.
          </p>
        </div>
      </div>
    );
  }

  return <Dashboard />;
};

export default DashboardPage;