import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { activityService } from '../services/activityService';
import { transformActivityData } from '../utils/activityUtils';
import { PERMISSIONS } from '../constants';
import { Clock, User } from 'lucide-react';

const ActivitiesPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        if (!hasPermission(PERMISSIONS.ACTIVITY.READ)) {
          setError('You do not have permission to view activities.');
          return;
        }

        setLoading(true);
        const response = await activityService.getRecentActivities(100); // Get more activities for the dedicated page
        const items = response?.data?.items || response?.data || [];
        const transformedActivities = Array.isArray(items)
          ? items.map(transformActivityData)
          : [];
        setActivities(transformedActivities);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Failed to load activities.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [hasPermission]);

  if (!hasPermission(PERMISSIONS.ACTIVITY.READ)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to view activities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Activities</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View all system activities and user actions
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No activities found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {activity.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${activity.iconColor}`}>
                      {activity.type?.replace('_', ' ') || 'OTHER'}
                    </span>
                  </div>

                  {activity.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {activity.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {activity.time}
                    </div>
                    {activity.user && (
                      <div className="flex items-center">
                        <User size={14} className="mr-1" />
                        {activity.user.firstName} {activity.user.lastName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivitiesPage;