import React from 'react';
import { Plus, Share2, CheckSquare, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import SimpleHeaderSearch from './SimpleHeaderSearch';
import { Button } from './ui';
import { NotificationBell } from './NotificationBell';
import { PERMISSIONS } from '../constants';

const TopHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const { t } = useTranslation();

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const el = document.querySelector<HTMLInputElement>('input[data-topsearch-input]');
        el?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Top Header Bar - Hidden on mobile since we have the mobile header in MainLayout */}
      <div className="hidden md:flex items-center justify-between px-6 h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm top-header">
        {/* Left: Search Button */}
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <SimpleHeaderSearch />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          {/* Create New Button - standardized using shared Button */}
          {hasPermission(PERMISSIONS.BUSINESS_SETTINGS.READ) && (
            <>
              {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
              <span className="sr-only">Create new lead</span>
              <Button
                onClick={() => navigate('/leads/new')}
                variant="PRIMARY"
                size="SM"
                icon={<Plus className="w-4 h-4" />}
                aria-label="Create new lead"
                className="shadow-sm"
              >
                <span className="hidden lg:inline">{t('header.new', 'New')}</span>
              </Button>
            </>
          )}

          {/* Customers Area */}
          {/* <button 
            className="hidden xl:flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 text-sm text-gray-700 dark:text-gray-300" 
            style={{ 
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              verticalAlign: 'middle'
            }}
          >
            {t('header.customersArea', 'Customers area')}
          </button> */}

          {/* Settings */}
          {hasPermission(PERMISSIONS.BUSINESS_SETTINGS.READ) && (
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
          )}

          {/* Share */}
          {/* <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400" title="Share">
            <Share2 className="w-5 h-5" />
          </button> */}

          {/* Tasks */}
          {/* <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400 relative" title="Tasks">
            <CheckSquare className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1.5 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-semibold leading-none">
              2
            </span>
          </button> */}

          {/* Timer */}
          {/* <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400" title="Timer">
            <Clock className="w-5 h-5" />
          </button> */}

          {/* Notifications */}
          <NotificationBell />
        </div>
      </div>

    </>
  );
};

export default TopHeader;
