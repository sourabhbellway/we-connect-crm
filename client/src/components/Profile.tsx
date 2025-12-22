import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import { userService } from "../services/userService";
import { authService } from "../services/authService";
import { roleService } from "../services/roleService";
import { API_BASE_URL } from "../config/config";
import InputField from "./InputField";
import { toast } from "react-toastify";
import { industryService, Industry } from "../services/industryService";
import { useLocation } from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Edit,
  Save,
  X,
  Lock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Asset base for serving uploaded files (strip trailing /api if present)
const assetBase = (API_BASE_URL || "").replace(/\/api\/?$/, "") || window.location.origin;

const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const NAME_RULE_MESSAGE =
  "must contain only letters (A-Z), no numbers or special characters, and be at least 2 characters long";

const Profile: React.FC = () => {
  const { user, updateUser, hasRole } = useAuth();
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setIndustries] = useState<Industry[]>([]);
  const [isLoadingIndustries, setIsLoadingIndustries] = useState(true);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });
  const [formErrors, setFormErrors] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});
  const [aggregatedPermissions, setAggregatedPermissions] = useState<any[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadIndustries = async () => {
      try {
        setIsLoadingIndustries(true);
        const list = await industryService.getIndustries();
        setIndustries(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Failed to load industries:", e);
        setIndustries([]);
      } finally {
        setIsLoadingIndustries(false);
      }
    };
    loadIndustries();
  }, []);


  // Build an aggregated permission list for display.
  // For Admin roles we show *all* system permissions (from /permissions).
  useEffect(() => {
    const buildPermissions = async () => {
      const roles = user?.roles || [];
      const isAdminRole = roles.some((r: any) => {
        const name = (r?.name || "").toLowerCase();
        return name === "admin" || name === "super_admin" || name === "super admin";
      });

      // Base aggregation from the roles currently on the user
      const fromRoles = roles.flatMap((r: any) =>
        Array.isArray(r.permissions) ? r.permissions : []
      );
      const uniqueFromRoles = (() => {
        const map = new Map<number, any>();
        for (const p of fromRoles) {
          if (p && typeof p.id === "number" && !map.has(p.id)) {
            map.set(p.id, p);
          }
        }
        return Array.from(map.values());
      })();

      if (!isAdminRole) {
        setAggregatedPermissions(uniqueFromRoles);
        return;
      }

      try {
        setIsLoadingPermissions(true);
        const resp = await roleService.getPermissions();
        const allPerms = (resp as any)?.data || resp || [];
        const map = new Map<number, any>();
        for (const p of allPerms) {
          if (p && typeof p.id === "number" && !map.has(p.id)) {
            map.set(p.id, p);
          }
        }
        setAggregatedPermissions(Array.from(map.values()));
      } catch (e) {
        console.error("Failed to load full permissions for admin:", e);
        setAggregatedPermissions(uniqueFromRoles);
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    buildPermissions();
  }, [user?.roles]);

  // Ensure permissions are present on roles for display
  useEffect(() => {
    const enrichPermissionsIfMissing = async () => {
      try {
        const roles = user?.roles || [];
        const rolesNeeding = roles.filter((r: any) => !Array.isArray(r.permissions) || r.permissions.length === 0);
        if (rolesNeeding.length === 0) return;

        const fetched = await Promise.all(
          rolesNeeding.map(async (r: any) => {
            try {
              const perms = await authService.getPermissionsForRole(String(r.id));
              return { id: r.id, permissions: perms };
            } catch (e) {
              console.error("Failed to load permissions for role", r.id, e);
              return { id: r.id, permissions: [] };
            }
          })
        );

        const permsByRoleId = new Map(fetched.map((f) => [f.id, f.permissions]));
        const newRoles = roles.map((r: any) => ({
          ...r,
          permissions: Array.isArray(r.permissions) && r.permissions.length > 0 ? r.permissions : (permsByRoleId.get(r.id) || []),
        }));

        updateUser({ ...(user as any), roles: newRoles } as any);
      } catch (e) {
        console.error("Failed to enrich permissions:", e);
      }
    };

    enrichPermissionsIfMissing();
  }, [user?.roles]);

  const showAdminOnlyFields = hasRole?.("Admin") === true;

  const getNameError = (value: string, label: string) => {
    const trimmed = (value || "").trim();
    if (trimmed.length < 2 || !NAME_REGEX.test(trimmed)) {
      return `${label} ${NAME_RULE_MESSAGE}`;
    }
    return null;
  };

  const triggerDatePicker = (input: HTMLInputElement | null) => {
    if (!input) return;
    try {
      const picker = (input as HTMLInputElement & { showPicker?: () => void }).showPicker;
      if (typeof picker === "function") {
        requestAnimationFrame(() => {
          picker.call(input);
        });
      } else {
        input.focus();
        input.click();
      }
    } catch (err) {
      // Some browsers don't support showPicker; ignore silently
    }
  };

  const handleDateFieldFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    triggerDatePicker(event.target);
  };

  const handleDateFieldClick = (event: React.MouseEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    triggerDatePicker(event.currentTarget);
  };

  const handleDatePointerDown = (event: React.PointerEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    event.preventDefault();
    dateInputRef.current?.focus();
    triggerDatePicker(dateInputRef.current);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field-level validation error on change
    setFormErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleSave = async () => {
    const firstNameError = getNameError(
      formData.firstName,
      t("user.firstName", "First name")
    );
    const lastNameError = getNameError(
      formData.lastName,
      t("user.lastName", "Last name")
    );

    const nextErrors: typeof formErrors = {};
    if (firstNameError) {
      nextErrors.firstName = firstNameError;
    }
    if (lastNameError) {
      nextErrors.lastName = lastNameError;
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      toast.error(
        Object.values(nextErrors).join(" "),
        { toastId: "profile_validation_error" }
      );
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      };

      if (showAdminOnlyFields) {
        payload.email = formData.email;
      }

      const response = await userService.updateProfile(payload);

      // userService.updateProfile returns the API payload directly.
      // Normalize potential shapes: { success, data: { user } } | { user } | user
      const updatedUserFromServer = (response as any)?.data?.user
        || (response as any)?.user
        || response;

      // Preserve existing roles/permissions if API doesn't return them
      const mergedUser = {
        ...user,
        ...(updatedUserFromServer || {}),
        roles: (updatedUserFromServer && (updatedUserFromServer as any).roles)
          ? (updatedUserFromServer as any).roles
          : user?.roles || [],
      } as any;

      updateUser(mergedUser);
      toast.success(
        t("user.profileUpdateSuccess", "Profile updated successfully"),
        { toastId: "profile_update_success" }
      );
      setFormErrors({});
      setIsEditing(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t("errors.profileUpdateFailed", "Failed to update profile");
      console.error("Failed to update profile:", message);
      toast.error(message, { toastId: "profile_update_error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    });
    setFormErrors({});
    setIsEditing(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("common.noData");
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordError(null);
    setPasswordSuccess(null);

    if (name === 'newPassword') {
      const pwd = value || '';
      const hasLower = /[a-z]/.test(pwd);
      const hasUpper = /[A-Z]/.test(pwd);
      const hasNumber = /[0-9]/.test(pwd);
      const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
      const hasLength = pwd.length >= 8;
      setPasswordCriteria({
        length: hasLength,
        lowercase: hasLower,
        uppercase: hasUpper,
        number: hasNumber,
        special: hasSpecial,
      });
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Please fill in all password fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }

    // Strong password validation (same as user creation form)
    const pwd = passwordForm.newPassword || '';
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    const hasLength = pwd.length >= 8;

    const allOk = hasLength && hasLower && hasUpper && hasNumber && hasSpecial;
    if (!allOk) {
      setPasswordCriteria({ length: hasLength, lowercase: hasLower, uppercase: hasUpper, number: hasNumber, special: hasSpecial });
      setPasswordError('Password must be 8+ chars with uppercase, lowercase, number, and special symbol');
      return;
    }

    try {
      setPasswordLoading(true);
      const resp = await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      const updatedUserFromServer = (resp as any)?.data?.user
        || (resp as any)?.user
        || resp;

      if (updatedUserFromServer) {
        updateUser({ ...(user as any), ...updatedUserFromServer } as any);
      } else if (user?.mustChangePassword) {
        // At least clear the flag locally if backend succeeded but didn't return user
        updateUser({ ...(user as any), mustChangePassword: false } as any);
      }

      setPasswordSuccess('Password updated successfully');
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update password';
      setPasswordError(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const location = useLocation();

  useEffect(() => {
    // Check if we navigated here with intent to focus password section
    if (location.state && (location.state as any).focusPassword) {
      setTimeout(() => {
        document.getElementById("change-password-section")?.scrollIntoView({ behavior: "smooth" });
        // Optionally focus the first password field
        const firstInput = document.querySelector('input[name="currentPassword"]') as HTMLInputElement;
        if (firstInput) firstInput.focus();
      }, 500); // Small delay to ensure render
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("user.profile")}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {t("user.profileDescription", "Manage your account settings and preferences")}
          </p>
        </div>

        <div className="space-y-6">
          {/* Hero */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex flex-col xl:flex-row gap-6 items-start">
              <div className="flex flex-col items-center xl:items-start">
                <div className="relative h-20 w-20 mb-3">
                  {user?.profilePicture ? (
                    <img
                      src={`${assetBase}/uploads/${user.profilePicture}`}
                      alt="Avatar"
                      className="h-20 w-20 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow"
                    />
                  ) : (
                    <div className="h-20 w-20 bg-gradient-to-br from-[#EF444E] to-[#ff5a64] rounded-full flex items-center justify-center border-4 border-white dark:border-gray-700 shadow">
                      <User className="h-9 w-9 text-white" />
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute -bottom-2 right-0 inline-flex items-center px-2 py-1 text-[10px] font-medium text-white bg-[#EF444E] rounded-full hover:bg-[#dc2626] cursor-pointer shadow">
                      {avatarUploading ? (
                        <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                      ) : (
                        <Edit className="h-3.5 w-3.5 mr-1" />
                      )}
                      {t("user.changeAvatar", "Change Avatar")}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setAvatarError(null);
                          try {
                            setAvatarUploading(true);
                            const resp = await userService.uploadProfilePicture(file);
                            const updatedUserFromServer = (resp as any)?.data?.user
                              || (resp as any)?.user
                              || resp;
                            const updatedUser = { ...(user as any), ...(updatedUserFromServer || {}) } as any;
                            updateUser(updatedUser);
                          } catch (err: any) {
                            setAvatarError(err?.message || 'Failed to upload');
                          } finally {
                            setAvatarUploading(false);
                          }
                        }}
                      />
                    </label>
                  )}
                  {avatarError && (
                    <p className="text-xs text-red-500 mt-2">{avatarError}</p>
                  )}
                </div>
                <div className="text-center xl:text-left">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{user?.fullName}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.roles?.[0]?.name || t("common.noRole")}</p>
                  {user?.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
                  )}
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> {t("user.lastLogin")}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                    {formatDate(user?.lastLogin)}
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Shield className="h-4 w-4" /> {t("user.permissions")}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-[#EF444E]">
                    {aggregatedPermissions.length > 0
                      ? aggregatedPermissions.length
                      : user?.roles?.reduce(
                        (acc, role) => acc + ((role as any).permissions?.length ?? 0),
                        0,
                      ) || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("user.permissionSummary", "Total permissions granted")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left column */}
            <div className="xl:col-span-4 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 p-5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  {t("user.contactOverview", "Contact Snapshot")}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Mail className="h-4 w-4" />
                      <span>{t("user.email")}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formData.email || user?.email || t("common.noData")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Shield className="h-4 w-4" />
                      <span>{t("common.role", "Role")}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.roles?.map((r: any) => r.name).join(", ") || t("common.noRole")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t("common.theme")}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("user.themeDescription", "Choose your preferred theme")}
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDark ? "bg-[#EF444E]" : "bg-gray-200"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDark ? "translate-x-3" : "-translate-x-3"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                  <span>{t("user.lastLogin")}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDate(user?.lastLogin)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="xl:col-span-8 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700">
                <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t("user.personalInformation")}</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {isEditing ? (
                      <>
                        <X className="h-4 w-4 mr-1" />{t("common.cancel")}
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-1" />{t("common.edit")}
                      </>
                    )}
                  </button>
                </div>

                {/* Skeleton while loading industries */}
                {isLoadingIndustries ? (
                  <div className="p-5 animate-pulse">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="h-9 bg-gray-100 dark:bg-gray-700 rounded-xl" />
                      <div className="h-9 bg-gray-100 dark:bg-gray-700 rounded-xl" />
                      <div className="h-9 bg-gray-100 dark:bg-gray-700 rounded-xl" />
                      <div className="h-9 bg-gray-100 dark:bg-gray-700 rounded-xl" />
                    </div>
                  </div>
                ) : (
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <InputField
                        label={t("user.firstName") as string}
                        leftIcon={<User className="h-4 w-4 text-gray-400" />}
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        required
                        error={formErrors.firstName || undefined}
                      />
                      <InputField
                        label={t("user.lastName") as string}
                        leftIcon={<User className="h-4 w-4 text-gray-400" />}
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        required
                        error={formErrors.lastName || undefined}
                      />
                      <InputField
                        label={t("user.email") as string}
                        leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing || !showAdminOnlyFields}
                      />
                    </div>

                    {isEditing && (
                      <div className="mt-5 flex justify-end gap-2">
                        <button
                          onClick={handleCancel}
                          disabled={loading}
                          className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                          {t("common.cancel")}
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={loading}
                          className="px-4 py-2 text-xs font-semibold text-white bg-[#EF444E] rounded-full hover:bg-[#dc2626] disabled:opacity-50 flex items-center"
                        >
                          {loading ? (
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                          ) : (
                            <Save className="h-4 w-4 mr-1.5" />
                          )}
                          {t("common.save")}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Change Password */}
              {/* Change Password */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 p-5" id="change-password-section">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Change Password</h4>
                    </div>
                  </div>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
                  {/* Hidden username/email for accessibility */}
                  <input
                    type="text"
                    name="username"
                    value={user?.email || ""}
                    autoComplete="username"
                    style={{ display: "none" }}
                    readOnly
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <InputField
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordInputChange}
                      autoComplete="current-password"
                      required={true}  // Added this to remove "{optional}" text
                    />
                    <InputField
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordInputChange}
                      autoComplete="new-password"
                      required={true}  // Added this to remove "{optional}" text
                    />
                    <InputField
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordInputChange}
                      autoComplete="new-password"
                      required={true}  // Added this to remove "{optional}" text
                    />
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" disabled={passwordLoading}>Update Password</button>
                  </div>
                </form>

                {/* Password strength indicators */}
                <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1 mb-2">
                  <div className="font-medium">Password must include:</div>
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
                </div>

                {passwordError && (
                  <p className="text-xs text-red-500 mb-2">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-xs text-green-600 mb-2">{passwordSuccess}</p>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#EF444E] rounded-full hover:bg-[#dc2626] disabled:opacity-50 flex items-center"
                  >
                    {passwordLoading ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                    ) : (
                      <Save className="h-4 w-4 mr-1.5" />
                    )}
                    Update Password
                  </button>
                </div>
              </div>

              {/* Aggregated User Permissions */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 p-5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">{t("user.permissions", "Permissions")}</h3>
                <div className="flex flex-wrap gap-2">
                  {isLoadingPermissions ? (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("user.loadingPermissions", "Loading permissions...")}
                    </span>
                  ) : aggregatedPermissions.length === 0 ? (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("user.noPermissions", "No permissions assigned")}
                    </span>
                  ) : (
                    aggregatedPermissions.map((permission: any) => (
                      <span
                        key={permission.id}
                        className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                      >
                        {permission.name}
                      </span>
                    ))
                  )}
                </div>
              </div>




            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
