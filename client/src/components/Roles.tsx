import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import ConfirmModal from "./ConfirmModal";
import { useAuth } from "../contexts/AuthContext";
import { useCounts } from "../contexts/CountsContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { roleService } from "../services/roleService";
import { toast } from "react-toastify";
import {
  Shield,
  Plus,
  Users,
  Key,
  Edit,
  Trash2,
  CheckCircle,
  Search,
  User,
  LayoutList,
  LayoutGrid,
} from "lucide-react";
import SearchInput from "./SearchInput";
import { useDebouncedSearch } from "../hooks/useDebounce";
import NoResults from "./NoResults";
import DropdownFilter from "./DropdownFilter";
import MetaBar from "./list/MetaBar";

interface Role {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  permissions: Permission[];
  users?: any[];
  // Optional counts coming from backend for better card display
  permissionsCount?: number;
  usersCount?: number;
}

interface Permission {
  id: number;
  name: string;
  key: string;
  module: string;
  description?: string;
}

const Roles: React.FC = () => {
  const { hasPermission } = useAuth();
  const { refreshRolesCount } = useCounts();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedPermissions, setExpandedPermissions] = useState<
    Record<number, boolean>
  >({});
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [backendSearchSupported, setBackendSearchSupported] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'name',
    'description',
    'status',
    'usersCount',
    'permissionsCount',
  ]);

  // Debounced search with 500ms delay for better UX
  const { searchValue, debouncedSearchValue, setSearch, isSearching } =
    useDebouncedSearch("", 500);

  useEffect(() => {
    fetchRoles();
  }, [debouncedSearchValue, statusFilter]);

  // Load column visibility preferences
  useEffect(() => {
    try {
      const stored = localStorage.getItem('roles_visible_columns');
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
      localStorage.setItem('roles_visible_columns', JSON.stringify(visibleColumns));
    } catch {
      // ignore
    }
  }, [visibleColumns]);

  const fetchRoles = async () => {
    try {
      if (!hasLoaded) {
        setIsLoading(true);
      } else {
        setIsFiltering(true);
      }
      setSearchError(null);

      const response = await roleService.getRoles({
        search: debouncedSearchValue,
        status: statusFilter || undefined,
      });

      // Handle different response structures
      const rolesData = response.data?.roles ?? response.roles ?? response;
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setBackendSearchSupported(true);
      setHasLoaded(true);
    } catch (error: any) {
      console.error("Error fetching roles:", error);

      const message = error?.response?.data?.message || "Failed to load roles";
      toast.error(message, { toastId: "roles_fetch_error" });

      // If backend search fails, fall back to frontend search
      if (debouncedSearchValue) {
        setBackendSearchSupported(false);
        setSearchError(
          "Backend search not available, using frontend filtering"
        );

        // Fetch all roles for frontend filtering
        try {
          const response = await roleService.getRoles({
            status: statusFilter || undefined,
          });
          const rolesData = response.data?.roles ?? response.roles ?? response;
          setRoles(Array.isArray(rolesData) ? rolesData : []);
        } catch (fallbackError) {
          console.error("Fallback fetch also failed:", fallbackError);
          setSearchError(message);
        }
      } else {
        setSearchError(message);
      }
    } finally {
      if (!hasLoaded) {
        setIsLoading(false);
      } else {
        setIsFiltering(false);
      }
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  // Empty state helpers similar to Users/Leads
  const isSearchActive = !!debouncedSearchValue;
  const isStatusFilterActive = !!statusFilter;
  const noResultsDescription = isSearchActive && isStatusFilterActive
    ? "No roles match your search and filters. Try adjusting your filters or search terms. You can also clear all filters to see all roles."
    : isSearchActive
    ? "No roles found for your search. Try adjusting your search terms. You can also clear all filters to see all roles."
    : isStatusFilterActive
    ? "No roles found for the selected filters. Try adjusting your filters or clear all filters to see all roles."
    : "No roles found.";

  const clearFilters = () => {
    setStatusFilter("");
    setSearch("");
  };

  const isColumnVisible = (id: string) => visibleColumns.includes(id);

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      setIsDeleting(true);
      await roleService.deleteRole(selectedRole.id);
      await refreshRolesCount();
      setShowDeleteModal(false);
      setSelectedRole(null);
      fetchRoles();
      toast.success("Role deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting role:", error);
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while deleting the role";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  // Filter roles based on search and status
  let filteredRoles = backendSearchSupported
    ? roles // Backend search - roles already filtered by API (search + status)
    : roles.filter(
        // Frontend search fallback - filter locally by search
        (role) =>
          role.name
            .toLowerCase()
            .includes(debouncedSearchValue.toLowerCase()) ||
          (role.description &&
            role.description
              .toLowerCase()
              .includes(debouncedSearchValue.toLowerCase()))
      );

  // Always apply status filter on the frontend as a safety net
  if (statusFilter === "active") {
    filteredRoles = filteredRoles.filter((role) => role.isActive);
  } else if (statusFilter === "inactive") {
    filteredRoles = filteredRoles.filter((role) => !role.isActive);
  }

  const togglePermissions = (roleId: number) => {
    setExpandedPermissions((prev) => ({
      ...prev,
      [roleId]: !prev[roleId],
    }));
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
                </div>
              </label>
              <SearchInput
                value={searchValue}
                onChange={handleSearch}
                placeholder={t("roles.searchRoles")}
              />
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <DropdownFilter
                label={t("common.status")}
                value={statusFilter}
                onChange={(value) => setStatusFilter((value as string) || "")}
                options={[
                  { value: "", label: "All Statuses" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </div>
          </div>

          {/* Add Role button - Full width on mobile, auto on desktop */}
          {hasPermission("role.create") && (
            <button
              onClick={() => navigate("/roles/new")}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-3 bg-[#ef444e] text-white rounded-full hover:bg-[#f26971] transition-colors text-sm font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("Add Role")}
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


      {/* Roles List/Card View */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading || isFiltering ? (
            <div className="col-span-full">
              <Loader
                containerClassName="p-0"
                showTitle={false}
                blocks={6}
                gridColsClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                blockHeightClassName="h-64"
                ariaLabel="Loading roles"
              />
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="col-span-full text-center py-20">
                <NoResults
                  title={searchError ? "Network or server error" : "No roles found"}
                  description={searchError || noResultsDescription}
                  icon={<User className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
                  showClearButton={!searchError && (isSearchActive || isStatusFilterActive)}
                onClear={!searchError ? clearFilters : undefined}
                isError={!!searchError}
              />
            </div>
          ) : (
            filteredRoles.map((role) => (
              <div
                key={role.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow transition-all duration-300 hover:shadow-md overflow-hidden ${
                  !role.isActive ? "opacity-75" : ""
                }`}
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-900 rounded-lg shadow-2xl">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                          {role.name}
                        </h3>
                        <p className="text-xs text-purple-800 dark:text-purple-400">
                          {role.name === "Admin"
                            ? "All permissions"
                            : `${role.permissionsCount ?? role.permissions.length} permissions`}
                        </p>

                      </div>
                    </div>

                    <div className="flex items-center gap-2 ">

                      {hasPermission("role.update") && (
                        <button
                          onClick={() =>
                            navigate(`/roles/${role.id}/edit`, {
                              state: { role },
                            })
                          }
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission("role.delete") && (
                        <button
                          onClick={() => openDeleteModal(role)}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {role.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {role.description}
                    </p>
                  )}
                </div>

                {/* Card Content */}
                <div className="">
                  <div className="space-y-1 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          role.isActive
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                        }`}
                      >
                        <CheckCircle
                          className={`h-3 w-3 mr-1 ${
                            !role.isActive ? "opacity-50" : ""
                          }`}
                        />
                        {role.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Users
                      </span>
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                        <Users className="h-3 w-3 mr-2" />
                        {role.usersCount ?? role.users?.length ?? 0}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Permissions
                      </span>
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                        <Key className="h-3 w-3 mr-2" />
                        {role.name === "Admin"
                          ? "All"
                          : (role.permissionsCount ?? role.permissions.length)}
                      </div>
                    </div>
                  </div>

                  {/* Permission Tags - module wise with show more/less */}
                  <div className="p-4  border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const modulesMap: Record<string, string[]> = {};
                        (role.permissions || []).forEach((p) => {
                          const key = p.module || "General";
                          if (!modulesMap[key]) modulesMap[key] = [];
                          modulesMap[key].push(p.name);
                        });
                        const modules = Object.keys(modulesMap);
                        const isExpanded = !!expandedPermissions[role.id];
                        const visibleModules = isExpanded ? modules : modules.slice(0, 3);
                        const remaining = modules.length - (isExpanded ? 3 : visibleModules.length);
                        return (
                          <>
                            {visibleModules.map((moduleKey) => (
                              <div key={moduleKey} className="flex items-center flex-wrap gap-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs  bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                                  {moduleKey}
                                </span>
                                {modulesMap[moduleKey].map((permName, idx) => (
                                  <span
                                    key={`${moduleKey}-${idx}`}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                                  >
                                    {permName}
                                  </span>
                                ))}
                              </div>
                            ))}
                            {(modules.length > 3 || isExpanded) && (
                              <button
                                onClick={() => togglePermissions(role.id)}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                              >
                                {isExpanded ? "Show less" : `+${remaining} more`}
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6">
            <div className="mb-4">
              <MetaBar
                currentPage={1}
                itemsPerPage={filteredRoles.length}
                totalItems={filteredRoles.length}
                onItemsPerPageChange={() => {}}
                columnConfig={{
                  columns: [
                    { id: 'name', label: 'Name' },
                    { id: 'description', label: 'Description' },
                    { id: 'status', label: 'Status' },
                    { id: 'usersCount', label: 'Users' },
                    { id: 'permissionsCount', label: 'Permissions' },
                  ],
                  visibleColumns,
                  onChange: setVisibleColumns,
                  minVisible: 1,
                }}
              />
            </div>
            <div className="overflow-hidden relative">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('name') ? 'hidden' : ''}`}>
                        Name
                      </th>
                      <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('description') ? 'hidden' : ''}`}>
                        Description
                      </th>
                      <th className={`px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('status') ? 'hidden' : ''}`}>
                        Status
                      </th>
                      <th className={`px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('usersCount') ? 'hidden' : ''}`}>
                        Users
                      </th>
                      <th className={`px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('permissionsCount') ? 'hidden' : ''}`}>
                        Permissions
                      </th>
                      <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  {isLoading || isFiltering ? (
                    <tbody>
                      <tr>
                        <td colSpan={visibleColumns.length + 1} className="px-6 py-12 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredRoles.length === 0 ? (
                      <tr>
                        <td colSpan={visibleColumns.length + 1} className="px-6 py-12 text-center">
                          <NoResults
                            title={searchError ? "Network or server error" : "No roles found"}
                            description={searchError || noResultsDescription}
                            icon={<User className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
                            showClearButton={!searchError && (isSearchActive || isStatusFilterActive)}
                            onClear={!searchError ? clearFilters : undefined}
                            isError={!!searchError}
                          />
                        </td>
                      </tr>
                    ) : (
                      filteredRoles.map((role) => (
                        <tr
                          key={role.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('name') ? 'hidden' : ''}`}>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-900 rounded-lg shadow-2xl">
                                <Shield className="h-4 w-4 text-white" />
                              </div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {role.name}
                              </div>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('description') ? 'hidden' : ''}`}>
                            <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                              {role.description || '-'}
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-center ${!isColumnVisible('status') ? 'hidden' : ''}`}>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                role.isActive
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                              }`}
                            >
                              <CheckCircle
                                className={`h-3 w-3 mr-1 ${
                                  !role.isActive ? "opacity-50" : ""
                                }`}
                              />
                              {role.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400 ${!isColumnVisible('usersCount') ? 'hidden' : ''}`}>
                            {role.usersCount ?? role.users?.length ?? 0}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400 ${!isColumnVisible('permissionsCount') ? 'hidden' : ''}`}>
                            {role.name === "Admin"
                              ? "All"
                              : (role.permissionsCount ?? role.permissions.length)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              {hasPermission("role.update") && (
                                <button
                                  onClick={() =>
                                    navigate(`/roles/${role.id}/edit`, {
                                      state: { role },
                                    })
                                  }
                                  className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                  title="Edit Role"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              )}
                              {hasPermission("role.delete") && (
                                <button
                                  onClick={() => openDeleteModal(role)}
                                  className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                  title="Delete Role"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  )}
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Role Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Role"
        description={
          <div className="space-y-3">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full mr-4">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Are you sure?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              You are about to delete the role{" "}
              <strong>"{selectedRole?.name}"</strong>. This will permanently
              remove the role and all its associated permissions.
            </p>
          </div>
        }
        confirmText="Delete Role"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={handleDeleteRole}
        onClose={() => {
          if (isDeleting) return;
          setShowDeleteModal(false);
        }}
      />
    </div>
  );
};

export default Roles;
