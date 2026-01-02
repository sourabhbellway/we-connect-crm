import React, { useState } from 'react';
import {
  Calendar, Clock, User, Phone, Mail, MessageSquare, FileText,
  CheckCircle, TrendingUp, Search,
  Play
} from 'lucide-react';
import { Button, Card } from '../ui';

interface Activity {
  id: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'VISIT' | 'DEMO' | 'PRESENTATION' | 'FOLLOW_UP' | 'NOTE' | 'QUOTE_SENT' | 'CONTRACT_SENT' | 'PAYMENT_RECEIVED' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'STAGE_CHANGED' | 'WON' | 'LOST' | 'OTHER';
  title: string;
  description?: string;
  duration?: number;
  outcome?: string;
  scheduledAt?: string;
  completedAt?: string;
  isCompleted: boolean;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ActivityTimelineProps {
  entityType: 'lead' | 'deal' | 'contact' | 'company';
  entityId: string;
  activities: Activity[];
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities: initialActivities
}) => {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [searchTerm, setSearchTerm] = useState('');

  // Sync state when props change
  React.useEffect(() => {
    setActivities(initialActivities);
  }, [initialActivities]);

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = searchTerm === '' ||
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getActivityIcon = (type: string) => {
    const icons = {
      CALL: Phone,
      EMAIL: Mail,
      MEETING: Calendar,
      VISIT: User,
      DEMO: Play,
      PRESENTATION: FileText,
      FOLLOW_UP: Clock,
      NOTE: MessageSquare,
      QUOTE_SENT: FileText,
      CONTRACT_SENT: FileText,
      PAYMENT_RECEIVED: CheckCircle,
      PROPOSAL_SENT: FileText,
      NEGOTIATION: TrendingUp,
      STAGE_CHANGED: TrendingUp,
      WON: CheckCircle,
      LOST: Clock,
      OTHER: MessageSquare
    };
    return icons[type as keyof typeof icons] || MessageSquare;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      CALL: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
      EMAIL: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      MEETING: 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300',
      VISIT: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300',
      DEMO: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300',
      PRESENTATION: 'text-pink-600 bg-pink-100 dark:bg-pink-900 dark:text-pink-300',
      FOLLOW_UP: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300',
      NOTE: 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300',
      QUOTE_SENT: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300',
      CONTRACT_SENT: 'text-teal-600 bg-teal-100 dark:bg-teal-900 dark:text-teal-300',
      PAYMENT_RECEIVED: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      PROPOSAL_SENT: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
      NEGOTIATION: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300',
      STAGE_CHANGED: 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300',
      WON: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      LOST: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
      OTHER: 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300'
    };
    return colors[type as keyof typeof colors] || colors.OTHER;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Activity Timeline
          </h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-weconnect-red focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

        <div className="space-y-6">
          {filteredActivities.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Activities Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm
                  ? 'Try adjusting your search criteria.'
                  : 'No activities found. Activities will appear here automatically as you interact with this lead.'
                }
              </p>
            </Card>
          ) : (
            filteredActivities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const colorClasses = getActivityColor(activity.type);

              return (
                <div key={activity.id} className="relative flex items-start">
                  {/* Timeline Node */}
                  <div className={`absolute left-0 w-12 h-12 rounded-full border-4 border-white dark:border-gray-800 ${colorClasses} flex items-center justify-center z-10`}>
                    <Icon size={18} />
                  </div>

                  {/* Activity Card */}
                  <div className="ml-16 flex-1">
                    <Card className="p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {activity.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses}`}>
                              {activity.type.replace('_', ' ')}
                            </span>
                            {activity.isCompleted && (
                              <CheckCircle size={16} className="text-green-600" />
                            )}
                          </div>

                          {activity.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                              {activity.description}
                            </p>
                          )}

                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              {formatRelativeTime(activity.createdAt)}
                            </div>
                            {activity.duration && (
                              <div className="flex items-center">
                                <Play size={14} className="mr-1" />
                                {formatDuration(activity.duration)}
                              </div>
                            )}
                            {activity.user && (
                              <div className="flex items-center">
                                <User size={14} className="mr-1" />
                                {activity.user.firstName} {activity.user.lastName}
                              </div>
                            )}
                          </div>

                          {activity.outcome && (
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Outcome:</strong> {activity.outcome}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Load More */}
      {filteredActivities.length > 0 && (
        <div className="text-center">
          <Button variant="OUTLINE" onClick={() => { }}>
            Load More Activities
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
