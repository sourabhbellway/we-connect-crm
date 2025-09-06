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
  RefreshCw,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import SearchInput from "./SearchInput";
import DropdownFilter from "./DropdownFilter";
import { toast } from "react-toastify";
import { useDebouncedSearch } from "../hooks/useDebounce";

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
  const [isFiltering, setIsFiltering] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);

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
    fetchRoles();
  }, [debouncedSearchValue, filters.status, filters.roleId, currentPage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[placeholder*="search"]'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Escape to clear filters
      if (e.key === "Escape") {
        if (filters.search || filters.status || filters.roleId) {
          clearFilters();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filters]);

  const fetchUsers = async () => {
    try {
      if (currentPage !== 1) {
        setIsFiltering(true);
      }

      const response = await userService.getUsers({
        search: debouncedSearchValue,
        status: filters.status,
        roleId: filters.roleId,
        page: currentPage,
        limit: pageSize,
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsFiltering(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await roleService.getRoles();
      setRoles(response.data.roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

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
  };

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
                <div className="flex items-center gap-2">
                  {t("common.search")}
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
      </div>

      {/* Users Table Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("users.allUsers")}{" "}
                {pagination && `(${pagination.totalUsers})`}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t("users.manageAndTrack")}
                {pagination && (
                  <span className="ml-2 text-gray-500">
                    • Showing {users.length} of {pagination.totalUsers} users
                    {pagination.totalPages > 1 &&
                      ` • Page ${pagination.currentPage} of ${pagination.totalPages}`}
                  </span>
                )}
                {(filters.search || filters.status || filters.roleId) && (
                  <span className="ml-2 text-blue-600 dark:text-blue-400">
                    • Filters active
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isFiltering && (
                <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  <span>Updating...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto relative">
          {isFiltering && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center z-10">
              <div className="flex items-center text-blue-600 dark:text-blue-400">
                <RefreshCw className="h-6 w-6 mr-2 animate-spin" />
                <span className="text-sm font-medium">Updating results...</span>
              </div>
            </div>
          )}
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("users.user")}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("users.role")}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("common.status")}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("users.lastLogin")}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("users.created")}
                </th>
                <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLogin ? (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </div>
                      ) : (
                        "Never"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {hasPermission("user.update") && (
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Edit user"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
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
                        <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <User className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {filters.search || filters.status || filters.roleId
                          ? "No users found"
                          : "No users yet"}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4 text-center max-w-md">
                        {filters.search || filters.status || filters.roleId
                          ? "Try adjusting your filters or search terms. You can also clear all filters to see all users."
                          : "Get started by creating your first user. Users can be assigned roles and permissions to access different parts of the system."}
                      </p>
                      {filters.search || filters.status || filters.roleId ? (
                        <button
                          onClick={clearFilters}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear all filters
                        </button>
                      ) : (
                        hasPermission("user.create") && (
                          <button
                            onClick={() => navigate("/users/new")}
                            className="inline-flex items-center px-4 py-2 bg-[#ef444e] text-white rounded-lg hover:bg-[#f26971] transition-colors"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create your first user
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing page {pagination.currentPage} of {pagination.totalPages}
                ({pagination.totalUsers} total users)
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="First page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <ChevronLeft className="h-4 w-4 -ml-3" />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (
                        pagination.currentPage >=
                        pagination.totalPages - 2
                      ) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }

                      if (pageNum < 1 || pageNum > pagination.totalPages)
                        return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            pageNum === pagination.currentPage
                              ? "bg-blue-600 text-white"
                              : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Last page"
                >
                  <ChevronRight className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4 -ml-3" />
                </button>
              </div>
            </div>
          </div>
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
