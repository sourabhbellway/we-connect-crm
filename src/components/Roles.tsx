import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { roleService } from "../services/roleService";
import { toast } from "react-toastify";
import {
  Shield,
  Plus,
  Search,
  Users,
  Key,
  Edit,
  Trash2,
  CheckCircle,
  Settings,
  RefreshCw,
  X,
  Filter,
  MoreHorizontal,
} from "lucide-react";

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
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<
    Record<string, Permission[]>
  >({});
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [expandedPermissions, setExpandedPermissions] = useState<
    Record<number, boolean>
  >({});
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissionIds: [] as number[],
  });
  const [updateRole, setUpdateRole] = useState({
    name: "",
    description: "",
    permissionIds: [] as number[],
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({});
  const [showOnlyActiveRoles, setShowOnlyActiveRoles] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [showOnlyActiveRoles]);

  const fetchRoles = async () => {
    try {
      const response = await roleService.getRoles(showOnlyActiveRoles);
      console.log(response);
      setRoles(response.data.roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await roleService.getPermissions();
      setPermissions(response.data.permissions);

      // Group permissions by module on the frontend
      const grouped = response.data.permissions.reduce(
        (acc: Record<string, Permission[]>, permission: Permission) => {
          if (!acc[permission.module]) {
            acc[permission.module] = [];
          }
          acc[permission.module].push(permission);
          return acc;
        },
        {}
      );

      setGroupedPermissions(grouped);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!newRole.name) newErrors.name = "Role name is required";
    if (newRole.permissionIds.length === 0) {
      newErrors.permissions = "At least one permission is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await roleService.createRole(newRole);
      setShowCreateModal(false);
      setNewRole({
        name: "",
        description: "",
        permissionIds: [],
      });
      setErrors({});
      fetchRoles();
      toast.success("Role created successfully!");
    } catch (error: any) {
      console.error("Error creating role:", error);
      const errorMessage = error.response?.data?.message || "An error occurred";
      const existingRole = error.response?.data?.existingRole;

      if (existingRole && !existingRole.isActive) {
        const message = `${errorMessage} Would you like to reactivate the existing role?`;
        setErrors({
          general: message,
          existingRole: existingRole as {
            id: number;
            name: string;
            isActive: boolean;
          },
        });
        toast.error(message);
      } else {
        setErrors({
          general: errorMessage,
        });
        toast.error(errorMessage);
      }
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) return;

    const newErrors: Record<string, string> = {};

    if (!updateRole.name) newErrors.name = "Role name is required";
    if (updateRole.permissionIds.length === 0) {
      newErrors.permissions = "At least one permission is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setUpdateErrors(newErrors);
      return;
    }

    try {
      await roleService.updateRole(selectedRole.id, updateRole);
      setShowUpdateModal(false);
      setSelectedRole(null);
      setUpdateRole({
        name: "",
        description: "",
        permissionIds: [],
        isActive: true,
      });
      setUpdateErrors({});
      fetchRoles();
      toast.success("Role updated successfully!");
    } catch (error: any) {
      console.error("Error updating role:", error);
      const errorMessage = error.response?.data?.message || "An error occurred";
      setUpdateErrors({
        general: errorMessage,
      });
      toast.error(errorMessage);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      await roleService.deleteRole(selectedRole.id);
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
    }
  };

  const handleReactivateRole = async (roleId: number) => {
    try {
      await roleService.updateRole(roleId, { isActive: true });
      setErrors({});
      fetchRoles();
      toast.success("Role reactivated successfully!");
    } catch (error: any) {
      console.error("Error reactivating role:", error);
      const errorMessage = error.response?.data?.message || "An error occurred";
      toast.error(errorMessage);
    }
  };

  const openUpdateModal = (role: Role) => {
    setSelectedRole(role);
    setUpdateRole({
      name: role.name,
      description: role.description || "",
      permissionIds: role.permissions.map((p) => p.id),
      isActive: role.isActive,
    });
    setShowUpdateModal(true);
  };

  const openDeleteModal = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.description &&
        role.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
    <div className="space-y-8 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("roles.title")} & {t("roles.permissions")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t("roles.roleManagement")}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button className="p-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all duration-200 shadow-sm">
              <RefreshCw className="h-5 w-5" />
            </button>
            <button className="p-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all duration-200 shadow-sm">
              <Search className="h-5 w-5" />
            </button>
          </div>
          {hasPermission("role.create") && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-3 bg-[#ef444e] text-white rounded-full hover:bg-[#f26971] transition-colors text-sm font-semibold"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t("Add Role")}
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t("common.filter")}
            </h3>
            <button className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <Filter className="h-4 w-4 mr-2" />
              {t("common.showFilters")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("common.search")}
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder={t("roles.searchRoles")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("common.status")}
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showOnlyActiveRoles}
                    onChange={(e) => setShowOnlyActiveRoles(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Show Only Active Roles
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoles.map((role) => (
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
                      onClick={() => openUpdateModal(role)}
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
        ))}
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create New Role
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateRole} className="p-6 space-y-6">
              {errors.general && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
                  <p className="mb-3">{errors.general}</p>
                  {errors.existingRole && (
                    <button
                      type="button"
                      onClick={() =>
                        handleReactivateRole((errors.existingRole as any).id)
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Reactivate Existing Role
                    </button>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter role name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter role description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Permissions
                </label>
                {errors.permissions && (
                  <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                    {errors.permissions}
                  </p>
                )}

                <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-white dark:bg-gray-700">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <Loader />
                    </div>
                  ) : Object.entries(groupedPermissions || {}).length === 0 ? (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No permissions available
                    </div>
                  ) : (
                    Object.entries(groupedPermissions || {}).map(
                      ([module, modulePermissions]) => (
                        <div key={module} className="mb-4 last:mb-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                            <Settings className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                            {module}
                          </h4>
                          <div className="space-y-2 ml-6">
                            {modulePermissions.map((permission) => (
                              <label
                                key={permission.id}
                                className="flex items-start p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={newRole.permissionIds.includes(
                                    permission.id
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewRole({
                                        ...newRole,
                                        permissionIds: [
                                          ...newRole.permissionIds,
                                          permission.id,
                                        ],
                                      });
                                    } else {
                                      setNewRole({
                                        ...newRole,
                                        permissionIds:
                                          newRole.permissionIds.filter(
                                            (id) => id !== permission.id
                                          ),
                                      });
                                    }
                                  }}
                                  className="mt-0.5 mr-3"
                                />
                                <div>
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {permission.name}
                                  </span>
                                  {permission.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {permission.description}
                                    </p>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setErrors({});
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Role Modal */}
      {showUpdateModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Update Role: {selectedRole.name}
                </h3>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateRole} className="p-6 space-y-6">
              {updateErrors.general && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
                  {updateErrors.general}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  value={updateRole.name}
                  onChange={(e) =>
                    setUpdateRole({ ...updateRole, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter role name"
                />
                {updateErrors.name && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    {updateErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={updateRole.description}
                  onChange={(e) =>
                    setUpdateRole({
                      ...updateRole,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter role description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={updateRole.isActive}
                    onChange={(e) =>
                      setUpdateRole({
                        ...updateRole,
                        isActive: e.target.checked,
                      })
                    }
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Active
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Permissions
                </label>
                {updateErrors.permissions && (
                  <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                    {updateErrors.permissions}
                  </p>
                )}

                <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-white dark:bg-gray-700">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <Loader />
                    </div>
                  ) : Object.entries(groupedPermissions || {}).length === 0 ? (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No permissions available
                    </div>
                  ) : (
                    Object.entries(groupedPermissions || {}).map(
                      ([module, modulePermissions]) => (
                        <div key={module} className="mb-4 last:mb-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                            <Settings className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                            {module}
                          </h4>
                          <div className="space-y-2 ml-6">
                            {modulePermissions.map((permission) => (
                              <label
                                key={permission.id}
                                className="flex items-start p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={updateRole.permissionIds.includes(
                                    permission.id
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setUpdateRole({
                                        ...updateRole,
                                        permissionIds: [
                                          ...updateRole.permissionIds,
                                          permission.id,
                                        ],
                                      });
                                    } else {
                                      setUpdateRole({
                                        ...updateRole,
                                        permissionIds:
                                          updateRole.permissionIds.filter(
                                            (id) => id !== permission.id
                                          ),
                                      });
                                    }
                                  }}
                                  className="mt-0.5 mr-3"
                                />
                                <div>
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {permission.name}
                                  </span>
                                  {permission.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {permission.description}
                                    </p>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setUpdateErrors({});
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
                >
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Role Modal */}
      {showDeleteModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Delete Role
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
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
                  <strong>"{selectedRole.name}"</strong>. This will permanently
                  remove the role and all its associated permissions.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRole}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg"
                >
                  Delete Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
