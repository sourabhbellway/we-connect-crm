import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
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
  PieChart,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  Settings,
} from "lucide-react";
import SidebarDropdown from "./SidebarDropdown";
import WeConnectLogo from "../assets/WeConnect_Logo_C2C.svg";

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

  const navigation = [
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
    },
    {
      name: t("navigation.leads"),
      href: "/leads",
      icon: FileText,
      permission: "lead.read",
      badge: "8",
      badgeColor: "bg-green-500",
    },
    {
      name: t("navigation.roles"),
      href: "/roles",
      icon: Calendar,
      permission: "role.read",
      badge: "3",
      badgeColor: "bg-orange-500",
    },
    {
      name: t("navigation.income"),
      href: "/income",
      icon: PieChart,
      permission: "income.read",
    },
  ].filter((item) => hasPermission(item.permission));

  const settingsChildren = [
    {
      name: "Lead Settings",
      href: "/settings/leads",
      permission: "lead.read",
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
              // strokeWidth={2}
              className={`${sidebarCollapsed ? "mr-0 " : "mr-3"}`}
            />
            {!sidebarCollapsed && <span>{item.name}</span>}
          </div>
          {!sidebarCollapsed && (
            <div className="flex items-center">
              {item.badge && (
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
              canShowChild={(perm?: string) => (perm ? hasPermission(perm) : true)}
            />
          </div>
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-100 dark:border-gray-700">
          {sidebarCollapsed ? (
            /* Collapsed sidebar - only user icon */
            <div className="flex justify-center">
              <Link
                to="/profile"
                className="h-10 w-10 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                title={t("user.profile")}
              >
                {user?.profilePicture ? (
                  <img
                    src={`${
                      import.meta.env.VITE_API_BASE_URL ||
                      "http://31.97.233.21:8081"
                    }/uploads/${user.profilePicture}`}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                )}
              </Link>
            </div>
          ) : (
            /* Expanded sidebar - full user info */
            <Link
              to="/profile"
              className="flex items-center space-x-1 bg-zinc-100 dark:bg-gray-700 py-2 px-2 rounded-full hover:bg-zinc-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              {/* User Avatar */}
              <div className="flex-shrink-0">
                {user?.profilePicture ? (
                  <img
                    src={`${
                      import.meta.env.VITE_API_BASE_URL ||
                      "http://31.97.233.21:8081"
                    }/uploads/${user.profilePicture}`}
                    alt="Profile"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="h-12 w-12 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center"
                    title={t("user.profile")}
                  >
                    <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                )}
              </div>

              {/* User Info Bubble */}
              <div className="flex-1 min-w-0">
                <div className="bg-[#e1ff01] dark:bg-yellow-400 rounded-full px-3 py-2 relative">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-900 truncate">
                        {t("user.greeting", { name: user?.fullName || "User" })}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-700 truncate">
                        {user?.roles?.[0]?.name || t("common.noRole")} •{" "}
                        {t("common.active")}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleLogoutClick();
                      }}
                      className="ml-2 p-1 rounded-md text-gray-600 dark:text-gray-700 hover:text-gray-800 dark:hover:text-gray-900 hover:bg-[#e1ff01] dark:hover:bg-yellow-300 transition-colors"
                      title={t("common.logout")}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-2">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search"
                className="w-full rounded-lg border-gray-200 dark:border-gray-700 p-2"
              />
              <button
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={t("common.search")}
              >
                <Search className="h-5 w-5" />
              </button>
            </div>

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
                        import.meta.env.VITE_API_BASE_URL ||
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
