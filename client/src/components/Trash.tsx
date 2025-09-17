import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Users as UsersIcon,
  FileText,
  Shield,
} from "lucide-react";
// Landing page only; no tables here

function SectionCard({
  title,
  icon: Icon,
  description,
  children,
}: {
  title: string;
  icon: any;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#EF444E] to-[#ff5a64] text-white shadow-md">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// TableShell removed

const Trash: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#EF444E] to-[#ff5a64] text-white shadow-md">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Trash</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Restore or permanently delete soft-deleted records.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate("/trash/users")}
          className="w-full text-left bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-5 hover:shadow-xl hover:scale-[1.01] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#EF444E] to-[#ff5a64] text-white shadow-md">
              <UsersIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Users</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Restore or permanently delete users</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => navigate("/trash/leads")}
          className="w-full text-left bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-5 hover:shadow-xl hover:scale-[1.01] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#EF444E] to-[#ff5a64] text-white shadow-md">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Leads</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage deleted leads</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => navigate("/trash/roles")}
          className="w-full text-left bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-5 hover:shadow-xl hover:scale-[1.01] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#EF444E] to-[#ff5a64] text-white shadow-md">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Roles</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage deleted roles</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Trash;


