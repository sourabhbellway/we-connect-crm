import React, { useEffect, useState } from "react";
import InputField from "./InputField";
import { UserPayload, UserEditPayload } from "./UserCreate";
import { roleService } from "../services/roleService";
import { User, Mail, Lock, Shield, CheckCircle } from "lucide-react";

export interface UserFormProps<T = UserPayload> {
  initial?: T;
  onSubmit: (data: T) => Promise<void> | void;
  submitting?: boolean;
  isEdit?: boolean;
}

const defaultState: UserPayload = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  roleIds: [],
  isActive: true,
};

interface Role {
  id: number;
  name: string;
  description?: string;
}

const UserForm = <T extends UserPayload | UserEditPayload>({
  initial,
  onSubmit,
  submitting,
  isEdit = false,
}: UserFormProps<T>) => {
  const [form, setForm] = useState<T>({
    ...defaultState,
    ...(initial || {}),
  } as T);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    if (initial) setForm({ ...defaultState, ...initial } as T);
  }, [initial]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await roleService.getRoles();
        setRoles(response.data.roles || []);
      } catch (e) {
        console.error("Failed to load roles:", e);
      }
    };
    loadRoles();
  }, []);

  const handleChange = (key: keyof T, value: any) => {
    setForm((s) => ({ ...s, [key]: value }));
  };

  const toggleRole = (roleId: number) => {
    setForm((s) => {
      const current = s.roleIds || [];
      const exists = current.includes(roleId);
      return {
        ...s,
        roleIds: exists
          ? current.filter((id) => id !== roleId)
          : [...current, roleId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Fields grid: 1 col (mobile), 3 cols (md), 4 cols (lg) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div>
          <InputField
            label="First Name"
            leftIcon={<User className="h-4 w-4 text-gray-400" />}
            value={form.firstName || ""}
            onChange={(e) =>
              handleChange("firstName", (e.target as HTMLInputElement).value)
            }
            required
          />
        </div>
        <div>
          <InputField
            label="Last Name"
            leftIcon={<User className="h-4 w-4 text-gray-400" />}
            value={form.lastName || ""}
            onChange={(e) =>
              handleChange("lastName", (e.target as HTMLInputElement).value)
            }
            required
          />
        </div>
        <div>
          <InputField
            label="Email"
            leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
            type="email"
            value={form.email || ""}
            onChange={(e) =>
              handleChange("email", (e.target as HTMLInputElement).value)
            }
            required
          />
        </div>
        <div>
          <InputField
            label={isEdit ? "New Password (optional)" : "Password"}
            leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
            type="password"
            value={form.password || ""}
            onChange={(e) =>
              handleChange("password", (e.target as HTMLInputElement).value)
            }
            required={!isEdit}
            minLength={6}
            placeholder={isEdit ? "Leave empty to keep current password" : ""}
          />
        </div>
      </div>

      {/* Password hint */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {isEdit
          ? "Leave password empty to keep the current password, or enter a new password (minimum 6 characters)"
          : "Password must be at least 6 characters long"}
      </div>

      {/* Status */}
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={form.isActive ?? true}
            onChange={(e) => handleChange("isActive", e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            Active User
          </span>
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Active users can log in and access the system
        </p>
      </div>

      {/* Roles */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Shield className="h-4 w-4 mr-1" />
          Roles
        </label>
        <div className="space-y-2">
          {roles.length > 0 ? (
            roles.map((role) => {
              const selected = (form.roleIds || []).includes(role.id);
              return (
                <label
                  key={role.id}
                  className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleRole(role.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {role.name}
                    </span>
                    {role.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {role.description}
                      </p>
                    )}
                  </div>
                </label>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No roles available. Please create roles first.
            </p>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Select one or more roles to assign to this user
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
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : isEdit ? (
            "Update User"
          ) : (
            "Create User"
          )}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
