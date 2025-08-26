import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import { userService } from "../services/userService";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Edit,
  Save,
  X,
  Bell,
  Globe,
  Palette,
} from "lucide-react";

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

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
      });

      updateUser(response.data.user);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("user.profile")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t(
              "user.profileDescription",
              "Manage your account settings and preferences"
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {/* Profile Avatar (no upload) */}
              <div className="text-center mb-6">
                <div className="relative mx-auto h-24 w-24 mb-4">
                  <div className="h-24 w-24 bg-gradient-to-br from-[#EF444E] to-[#ff5a64] rounded-full flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
                    <User className="h-12 w-12 text-white" />
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user?.fullName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {user?.roles?.[0]?.name || t("common.noRole")}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("user.lastLogin")}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(user?.lastLogin)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("user.permissions")}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.roles?.reduce(
                      (acc, role) => acc + role.permissions.length,
                      0
                    ) || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("user.personalInformation")}
                  </h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {isEditing ? (
                      <>
                        <X className="h-4 w-4 mr-1.5" />
                        {t("common.cancel")}
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-1.5" />
                        {t("common.edit")}
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("user.firstName")}
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 focus:ring-2 focus:ring-[#EF444E] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("user.lastName")}
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 focus:ring-2 focus:ring-[#EF444E] focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("user.email")}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 focus:ring-2 focus:ring-[#EF444E] focus:border-transparent"
                      />
                      <Mail className="absolute left-3 top-2.5 h-5 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#EF444E] rounded-lg hover:bg-[#dc2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
            </div>

            {/* Password Change removed */}

            {/* Roles and Permissions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("user.rolesAndPermissions")}
                </h3>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {user?.roles?.map((role) => (
                    <div
                      key={role.id}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {role.name}
                        </h4>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                          {t("common.active")}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.map((permission) => (
                          <span
                            key={permission.id}
                            className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                          >
                            {permission.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("user.accountSettings")}
                </h3>
              </div>

              <div className="p-6 space-y-6">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Palette className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {t("common.theme")}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t(
                          "user.themeDescription",
                          "Choose your preferred theme"
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isDark ? "bg-[#EF444E]" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDark ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Language Settings */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {t("common.language")}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t(
                          "user.languageDescription",
                          "Select your preferred language"
                        )}
                      </p>
                    </div>
                  </div>
                  <select className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#EF444E] focus:border-transparent">
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {t("common.notifications")}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t(
                          "user.notificationsDescription",
                          "Manage your notification preferences"
                        )}
                      </p>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#EF444E] transition-colors">
                    <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform" />
                  </button>
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
