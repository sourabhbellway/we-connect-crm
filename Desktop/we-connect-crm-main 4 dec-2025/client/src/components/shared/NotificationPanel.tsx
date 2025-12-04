import React, { useState } from 'react';
import { Bell, CheckCircle, Clock, AlertTriangle, Info, X } from 'lucide-react';
import { Button, Card } from '../ui';
import { useAuth } from '../../contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'LEAD_ASSIGNED' | 'DEAL_CREATED' | 'DEAL_WON' | 'DEAL_LOST' | 'TASK_DUE' | 'FOLLOW_UP_DUE' | 'PAYMENT_RECEIVED' | 'QUOTE_ACCEPTED' | 'INVOICE_OVERDUE' | 'SYSTEM_ALERT' | 'REMINDER' | 'OTHER';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  createdAt: string;
}

interface NotificationPanelProps {
  entityType: 'lead' | 'deal' | 'contact' | 'company';
  entityId: string;
  notifications: Notification[];
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  entityType, 
  entityId, 
  notifications: initialNotifications 
}) => {
  const { hasPermission } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState('all');

  const getNotificationIcon = (type: string) => {
    const icons = {
      LEAD_ASSIGNED: Clock,
      DEAL_CREATED: CheckCircle,
      DEAL_WON: CheckCircle,
      DEAL_LOST: X,
      TASK_DUE: AlertTriangle,
      FOLLOW_UP_DUE: Clock,
      PAYMENT_RECEIVED: CheckCircle,
      QUOTE_ACCEPTED: CheckCircle,
      INVOICE_OVERDUE: AlertTriangle,
      SYSTEM_ALERT: AlertTriangle,
      REMINDER: Bell,
      OTHER: Info
    };
    return icons[type as keyof typeof icons] || Info;
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'URGENT') return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
    if (priority === 'HIGH') return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
    
    const colors = {
      DEAL_WON: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      PAYMENT_RECEIVED: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      QUOTE_ACCEPTED: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      DEAL_LOST: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
      INVOICE_OVERDUE: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
      TASK_DUE: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300',
      SYSTEM_ALERT: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
      OTHER: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300'
    };
    
    return colors[type as keyof typeof colors] || 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: 'text-gray-600',
      NORMAL: 'text-blue-600',
      HIGH: 'text-orange-600',
      URGENT: 'text-red-600'
    };
    return colors[priority as keyof typeof colors] || colors.NORMAL;
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true, readAt: new Date().toISOString() }
          : notif
      )
    );
  };

  const markAllAsRead = async () => {
    setNotifications(prev => 
      prev.map(notif => ({
        ...notif,
        isRead: true,
        readAt: new Date().toISOString()
      }))
    );
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'urgent') return notif.priority === 'URGENT';
    if (filter === 'high') return notif.priority === 'HIGH';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.priority === 'URGENT').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Notifications
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span>{notifications.length} total</span>
            {unreadCount > 0 && <span className="text-blue-600 font-medium">{unreadCount} unread</span>}
            {urgentCount > 0 && <span className="text-red-600 font-medium">{urgentCount} urgent</span>}
          </div>
        </div>
        
        {unreadCount > 0 && (
          <Button variant="OUTLINE" onClick={markAllAsRead}>
            Mark All Read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        {[
          { id: 'all', label: 'All', count: notifications.length },
          { id: 'unread', label: 'Unread', count: unreadCount },
          { id: 'urgent', label: 'Urgent', count: urgentCount },
          { id: 'high', label: 'High Priority', count: notifications.filter(n => n.priority === 'HIGH').length }
        ].map((filterOption) => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id)}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
              filter === filterOption.id
                ? 'bg-weconnect-red text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {filterOption.label}
            {filterOption.count > 0 && (
              <span className="ml-1 text-xs">({filterOption.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'No Notifications' : `No ${filter} notifications`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' 
                ? 'All notifications will appear here when you have activity.'
                : `You don't have any ${filter} notifications at the moment.`
              }
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const colorClasses = getNotificationColor(notification.type, notification.priority);
            
            return (
              <Card 
                key={notification.id} 
                className={`p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                  !notification.isRead ? 'border-l-4 border-l-weconnect-red bg-blue-50/30 dark:bg-blue-900/10' : ''
                }`}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses}`}>
                    <Icon size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`text-base font-semibold ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                            {notification.title}
                          </h3>
                          {notification.priority !== 'NORMAL' && (
                            <span className={`text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </span>
                          )}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-weconnect-red rounded-full"></div>
                          )}
                        </div>
                        
                        <p className={`text-sm mb-2 ${!notification.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          
                          {notification.actionUrl && (
                            <Button size="SM" variant="GHOST" className="text-xs">
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Load More */}
      {filteredNotifications.length > 0 && filteredNotifications.length >= 20 && (
        <div className="text-center">
          <Button variant="OUTLINE">
            Load More Notifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;