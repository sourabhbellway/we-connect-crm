import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { roleService } from "../services/roleService";
import { toast } from "react-toastify";
import { Settings, Shield, CheckCircle } from "lucide-react";
import Loader from "./Loader";
import InputField, { TextAreaField } from "./InputField";

interface Permission {
  id: number;
  name: string;
  key: string;
  module: string;
  description?: string;
}

interface RoleFormData {
  name: string;
  description: string;
  permissionIds: number[];
  isActive?: boolean;
}

interface RoleFormProps {
  initial?: RoleFormData;
  onSubmit: (data: RoleFormData) => void;
  submitting: boolean;
}

const RoleForm: React.FC<RoleFormProps> = ({
  initial,
  onSubmit,
  submitting,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<RoleFormData>({
    name: "",
    description: "",
    permissionIds: [],
    isActive: true,
  });
  const [groupedPermissions, setGroupedPermissions] = useState<
    Record<string, Permission[]>
  >({});
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (initial) {
      setFormData(initial);
    }
  }, [initial]);

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
      toast.error("Failed to fetch permissions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = "Role name is required";
    if (formData.permissionIds.length === 0) {
      newErrors.permissions = "At least one permission is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        permissionIds: [...formData.permissionIds, permissionId],
      });
    } else {
      setFormData({
        ...formData,
        permissionIds: formData.permissionIds.filter(
          (id) => id !== permissionId
        ),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.general && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          {errors.general}
        </div>
      )}

      {/* Fields grid: 1 col (mobile), 3 cols (md), 4 cols (lg) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div>
          <InputField
            label="Role Name"
            leftIcon={<Shield className="h-4 w-4 text-gray-400" />}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          {errors.name && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.name}
            </p>
          )}
        </div>

        {initial && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Active Role
              </span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Active roles can be assigned to users
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      <TextAreaField
        label="Description (Optional)"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        rows={3}
      />

      {/* Permissions */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Settings className="h-4 w-4 mr-1" />
          Permissions *
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
                        className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissionIds.includes(
                            permission.id
                          )}
                          onChange={(e) =>
                            handlePermissionChange(
                              permission.id,
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {permission.name}
                          </span>
                          {permission.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
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
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Select one or more permissions to assign to this role
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {initial ? "Updating..." : "Creating..."}
            </>
          ) : initial ? (
            "Update Role"
          ) : (
            "Create Role"
          )}
        </button>
      </div>
    </form>
  );
};

export default RoleForm;
