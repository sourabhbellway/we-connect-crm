import React, { useEffect, useState } from "react";
import InputField from "./InputField";
import { UserPayload, UserEditPayload } from "./UserCreate";
import { roleService } from "../services/roleService";
import { userService } from "../services/userService";
import {
  User,
  Mail,
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

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
  const [allUsers, setAllUsers] = useState<{ id: number; fullName: string; email: string }[]>([]);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) setForm({ ...defaultState, ...initial } as T);
  }, [initial]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rolesResp, usersResp] = await Promise.all([
          roleService.getRoles({ status: "active" }),
          userService.getUsers(),
        ]);
        const parsedRoles = (rolesResp as any)?.data?.roles
          ?? (rolesResp as any)?.roles
          ?? (rolesResp as any)?.data?.items
          ?? (rolesResp as any)?.items
          ?? [];
        setRoles(Array.isArray(parsedRoles) ? parsedRoles : []);
        const list = (usersResp as any)?.data?.users ?? (usersResp as any)?.data ?? (usersResp as any)?.users ?? [] as any[];
        setAllUsers(
          Array.isArray(list)
            ? list.map((u: any) => ({ id: u.id, fullName: u.fullName || `${u.firstName} ${u.lastName}`, email: u.email }))
            : []
        );
      } catch (e) {
        console.error("Failed to load roles/users:", e);
      }
    };
    loadData();
  }, []);

  const handleChange = (key: keyof T, value: any) => {
    setForm((s) => ({ ...s, [key]: value }));
    if (key === "email") {
      const valueStr = String(value || "");
      const err = valueStr ? validateEmail(valueStr) : null; // no error when blank
      setEmailError(err);
    }
    if (key === "password") {
      const valueStr = String(value || "");
      setPasswordCriteria(evaluatePassword(valueStr));
      if (passwordError) setPasswordError(null);
    }
    if (key === "firstName") {
      const err = validateName(String(value || ""));
      setFirstNameError(err);
    }
    if (key === "lastName") {
      const err = validateName(String(value || ""));
      setLastNameError(err);
    }
  };

  const toggleRole = (roleId: number) => {
    setForm((s) => {
      if (roleError) {
        setRoleError(null);
      }
      // Single select: always replace the array with just the new roleId
      return {
        ...s,
        roleIds: [roleId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Custom required checks to avoid native tooltips
    let hasBlockingError = false;
    const firstNameValue = String((form as any).firstName || "").trim();
    const lastNameValue = String((form as any).lastName || "").trim();
    const emailValue = String((form as any).email || "");
    const passwordValue = String((form as any).password || "");

    if (!firstNameValue) {
      setFirstNameError("First name is required");
      hasBlockingError = true;
    }
    if (!lastNameValue) {
      setLastNameError("Last name is required");
      hasBlockingError = true;
    }
    if (!emailValue) {
      setEmailError("Email is required");
      hasBlockingError = true;
    }
    // For create, password is optional - if left blank, backend will auto-generate
    if (!isEdit && !passwordValue) {
      // No password provided: we'll let backend generate one and email to user
    }
    if (hasBlockingError) return;

    const err = emailValue ? validateEmail(emailValue) : null;
    setEmailError(err);
    if (err) return;

    // Validate first and last name
    const firstErr = validateName(firstNameValue);
    const lastErr = validateName(lastNameValue);
    setFirstNameError(firstErr);
    setLastNameError(lastErr);
    if (firstErr || lastErr) return;

    if (!isEdit || passwordValue) {
      // Only validate password strength if user entered a password
      if (passwordValue) {
        const criteria = evaluatePassword(passwordValue);
        const allOk =
          criteria.length &&
          criteria.lowercase &&
          criteria.uppercase &&
          criteria.number &&
          criteria.special;
        if (!allOk) {
          setPasswordCriteria(criteria);
          setPasswordError(
            "Password must be 8+ chars with uppercase, lowercase, number, and special symbol"
          );
          return;
        }
      }
    }

    const selectedRoles = (form.roleIds || []).filter((id) => typeof id === "number");
    if (selectedRoles.length === 0) {
      setRoleError("Select at least one role");
      return;
    }
    setRoleError(null);
    await onSubmit(form);
  };

  const validateEmail = (email: string): string | null => {
    // Only validate format when non-empty; blank handled by required checks above
    const value = (email || "").trim();
    if (!value) return "Please enter a valid email address";
    const basicPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!basicPattern.test(value)) return "Please enter a valid email address";
    const [localPart, domainPart] = value.split("@");
    if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) {
      return "Please enter a valid email address";
    }
    if (domainPart.includes("..")) {
      return "Please enter a valid email address";
    }
    const labels = domainPart.split(".");
    if (labels.some((label) => !label || label.startsWith("-") || label.endsWith("-"))) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const validateName = (value: string): string | null => {
    const v = value.trim();
    if (v.length < 3) return "Must be at least 3 characters";
    // Reject any HTML/script-like tags
    if (/<[^>]*>/i.test(value)) return "Invalid characters detected";
    // Allow only letters and spaces (no special symbols or numbers)
    if (!/^[A-Za-z\s]+$/.test(v)) return "Only letters and spaces are allowed";
    return null;
  };

  const evaluatePassword = (password: string) => {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const hasLength = password.length >= 8;
    return {
      length: hasLength,
      lowercase: hasLower,
      uppercase: hasUpper,
      number: hasNumber,
      special: hasSpecial,
    };
  };

  // Intentionally no inline error text rendering

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
            error={firstNameError || undefined}
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
            error={lastNameError || undefined}
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
            error={emailError || undefined}
          />
        </div>
        <div>
          <InputField
            label={isEdit ? "New Password" : "Password"}
            leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
            type={showPassword ? "text" : "password"}
            value={form.password || ""}
            onChange={(e) =>
              handleChange("password", (e.target as HTMLInputElement).value)
            }
            required={false}
            minLength={8}
            placeholder={
              isEdit
                ? "Leave empty to keep current password"
                : "Leave empty to auto-generate and email to the user"
            }
            error={passwordError || undefined}
          />
        </div>
      </div>

      {/* Password strength indicators */}
      <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
        <div className="font-medium">Password must include (only if you set it manually):</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          <div className="flex items-center">
            {passwordCriteria.length ? (
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <AlertCircle className="h-4 w-4 text-gray-400 mr-1" />
            )}
            <span>At least 8 characters</span>
          </div>
          <div className="flex items-center">
            {passwordCriteria.lowercase ? (
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <AlertCircle className="h-4 w-4 text-gray-400 mr-1" />
            )}
            <span>Lowercase letter (a-z)</span>
          </div>
          <div className="flex items-center">
            {passwordCriteria.uppercase ? (
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <AlertCircle className="h-4 w-4 text-gray-400 mr-1" />
            )}
            <span>Uppercase letter (A-Z)</span>
          </div>
          <div className="flex items-center">
            {passwordCriteria.number ? (
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <AlertCircle className="h-4 w-4 text-gray-400 mr-1" />
            )}
            <span>Number (0-9)</span>
          </div>
          <div className="flex items-center">
            {passwordCriteria.special ? (
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <AlertCircle className="h-4 w-4 text-gray-400 mr-1" />
            )}
            <span>Special symbol (!@#$%^&*...)</span>
          </div>
        </div>
        <div className="text-gray-500 dark:text-gray-400">
          {isEdit ? "Leave password empty to keep the current one." : ""}
        </div>
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

      {/* Reporting Authority (RA) */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Shield className="h-4 w-4 mr-1" />
          Reporting Authority
        </label>
        <select
          className="block w-full px-4 py-3 rounded-lg border text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={(form as any).managerId ?? ''}
          onChange={(e) => handleChange("managerId" as keyof T, e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">None</option>
          {allUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.fullName} ({u.email})
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select the user's reporting manager.</p>
      </div>

      {/* Roles */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Shield className="h-4 w-4 mr-1" />
          Role
        </label>
        <div className="space-y-2">
          {roles.length > 0 ? (
            roles.map((role) => {
              const selected = (form.roleIds || []).includes(role.id);
              return (
                <label
                  key={role.id}
                  className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${selected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                >
                  <input
                    type="radio"
                    name="roleSelection"
                    checked={selected}
                    onChange={() => toggleRole(role.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
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
          Select a role to assign to this user
        </p>
        {roleError && (
          <p className="text-xs text-red-500 mt-1">
            {roleError}
          </p>
        )}
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
