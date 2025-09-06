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
  MoreHorizontal,
  Search,
} from "lucide-react";
import SearchInput from "./SearchInput";
import { useDebouncedSearch } from "../hooks/useDebounce";

interface Role {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  permissions: Permission[];
  users?: any[];
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedPermissions, setExpandedPermissions] = useState<
    Record<number, boolean>
  >({});
  const [showOnlyActiveRoles, setShowOnlyActiveRoles] = useState(false);
  const [backendSearchSupported, setBackendSearchSupported] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Debounced search with 500ms delay for better UX
  const { searchValue, debouncedSearchValue, setSearch, isSearching } =
    useDebouncedSearch("", 500);

  useEffect(() => {
    fetchRoles();
  }, [debouncedSearchValue, showOnlyActiveRoles]);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      setSearchError(null);

      const response = await roleService.getRoles({
        search: debouncedSearchValue,
        showOnlyActive: showOnlyActiveRoles,
      });

      // Handle different response structures
      const rolesData = response.data?.roles ?? response.roles ?? response;
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setBackendSearchSupported(true);
    } catch (error: any) {
      console.error("Error fetching roles:", error);

      // If backend search fails, fall back to frontend search
      if (debouncedSearchValue) {
        setBackendSearchSupported(false);
        setSearchError(
          "Backend search not available, using frontend filtering"
        );

        // Fetch all roles for frontend filtering
        try {
          const response = await roleService.getRoles({
            showOnlyActive: showOnlyActiveRoles,
          });
          const rolesData = response.data?.roles ?? response.roles ?? response;
          setRoles(Array.isArray(rolesData) ? rolesData : []);
        } catch (fallbackError) {
          console.error("Fallback fetch also failed:", fallbackError);
          setSearchError("Failed to load roles");
        }
      } else {
        setSearchError("Failed to load roles");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

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

  // Filter roles based on search type
  const filteredRoles = backendSearchSupported
    ? roles // Backend search - roles already filtered by API
    : roles.filter(
        // Frontend search - filter locally
        (role) =>
          role.name
            .toLowerCase()
            .includes(debouncedSearchValue.toLowerCase()) ||
          (role.description &&
            role.description
              .toLowerCase()
              .includes(debouncedSearchValue.toLowerCase()))
      );

  const togglePermissions = (roleId: number) => {
    setExpandedPermissions((prev) => ({
      ...prev,
      [roleId]: !prev[roleId],
    }));
  };

  if (isLoading) {
    return (
      <Loader
        containerClassName="space-y-6 p-6"
        showTitle={true}
        titleWidthClassName="w-1/4"
        blocks={1}
        gridColsClassName="grid-cols-1"
        blockHeightClassName="h-64"
        ariaLabel="Loading roles"
      />
    );
  }

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
                  {searchError && (
                    <div className="flex items-center gap-1 text-xs text-orange-500">
                      <span>⚠️ {searchError}</span>
                    </div>
                  )}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("common.status")}
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowOnlyActiveRoles(!showOnlyActiveRoles)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                    showOnlyActiveRoles
                      ? "bg-gradient-to-r from-[#ef444e] to-[#f26971] border-[#ef444e] text-white shadow-lg"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-center">
                    <CheckCircle
                      className={`h-4 w-4 mr-2 ${
                        showOnlyActiveRoles ? "text-white" : "text-gray-400"
                      }`}
                    />
                    <span className="text-sm font-medium">
                      {showOnlyActiveRoles ? "Active Only" : "All Roles"}
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                      showOnlyActiveRoles
                        ? "bg-white border-white"
                        : "bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500"
                    }`}
                  >
                    {showOnlyActiveRoles && (
                      <div className="w-full h-full rounded-full bg-gradient-to-r from-[#ef444e] to-[#f26971] flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              </div>
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
      </div>

      {/* Search Results Info */}
      {debouncedSearchValue && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Search className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Search results for "{debouncedSearchValue}":{" "}
                {filteredRoles.length} of {roles.length} roles
              </span>
            </div>
            {isSearching && (
              <div className="flex items-center text-xs text-blue-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                Searching...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoles.length === 0 && debouncedSearchValue ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No roles found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              No roles match your search for "{debouncedSearchValue}". Try a
              different search term.
            </p>
          </div>
        ) : (
          filteredRoles.map((role) => (
            <div
              key={role.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden ${
                !role.isActive ? "opacity-75" : ""
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {role.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {role.permissions.length} permissions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {role.description}
                  </p>
                )}
              </div>

              {/* Card Content */}
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Users
                    </span>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4 mr-2" />
                      {role.users?.length || 0}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Permissions
                    </span>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Key className="h-4 w-4 mr-2" />
                      {role.permissions.length}
                    </div>
                  </div>
                </div>

                {/* Permission Tags */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {expandedPermissions[role.id]
                      ? role.permissions.map((permission) => (
                          <span
                            key={permission.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                          >
                            {permission.module}
                          </span>
                        ))
                      : role.permissions.slice(0, 3).map((permission) => (
                          <span
                            key={permission.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                          >
                            {permission.module}
                          </span>
                        ))}
                    {role.permissions.length > 3 && (
                      <button
                        onClick={() => togglePermissions(role.id)}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      >
                        {expandedPermissions[role.id]
                          ? "Show less"
                          : `+${role.permissions.length - 3} more`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
