import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Users as UsersIcon,
  FileText,
  Shield,
  ArrowRight,
  Clock,
} from "lucide-react";
// Landing page only; no tables here

import { useCounts } from "../contexts/CountsContext";

const Trash: React.FC = () => {
  const navigate = useNavigate();
  const { counts, refreshTrashCounts } = useCounts();

  const trashItems = [
    {
      title: "Deleted Users",
      description: "Manage soft-deleted user accounts",
      icon: UsersIcon,
      path: "/trash/users",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      countKey: "trashUsers",
      retention: "30 days"
    },
    {
      title: "Deleted Leads",
      description: "Review removed lead records",
      icon: FileText,
      path: "/trash/leads",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      countKey: "trashLeads",
      retention: "30 days"
    },
    {
      title: "Deleted Roles",
      description: "Access removed role definitions",
      icon: Shield,
      path: "/trash/roles",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      countKey: "trashRoles",
      retention: "30 days"
    }
  ];

  useEffect(() => {
    refreshTrashCounts();
  }, [refreshTrashCounts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section (compact, with decorative background icon) */}
      <div className="relative overflow-hidden">
        {/* subtle gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-orange-500/10 dark:from-red-500/5 dark:to-orange-500/5"></div>

        {/* large background trash icon */}
        <div className="pointer-events-none absolute -right-8 -top-8 md:right-6 md:-top-10 aspect-square opacity-20 dark:opacity-15">
          <div className="relative w-[220px] h-[220px] md:w-[320px] md:h-[320px] rotate-12">
            <div className="absolute inset-0 blur-2xl bg-gradient-to-br from-red-400/50 to-orange-400/40 rounded-full"></div>
            <div className="absolute inset-6 rounded-3xl border-2 border-white/40 dark:border-white/10"></div>
            <Trash2 className="absolute inset-0 m-auto w-44 h-44 md:w-64 md:h-64 text-rose-600 dark:text-rose-400" />
          </div>
        </div>

        {/* content */}
        <div className="relative px-6 py-6">
          <div className=" mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Trash Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 ">
              View soft-deleted records. Items are permanently deleted after 30 days.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-4">
        <div className="max-w-full mx-auto">

          {/* Trash Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trashItems.map((item) => (
              <button
                key={item.title}
                onClick={() => navigate(item.path)}
                className={`group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow border ${item.borderColor} hover:shadow-lg transition-all duration-300 w-full text-left`}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <div className="relative px-4 py-3 w-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3 w-full">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} shadow-lg flex-shrink-0`}>
                      <item.icon className="h-4 w-4 text-white" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors flex-shrink-0" />
                  </div>

                  {/* Content */}
                  <div className="text-left w-full">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed mb-0">
                      {item.description}
                    </p>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 dark:border-gray-700 w-full">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>{item.retention}</span>
                      </div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {(() => {
                          const key = (item as any).countKey as keyof typeof counts;
                          const value = (counts as any)?.[key] ?? 0;
                          const typeLabel = item.title.split(" ")[1]?.toLowerCase() || "items";
                          return `${value} ${typeLabel}`;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-600 transition-colors duration-300"></div>
              </button>
            ))}
          </div>

          {/* Additional Info removed and merged into header for a tighter layout */}
        </div>
      </div>
    </div>
  );
};

export default Trash;


