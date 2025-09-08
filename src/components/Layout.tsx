import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useCounts } from "../contexts/CountsContext";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";
import ConfirmModal from "./ConfirmModal";
import {
  Menu,
  X,
  User as UserIcon,
  ChevronDown,
  ChevronRight,
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
} from "lucide-react";
import SidebarDropdown from "./SidebarDropdown";
import WeConnectLogo from "../assets/WeConnect_Logo_C2C.svg";
import { API_BASE_URL } from "../config/config";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, logout, hasPermission } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { counts } = useCounts();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setUserMenuOpen(false);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

  const navigation: Array<{
    name: string;
    href: string;
    icon: any;
    permission: string;
    badge?: string;
    badgeColor?: string;
  }> = [
    {
      name: t("navigation.dashboard"),
      href: "/",
      icon: Home,
      permission: "dashboard.read",
    },
    {
      name: t("navigation.users"),
      href: "/users",
      icon: AudienceIcon,
      permission: "user.read",
      badge: counts.users.toString(),
      badgeColor: "bg-blue-500",
    },
    {
      name: t("navigation.leads"),
      href: "/leads",
      icon: FileText,
      permission: "lead.read",
      badge: counts.leads.toString(),
      badgeColor: "bg-green-500",
    },
    {
      name: t("navigation.roles"),
      href: "/roles",
      icon: Calendar,
      permission: "role.read",
      badge: counts.roles.toString(),
      badgeColor: "bg-orange-500",
    },
  ].filter((item) => hasPermission(item.permission));

  const settingsChildren = [
    {
      name: "Lead Settings",
      href: "/settings/leads",
      permission: "lead.read",
    },
    {
      name: "Industry Settings",
      href: "/settings/industries",
      // Only show to Admin via canShowChild using role check is not available here.
      // We rely on route protection for Admin, so no permission needed here.
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const renderNavItem = (item: any) => {
    const Icon = item.icon;
    const isItemActive = isActive(item.href);
    const isHovered = hoveredItem === item.name;

    return (
      <div key={item.name} className="relative">
        <div
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            sidebarCollapsed ? "justify-center px-3 py-2" : "justify-between"
          } ${
            isItemActive
              ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
          }`}
          onMouseEnter={() => setHoveredItem(item.name)}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => {
            navigate(item.href);
            setSidebarOpen(false);
          }}
        >
          <div
            className={`flex items-center ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <Icon
              size={20}
              className={`${sidebarCollapsed ? "mr-0 " : "mr-3"}`}
            />
            {!sidebarCollapsed && <span>{item.name}</span>}
          </div>
          {!sidebarCollapsed && (
            <div className="flex items-center">
              {item.badge && item.badge !== "0" && (
                <span
                  className={`ml-2 px-2 py-1 text-xs rounded-full text-white ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Hover tooltip for collapsed sidebar */}
        {sidebarCollapsed && isHovered && (
          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 dark:bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50">
            {item.name}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`flex h-screen ${
        isDark ? "dark" : ""
      } bg-gray-100 dark:bg-gray-900`}
    >
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-black dark:bg-opacity-75 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarCollapsed ? "w-16" : "w-64"
        } ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="lg:hidden p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              title={
                sidebarCollapsed ? t("sidebar.expand") : t("sidebar.collapse")
              }
            >
              <X className="h-5 w-5" />
            </button>
            {!sidebarCollapsed && (
              <div className="flex items-center ml-2">
                <img
                  src={WeConnectLogo}
                  alt="WeConnect"
                  className="h-16 w-auto"
                />
              </div>
            )}
          </div>
          {!sidebarCollapsed ? (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="hidden lg:block p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              title={t("sidebar.collapse")}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="hidden lg:block p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              title={t("sidebar.expand")}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="mt-8 px-4">
          <div className={`${sidebarCollapsed ? "space-y-1" : "space-y-2"}`}>
            {navigation.map(renderNavItem)}
            {/* Settings Dropdown */}
            <SidebarDropdown
              name={"Settings"}
              icon={Settings}
              isCollapsed={sidebarCollapsed}
              childrenItems={settingsChildren}
              canShowChild={(perm?: string) =>
                perm ? hasPermission(perm) : true
              }
            />
          </div>
        </nav>

        {/* Profile shortcut removed to avoid duplication; use top-right user menu */}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-end px-6 py-2">
            {/* Right side - Search, Notifications, Theme Toggle, and User Profile */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button
                className="relative p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={t("common.notifications")}
              >
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`relative p-2 rounded-lg transition-all duration-300 ${
                  isDark
                    ? "bg-gray-700 dark:bg-gray-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                } hover:scale-105`}
                title={t("common.theme")}
              >
                {isDark ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </button>

              {/* Language Selector */}
              <LanguageSelector />

              {/* User Profile */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {user?.profilePicture ? (
                    <img
                      src={`${
                        API_BASE_URL ||
                        "http://31.97.233.21:8081"
                      }/uploads/${user.profilePicture}`}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="h-8 w-8 bg-gradient-to-br from-[#EF444E] to-[#ff5a64] rounded-full flex items-center justify-center"
                      title={t("user.profile")}
                    >
                      <UserIcon className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="sr-only">{t("user.profile")}</span>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="py-2">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.fullName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user?.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {user?.roles?.[0]?.name || t("common.noRole")}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <UserIcon className="h-4 w-4 mr-3" />
                          {t("user.profile")}
                        </Link>
                        <button
                          onClick={handleLogoutClick}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          {t("common.logout")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                title={t("sidebar.menu")}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <div className="dark:bg-gray-900">{children}</div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title={t("common.logout")}
        description={t(
          "user.logoutConfirmation",
          "Are you sure you want to logout?"
        )}
        confirmText={t("common.logout")}
        cancelText={t("common.cancel")}
      />
    </div>
  );
};

export default Layout;
