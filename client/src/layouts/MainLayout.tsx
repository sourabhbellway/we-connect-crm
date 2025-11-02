import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCounts } from '../contexts/CountsContext';
import { useBusinessSettings } from '../contexts/BusinessSettingsContext';
import { useMenu } from '../contexts/MenuContext';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui';
import ConfirmModal from '../components/ConfirmModal';
import LanguageSelector from '../components/LanguageSelector';
import DraggableNavigation from '../components/DraggableNavigation';
import TopHeader from '../components/TopHeader';
import { APP_CONSTANTS, PERMISSIONS } from '../constants';
import {
  Menu,
  X,
  User as UserIcon,
  ChevronDown,
  ChevronLeft,
  Home,
  Users as AudienceIcon,
  FileText,
  Calendar,
  Bell,
  Sun,
  Moon,
  LogOut,
  Settings,
  Trash2,
  User,
  DollarSign,
  FileCheck,
  Receipt,
} from 'lucide-react';
import { NAV_EXTRA_ITEMS } from '../config/navigation';
import WeConnectLogo from '../assets/WeConnect_Logo_C2C.svg';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const { user, logout, hasPermission } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { counts } = useCounts();
  const { companySettings } = useBusinessSettings();
  const { resetMenuOrder } = useMenu();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Prevent background scroll when the mobile sidebar is open
  useEffect(() => {
    const root = document.documentElement;
    if (sidebarOpen) {
      root.classList.add('overflow-hidden');
    } else {
      root.classList.remove('overflow-hidden');
    }
    return () => root.classList.remove('overflow-hidden');
  }, [sidebarOpen]);

  // Navigation items configuration
  const baseItems = [
    {
      id: 'dashboard',
      name: t('navigation.dashboard') || 'Dashboard',
      href: '/',
      icon: Home,
      permission: PERMISSIONS.DASHBOARD.READ,
    },
    {
      id: 'leads',
      name: t('navigation.leads') || 'Leads',
      href: '/leads',
      icon: FileText,
      permission: PERMISSIONS.LEAD.READ,
      badge: counts.leads.toString(),
      badgeColor: 'bg-green-500',
    },
    {
      id: 'contacts',
      name: 'Contacts',
      href: '/contacts',
      icon: User,
      permission: PERMISSIONS.CONTACT.READ,
      badge: counts.contacts.toString(),
      badgeColor: 'bg-blue-500',
    },
    {
      id: 'deals',
      name: 'Deals',
      href: '/deals',
      icon: DollarSign,
      permission: PERMISSIONS.DEAL.READ,
      badge: counts.deals.toString(),
      badgeColor: 'bg-purple-500',
    },
    {
      id: 'quotations',
      name: 'Quotations',
      href: '/quotations',
      icon: FileCheck,
      permission: PERMISSIONS.DEAL.READ,
      badge: '',
      badgeColor: 'bg-indigo-500',
    },
    {
      id: 'invoices',
      name: 'Invoices',
      href: '/invoices',
      icon: Receipt,
      permission: PERMISSIONS.DEAL.READ,
      badge: '',
      badgeColor: 'bg-emerald-500',
    },
  ];

  const navigationItems = [
    ...baseItems,
    ...NAV_EXTRA_ITEMS,
    {
      id: 'business-settings',
      name: 'Business Settings',
      href: '/business-settings',
      icon: Settings,
      permission: PERMISSIONS.BUSINESS_SETTINGS.READ,
      badge: '',
      badgeColor: 'bg-purple-500',
    },
    {
      id: 'trash',
      name: 'Trash',
      href: '/trash',
      icon: Trash2,
      permission: 'deleted.read',
    },
  ].filter((item) => (item.permission ? hasPermission(item.permission) : true));


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setUserMenuOpen(false);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative md:translate-x-0 inset-y-0 left-0 z-50 ${
          sidebarCollapsed ? 'md:w-16' : 'w-72 md:w-64'
        } bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 shadow-lg transition-all duration-300`}
      >
        {/* Sidebar header */}
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-6 md:px-4'} py-5 md:py-4 border-b border-gray-200 dark:border-slate-800`}>
          {!sidebarCollapsed && (
            <Link to="/" className="flex items-center">
              {companySettings?.logo ? (
                <img 
                  src={companySettings.logo} 
                  alt={companySettings.name || APP_CONSTANTS.NAME} 
                  className="h-8 w-auto max-w-[120px] object-contain" 
                />
              ) : companySettings?.name ? (
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {companySettings.name}
                </span>
              ) : (
                <img src={WeConnectLogo} alt={APP_CONSTANTS.NAME} className="h-8 w-auto" />
              )}
            </Link>
          )}
          {sidebarCollapsed && (
            <Link to="/" className="flex items-center justify-center">
              {companySettings?.logo ? (
                <img 
                  src={companySettings.logo} 
                  alt={companySettings.name || APP_CONSTANTS.NAME} 
                  className="h-7 w-7 object-contain rounded" 
                />
              ) : (
                <div className="w-7 h-7 bg-weconnect-red rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {companySettings?.name?.charAt(0) || 'W'}
                  </span>
                </div>
              )}
            </Link>
          )}
          <div className="flex items-center gap-1">
            <button
              className="hidden md:flex items-center justify-center p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <ChevronLeft
                size={16}
                className={`transform transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`}
              />
            </button>
            <button
              className="md:hidden p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 md:px-3 py-5 md:py-4 space-y-2 md:space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <DraggableNavigation
            navigationItems={navigationItems}
            activeHref={location.pathname}
            sidebarCollapsed={sidebarCollapsed}
            hoveredItem={hoveredItem}
            onHover={setHoveredItem}
            onNavigate={navigate}
            setSidebarOpen={setSidebarOpen}
          />
          
          {/* Menu reorder info and reset */}
          {!sidebarCollapsed && (
            <div className="mt-4 px-3 py-3 border-t border-gray-200 dark:border-slate-800 bg-blue-50 dark:bg-slate-800/50 rounded-lg mx-1">
              <div className="text-xs text-gray-600 dark:text-gray-300 mb-1.5">
                {t('menu.dragToReorder', 'Drag menu items to reorder')}
              </div>
              <button
                onClick={resetMenuOrder}
                className="text-xs text-weconnect-red dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors font-medium"
                title={t('menu.resetOrder', 'Reset menu order')}
              >
                {t('menu.resetToDefault', 'Reset to default')}
              </button>
            </div>
          )}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 dark:border-slate-800 p-4 md:p-3">
          <div className="relative" ref={userMenuRef}>
            <button
              className={`w-full flex items-center ${
                sidebarCollapsed ? 'justify-center' : 'justify-between'
              } px-2 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors`}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className={`flex items-center gap-3 md:gap-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                <div className="relative">
                  <div className="w-10 h-10 md:w-8 md:h-8 bg-weconnect-red rounded-lg flex items-center justify-center">
                    <UserIcon size={18} className="md:w-4 md:h-4 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-white dark:border-slate-900"></div>
                </div>
                {!sidebarCollapsed && (
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-base md:text-sm font-medium text-gray-900 dark:text-white truncate">{user?.fullName || user?.firstName || 'User'}</p>
                    <p className="text-sm md:text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <ChevronDown size={14} className={`transition-transform duration-200 flex-shrink-0 ${userMenuOpen ? 'rotate-180' : ''}`} />
              )}
            </button>

            {/* User dropdown menu */}
            {userMenuOpen && !sidebarCollapsed && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
                <div className="py-1">
                  <button
                    onClick={toggleTheme}
                    className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 transition-colors text-center"
                  >
                    {isDark ? <Sun size={14} /> : <Moon size={14} />}
                    <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                  <div className="px-3 py-1.5 flex justify-center">
                    <LanguageSelector />
                  </div>
                  <div className="border-t border-gray-200 dark:border-slate-700 my-1" />
                  <button
                    onClick={handleLogoutClick}
                    className="w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-2 transition-colors text-center"
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header with Search and Notifications - Desktop only */}
        <TopHeader />
        
        {/* Mobile Top bar */}
        <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-4 flex items-center justify-between md:hidden sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu size={18} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {companySettings?.name || APP_CONSTANTS.NAME}
          </h1>
          <div className="w-10" /> {/* Spacer for center alignment */}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-950">
          {location.pathname === '/' ? (
            children
          ) : (
            <div className="container-grid py-6">
              {children}
            </div>
          )}
        </main>
      </div>

      {/* Logout confirmation modal */}
      <ConfirmModal
        open={showLogoutModal}
        title="Confirm Logout"
        description="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        loading={false}
        onConfirm={confirmLogout}
        onClose={() => setShowLogoutModal(false)}
      />
    </div>
  );
};

export default MainLayout;