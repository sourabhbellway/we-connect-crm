import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCounts } from "../contexts/CountsContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import { roleService } from "../services/roleService";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  User,
  Search,
  LayoutList,
  LayoutGrid,
} from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import SearchInput from "./SearchInput";
import DropdownFilter from "./DropdownFilter";
import { toast } from "react-toastify";
import { useDebouncedSearch } from "../hooks/useDebounce";
import NoResults from "./NoResults";
import TableLoader from "./TableLoader";
import Pagination from "./Pagination";
import MetaBar from "./list/MetaBar";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  roles: any[];
  manager?: { id: number; fullName: string; email: string };
  teamSize?: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const Users: React.FC = () => {
  const { hasPermission } = useAuth();
  const { refreshUsersCount } = useCounts();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'user',
    'role',
    'status',
    'lastLogin',
    'createdAt',
  ]);

  // New Tab State
  const [activeTab, setActiveTab] = useState<'users' | 'teams'>('users');

  // Filter states
  const [filters, setFilters] = useState({
    status: "",
    roleId: "",
    search: "",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  // Debounced search with 500ms delay for better UX
  const { searchValue, debouncedSearchValue, setSearch, isSearching } =
    useDebouncedSearch("", 500);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
    // fetchRoles();
  }, [debouncedSearchValue, filters.status, filters.roleId, currentPage, activeTab]); // Added activeTab to dependencies

  // Load column visibility preferences
  useEffect(() => {
    try {
      const stored = localStorage.getItem('users_visible_columns');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every((c) => typeof c === 'string')) {
          setVisibleColumns(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('users_visible_columns', JSON.stringify(visibleColumns));
    } catch {
      // ignore
    }
  }, [visibleColumns]);

  // Keyboard shortcuts (do not override Ctrl/Cmd+K to allow browser omnibox)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to clear filters
      if (e.key === "Escape") {
        if (debouncedSearchValue || filters.status || filters.roleId) {
          clearFilters();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filters, debouncedSearchValue]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const api = await userService.getUsers({
        search: debouncedSearchValue,
        status: filters.status,
        roleId: filters.roleId,
        page: currentPage,
        limit: pageSize,
        // Potentially add a 'view' parameter to the API if backend supports different data for 'teams' tab
        // view: activeTab,
      });

      // Supported API shapes:
      // 1) { success, data: { users: User[], pagination: {...} } }
      // 2) { success, data: User[] }
      // 3) { users: User[], pagination? }
      const list: User[] = (api?.data?.users as User[])
        ?? (Array.isArray(api?.data) ? (api.data as User[]) : undefined)
        ?? (api?.users as User[])
        ?? ([] as User[]);

      setUsers(list || []);

      // Prefer server pagination when provided
      const apiPagination = api?.data?.pagination || api?.pagination;
      if (apiPagination) {
        setPagination({
          currentPage: apiPagination.currentPage ?? currentPage,
          totalPages: apiPagination.totalPages ?? 1,
          totalUsers: apiPagination.totalItems ?? list.length ?? 0,
          hasNextPage: (apiPagination.currentPage ?? 1) < (apiPagination.totalPages ?? 1),
          hasPrevPage: (apiPagination.currentPage ?? 1) > 1,
        });
      } else {
        // Fallback: single-page
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalUsers: list.length,
          hasNextPage: false,
          hasPrevPage: false,
        });
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      const errorMessage = error?.response?.data?.message || "Failed to fetch users";
      setError(errorMessage);
      toast.error(errorMessage, { toastId: "users_fetch_error" });
    } finally {
      setIsLoading(false);
    }
  };

  // const fetchRoles = async () => {
  //   try {
  //     const response = await roleService.getRoles({ status: "active" });
  //     // API shape: { success, data: { roles, totalCount } } or legacy { items }
  //     const items = response?.data?.roles || response?.data?.items || response?.roles || response?.items || [];
  //     setRoles(items);
  //   } catch (error) {
  //     console.error("Error fetching roles:", error);
  //   }
  // };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the table
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditUser = (user: User) => {
    navigate(`/users/${user.id}/edit`, { state: { user } });
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const toggleUserStatus = async (u: User) => {
    try {
      await userService.updateUser(u.id, { isActive: !u.isActive });
      toast.success(`User ${!u.isActive ? 'activated' : 'deactivated'} successfully`);
      await refreshUsersCount();
      fetchUsers();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to update user status';
      toast.error(msg);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);

    try {
      await userService.deleteUser(userToDelete.id);
      await refreshUsersCount();
      setShowDeleteModal(false);
      setUserToDelete(null);
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      let errorMessage = "An error occurred";

      if (error.response?.status === 429) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      roleId: "",
    });
    setCurrentPage(1);
    setSearch("");
  };

  const isSearchActive = !!debouncedSearchValue;
  const isStatusActive = !!filters.status;
  const isRoleActive = !!filters.roleId;
  const hasActiveFilters = isSearchActive || isStatusActive || isRoleActive;

  const isColumnVisible = (id: string) => visibleColumns.includes(id);
  const noResultsDescription = isSearchActive && (isStatusActive || isRoleActive)
    ? "No users match your search and filters. Try adjusting your filters or search terms. You can also clear all filters to see all users."
    : isSearchActive
      ? "No users found for your search. Try adjusting your search terms. You can also clear all filters to see all users."
      : (isStatusActive || isRoleActive)
        ? "No users found for the selected filters. Try adjusting your filters or clear all filters to see all users."
        : undefined;

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="space-y-4">
        {/* Mobile-first responsive layout */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          {/* Filters - Stack on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <div className="flex items-center gap-2">{t("common.search")}
                  {isSearching && (
                    <div className="flex items-center gap-1 text-xs text-blue-500">
                      <Search className="h-3 w-3 animate-pulse" />
                      <span>Searching...</span>
                    </div>
                  )}
                </div>
              </label>
              <SearchInput
                value={searchValue}
                onChange={handleSearch}
                placeholder={t("users.searchUsers")}
              />
            </div>

            {/* Status */}
            <div className="w-full sm:w-48">
              <DropdownFilter
                label="Status"
                value={filters.status}
                onChange={(value) =>
                  handleFilterChange("status", value as string)
                }
                options={[
                  { value: "", label: "All Statuses" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </div>

            {/* Role */}
            <div className="w-full sm:w-48">
              <DropdownFilter
                label="Role"
                value={filters.roleId}
                onChange={(value) =>
                  handleFilterChange("roleId", value as string)
                }
                options={[
                  { value: "", label: "All Roles" },
                  ...roles.map((role) => ({
                    value: role.id.toString(),
                    label: role.name,
                  })),
                ]}
              />
            </div>
          </div>

          {/* Add User button - Full width on mobile, auto on desktop */}
          {hasPermission("user.create") && (
            <button
              onClick={() => navigate("/users/new")}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-3 bg-[#ef444e] text-white rounded-full hover:bg-[#f26971] transition-colors text-sm font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("users.addUser")}
            </button>
          )}
        </div>

        {/* View toggle - Right aligned */}
        <div className="hidden sm:flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 ml-auto">
          <button
            className={`flex items-center justify-center p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            className={`flex items-center justify-center p-2 rounded-md transition-colors ${viewMode === 'card' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            onClick={() => setViewMode('card')}
            title="Card view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'users'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
        >
          {t("users.allUsers")}
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'teams'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
        >
          Teams
        </button>
      </div>

      {/* Users Table Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden  transition-all duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {activeTab === 'users' ? t("users.allUsers") : "All Teams"} {pagination && `(${pagination.totalUsers})`}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {activeTab === 'users' ? t("users.manageAndTrack") : "Manage and track user teams."}
                {pagination && (
                  <span className="ml-2 text-gray-500">
                    • Showing {users.length} of {pagination.totalUsers} users
                    {pagination.totalPages > 1 &&
                      ` • Page ${pagination.currentPage} of ${pagination.totalPages}`}
                  </span>
                )}
                {(debouncedSearchValue || filters.status || filters.roleId) && (
                  <span className="ml-2 text-blue-600 dark:text-blue-400">
                    • Filters active
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-2"></div>
          </div>
        </div>

        {activeTab === 'users' ? (
          <>
            <div className="mb-4">
              <MetaBar
                currentPage={pagination?.currentPage || 1}
                itemsPerPage={pageSize}
                totalItems={pagination?.totalUsers || users.length}
                onItemsPerPageChange={(n) => {
                  // This would need to be implemented if we want to change page size
                }}
                columnConfig={{
                  columns: [
                    { id: 'user', label: 'User' },
                    { id: 'role', label: 'Role' },
                    { id: 'status', label: 'Status' },
                    { id: 'lastLogin', label: 'Last Login' },
                    { id: 'createdAt', label: 'Created' },
                  ],
                  visibleColumns,
                  onChange: setVisibleColumns,
                  minVisible: 1,
                }}
              />
            </div>

            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
                {isLoading ? (
                  <div className="col-span-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : error ? (
                  <div className="col-span-full text-center py-20">
                    <NoResults
                      title="Network or server error"
                      description={error}
                      icon={<User className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
                      isError
                    />
                  </div>
                ) : users.length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <NoResults
                      icon={<User className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
                      description={noResultsDescription}
                      showClearButton={hasActiveFilters}
                      onClear={clearFilters}
                    />
                  </div>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      style={{ minHeight: '280px' }}
                    >
                      {/* Card Header */}
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-[#EF444E] to-[#ff5a64] rounded-lg shadow-2xl">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                {user.fullName}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${user.isActive
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                            }`}>
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 flex-1">
                        <div className="space-y-2">
                          {user.roles.length > 0 && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              <div className="flex flex-wrap gap-1">
                                {user.roles.map((role) => (
                                  <span
                                    key={role.id}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                                  >
                                    <Shield className="h-3 w-3 mr-1" />
                                    {role.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {user.lastLogin && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 flex-shrink-0" />
                              <span>Last login: {new Date(user.lastLogin).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span>Created: {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="px-4 pb-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {hasPermission("user.update") && (
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Edit User"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {hasPermission("user.update") && (
                              <button
                                onClick={() => toggleUserStatus(user)}
                                className={`p-1.5 rounded transition-colors ${user.isActive
                                  ? "text-amber-600 hover:text-amber-900 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                  : "text-green-600 hover:text-green-900 hover:bg-green-50 dark:hover:bg-green-900/20"
                                  }`}
                                title={user.isActive ? "Deactivate user" : "Activate user"}
                              >
                                {user.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              </button>
                            )}
                            {hasPermission("user.delete") && (
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="overflow-x-auto relative">
                <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('user') ? 'hidden' : ''}`}>
                        {t("users.user")}
                      </th>
                      <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('role') ? 'hidden' : ''}`}>
                        {t("users.role")}
                      </th>
                      <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('status') ? 'hidden' : ''}`}>
                        {t("common.status")}
                      </th>
                      <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('lastLogin') ? 'hidden' : ''}`}>
                        {t("users.lastLogin")}
                      </th>
                      <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('createdAt') ? 'hidden' : ''}`}>
                        {t("users.created")}
                      </th>
                      <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t("common.actions")}
                      </th>
                    </tr>
                  </thead>
                  {isLoading ? (
                    <TableLoader rows={8} columns={6} />
                  ) : (
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {error ? (
                        <tr>
                          <td colSpan={visibleColumns.length + 1} className="px-6 py-12 text-center">
                            <NoResults
                              title="Network or server error"
                              description={error}
                              icon={<User className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
                              isError
                            />
                          </td>
                        </tr>
                      ) : users.length > 0 ? (
                        users.map((user) => (
                          <tr
                            key={user.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('user') ? 'hidden' : ''}`}>
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#EF444E] to-[#ff5a64] flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">
                                      {user.firstName[0]}
                                      {user.lastName[0]}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.fullName}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('role') ? 'hidden' : ''}`}>
                              <div className="flex flex-wrap gap-1">
                                {user.roles.length > 0 ? (
                                  user.roles.map((role) => (
                                    <span
                                      key={role.id}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                                    >
                                      <Shield className="h-3 w-3 mr-1" />
                                      {role.name}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {t("users.noRoleAssigned")}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('status') ? 'hidden' : ''}`}>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.isActive
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                                  }`}
                              >
                                {user.isActive ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <XCircle className="h-3 w-3 mr-1" />
                                )}
                                {user.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 ${!isColumnVisible('lastLogin') ? 'hidden' : ''}`}>
                              {user.lastLogin ? (
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(user.lastLogin).toLocaleDateString()}
                                </div>
                              ) : (
                                "Never"
                              )}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 ${!isColumnVisible('createdAt') ? 'hidden' : ''}`}>
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(user.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                {hasPermission("user.update") && (
                                  <>
                                    <button
                                      onClick={() => handleEditUser(user)}
                                      className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                      title="Edit user"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => toggleUserStatus(user)}
                                      className={[
                                        "p-1 rounded transition-colors",
                                        user.isActive
                                          ? "text-amber-600 hover:text-amber-900 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                          : "text-green-600 hover:text-green-900 hover:bg-green-50 dark:hover:bg-green-900/20",
                                      ].join(" ")}
                                      title={user.isActive ? "Deactivate user" : "Activate user"}
                                    >
                                      {user.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                    </button>
                                  </>
                                )}
                                {hasPermission("user.delete") && (
                                  <button
                                    onClick={() => handleDeleteUser(user)}
                                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title="Delete user"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={visibleColumns.length + 1} className="px-6 py-12 text-center">
                            <NoResults
                              icon={<User className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
                              description={noResultsDescription}
                              showClearButton={hasActiveFilters}
                              onClear={clearFilters}
                            />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  )}
                </table>
              </div>
            )}
          </>
        ) : (
          /* Teams View */
          <div className="overflow-x-auto relative">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User (Team Lead)</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reporting Authority</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Team Size</th>
                  <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              {isLoading ? (
                <TableLoader rows={8} columns={4} />
              ) : error ? (
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <NoResults
                        title="Network or server error"
                        description={error}
                        icon={<User className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
                        isError
                      />
                    </td>
                  </tr>
                </tbody>
              ) : users.length === 0 ? (
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <NoResults
                        icon={<User className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
                        description="No teams found. Try adjusting your filters or clear all filters to see all teams."
                        showClearButton={hasActiveFilters}
                        onClear={clearFilters}
                      />
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">{user.firstName[0]}</div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.manager ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{user.manager.fullName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No Manager</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          {user.teamSize || 0} Members
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-end">
                        <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" title="Edit user"><Edit className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalUsers}
            onPageChange={handlePageChange}
            itemsPerPage={50}
          />
        )}
      </div>

      {/* Edit User Modal - Removed, using separate page now */}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal && !!userToDelete}
        title="Delete User"
        description={
          userToDelete ? (
            <div className="mb-2">
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0 h-12 w-12">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#EF444E] to-[#ff5a64] flex items-center justify-center">
                    <span className="text-white font-medium text-lg">
                      {userToDelete.firstName[0]}
                      {userToDelete.lastName[0]}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {userToDelete.fullName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {userToDelete.email}
                  </div>
                </div>
              </div>
              <p>
                Are you sure you want to delete this user? This action will
                deactivate their account and cannot be undone.
              </p>
            </div>
          ) : null
        }
        confirmText="Delete User"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={confirmDeleteUser}
        onClose={() => {
          if (isDeleting) return;
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
      />
    </div>
  );
};

export default Users;
