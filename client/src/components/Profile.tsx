import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import { userService } from "../services/userService";
import { authService } from "../services/authService";
import InputField, { SelectField } from "./InputField";
import { industryService, Industry } from "../services/industryService";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Edit,
  Save,
  X,
  Palette,
  Building,
  ListFilter,
} from "lucide-react";

const Profile: React.FC = () => {
  const { user, updateUser, hasRole } = useAuth();
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [isLoadingIndustries, setIsLoadingIndustries] = useState(true);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    company: (user as any)?.company || "",
    industryId: (user as any)?.industryId as number | undefined,
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await userService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        company: formData.company || undefined,
        industryId: formData.industryId ?? undefined,
      });

      // Preserve existing roles/permissions if API doesn't return them
      const mergedUser = {
        ...user,
        ...response.data.user,
        roles: (response.data.user && (response.data.user as any).roles)
          ? (response.data.user as any).roles
          : user?.roles || [],
      } as any;

      updateUser(mergedUser);
      // You can add a toast notification here if you want
      console.log("Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      console.error(
        "Failed to update profile:",
        error.response?.data?.message || error.message
      );
      // You can add error toast notification here
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      company: (user as any)?.company || "",
      industryId: (user as any)?.industryId,
    });
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 p-5">
              <div className="text-center mb-4">
                <div className="relative mx-auto h-16 w-16 mb-3">
                  <div className="h-16 w-16 bg-gradient-to-br from-[#EF444E] to-[#ff5a64] rounded-full flex items-center justify-center border-4 border-white dark:border-gray-700 shadow">
                    <User className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.fullName}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user?.roles?.[0]?.name || t("common.noRole")}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/60 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{t("user.lastLogin")}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{formatDate(user?.lastLogin)}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/60 rounded-lg">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{t("user.permissions")}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{user?.roles?.reduce((acc, role) => acc + ((role as any).permissions?.length ?? 0), 0) || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
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
                    />
                    <InputField
                      label={t("user.lastName") as string}
                      leftIcon={<User className="h-4 w-4 text-gray-400" />}
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                    <InputField
                      label={t("user.email") as string}
                      leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                    {showAdminOnlyFields && (
                      <>
                        <InputField
                          label={t("user.companyName", "Company Name") as string}
                          leftIcon={<Building className="h-4 w-4 text-gray-400" />}
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                        <SelectField
                          label={t("user.chooseIndustry", "Choose your Industry") as string}
                          leftIcon={<ListFilter className="h-4 w-4 text-gray-400" />}
                          value={formData.industryId ?? ""}
                          onChange={(e) =>
                            setFormData((s) => ({
                              ...s,
                              industryId: e.target.value ? Number(e.target.value) : undefined,
                            }))
                          }
                          disabled={!isEditing}
                        >
                          <option value="">{t("common.selectOption", "Select option")}</option>
                          {industries.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.name}
                            </option>
                          ))}
                        </SelectField>
                      </>
                    )}
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

            {/* Aggregated User Permissions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">{t("user.permissions", "Permissions")}</h3>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const allPerms = (user?.roles || []).flatMap((r: any) => Array.isArray(r.permissions) ? r.permissions : []);
                  const uniqueById = new Map<number, any>();
                  for (const p of allPerms) {
                    if (p && typeof p.id === "number" && !uniqueById.has(p.id)) uniqueById.set(p.id, p);
                  }
                  const uniquePerms = Array.from(uniqueById.values());
                  if (uniquePerms.length === 0) {
                    return (
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t("user.noPermissions", "No permissions assigned")}</span>
                    );
                  }
                  return uniquePerms.map((permission: any) => (
                    <span
                      key={permission.id}
                      className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                    >
                      {permission.name}
                    </span>
                  ));
                })()}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Palette className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t("common.theme")}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{t("user.themeDescription", "Choose your preferred theme")}</p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDark ? "bg-[#EF444E]" : "bg-gray-200"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDark ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
