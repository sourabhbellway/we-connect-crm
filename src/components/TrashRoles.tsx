import React from "react";

import {  Shield,  Calendar, Undo2, XCircle } from "lucide-react";
import BackButton from "./BackButton";

const dummyRoles = [
  { id: 201, name: "Temp Moderator", users: 4, permissions: 12, deletedAt: "2025-09-01 12:22" },
  { id: 202, name: "Seasonal Agent", users: 12, permissions: 8, deletedAt: "2025-09-04 10:10" },
  { id: 203, name: "Pilot Access", users: 2, permissions: 5, deletedAt: "2025-09-08 17:40" },
];

const TrashRoles: React.FC = () => {
 

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
    <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      
      <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md">
        <Shield className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Roles Trash</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Restore or permanently delete roles.</p>
      </div>
    </div>
    <BackButton to="/trash" />
    </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Users</th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deleted</th>
                <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {dummyRoles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
                        <Shield className="h-4 w-4 text-white" />
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">{role.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{role.users}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{role.permissions}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" /> {role.deletedAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button className="px-2 py-1 rounded-full bg-green-600 hover:bg-green-700 text-white text-xs inline-flex items-center">
                        <Undo2 className="h-3 w-3 mr-1" /> Restore
                      </button>
                      <button className="px-2 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs inline-flex items-center">
                        <XCircle className="h-3 w-3 mr-1" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrashRoles;

