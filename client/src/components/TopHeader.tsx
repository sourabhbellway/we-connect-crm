import React, { useState } from 'react';
import { Search, Bell, Plus, Share2, CheckSquare, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { UI_CONFIG } from '../constants';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
}

const TopHeader: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New lead assigned',
      description: 'John Doe has been assigned to you',
      time: '5 min ago',
      read: false,
      type: 'info',
    },
    {
      id: '2',
      title: 'Deal closed',
      description: 'ABC Corp deal worth $50,000 closed',
      time: '1 hour ago',
      read: false,
      type: 'success',
    },
    {
      id: '3',
      title: 'Follow-up reminder',
      description: 'Contact XYZ Ltd today',
      time: '2 hours ago',
      read: true,
      type: 'warning',
      icon: <Clock className="w-4 h-4" />,
    },
  ]);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };


  // Keyboard shortcut for search (Cmd/Ctrl + K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
      default:
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <>
      {/* Top Header Bar - Hidden on mobile since we have the mobile header in MainLayout */}
      <div className="hidden md:flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
        {/* Left: Search Button */}
        <div className="flex-1 max-w-xl">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg transition-colors duration-200 text-left group"
            aria-label="Open search"
          >
            <Search className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
              Search...
            </span>
            <div className="ml-auto flex items-center gap-1">
              <kbd className="hidden lg:inline-block px-2 py-1 text-xs font-mono bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          {/* Create New Button - Using WeConnect brand color */}
          <button
            onClick={() => navigate('/leads/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-weconnect-red hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md"
            aria-label="Create new lead"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden lg:inline">{t('header.new', 'New')}</span>
          </button>

          {/* Customers Area */}
          <button className="hidden xl:flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 text-sm text-gray-700 dark:text-gray-300">
            {t('header.customersArea', 'Customers area')}
          </button>

          {/* Settings */}
          <button
            onClick={() => navigate('/business-settings')}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Share */}
          <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400" title="Share">
            <Share2 className="w-5 h-5" />
          </button>

          {/* Tasks */}
          <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400 relative" title="Tasks">
            <CheckSquare className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
              2
            </span>
          </button>

          {/* Timer */}
          <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400" title="Timer">
            <Clock className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400 relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-weconnect-red text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notificationOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setNotificationOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-20 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t('header.notifications', 'Notifications')}
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                      >
                        {t('header.markAllRead', 'Mark all as read')}
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleMarkAsRead(notification.id)}
                          className={`w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left border-b border-gray-100 dark:border-slate-800 last:border-0 ${
                            !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                              {notification.icon || <Bell className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0 mt-1.5"></span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                {notification.description}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">{t('header.noNotifications', 'No notifications')}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                      <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200">
                        {t('header.viewAllNotifications', 'View all notifications')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default TopHeader;
