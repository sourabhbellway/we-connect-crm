import React, { useEffect, useMemo, useState } from "react";

import {  Shield,  Calendar, User, RotateCcw, Trash2 } from "lucide-react";
import BackButton from "./BackButton";
import { roleService } from "../services/roleService";
import Pagination from "./Pagination";
import TableLoader from "./TableLoader";
import NoResults from "./NoResults";
import { toast } from "react-toastify";

interface DeletedRoleRecord {
  id: number;
  name: string;
  description: string | null;
  deletedAt: string;
}

const TrashRoles: React.FC = () => {
  const [roles, setRoles] = useState<DeletedRoleRecord[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [pages, setPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchData = useMemo(
    () => async (currentPage: number) => {
      try {
        setLoading(true);
        setError("");
        const res = await roleService.getDeletedRoles(currentPage, limit);
        const records: DeletedRoleRecord[] = res?.data?.roles ?? [];
        setRoles(records);
        setTotal(res?.data?.pagination?.totalItems ?? 0);
        setPages(res?.data?.pagination?.totalPages ?? 0);
      } catch (e: any) {
        const message = e?.response?.data?.message || "Failed to load deleted roles";
        setError(message);
        toast.error(message, { toastId: "trash_roles_fetch_error" });
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  const handleRestore = async (roleId: number) => {
    if (!window.confirm("Are you sure you want to restore this role?")) {
      return;
    }

    try {
      await roleService.restoreRole(roleId);
      toast.success("Role restored successfully!");
      // Refresh the list
      fetchData(page);
    } catch (e: any) {
      const message = e?.response?.data?.message || "Failed to restore role";
      toast.error(message, { toastId: "trash_roles_restore_error" });
    }
  };

  const handlePermanentDelete = async (roleId: number) => {
    if (
      !window.confirm(
        "This will permanently delete the role. Any associated permissions will be lost. Continue?",
      )
    ) {
      return;
    }

    try {
      await roleService.deleteRolePermanently(roleId);
      toast.success("Role deleted permanently!");
      fetchData(page);
    } catch (e: any) {
      const message = e?.response?.data?.message || "Failed to permanently delete role";
      toast.error(message, { toastId: "trash_roles_permanent_delete_error" });
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [fetchData, page]);
 

  return (
    <div className="relative space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen overflow-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-10 -top-10 md:right-0 md:-top-8 aspect-square opacity-20 dark:opacity-15">
        <div className="relative w-[220px] h-[220px] md:w-[320px] md:h-[320px] rotate-12">
          <div className="absolute inset-0 blur-2xl bg-gradient-to-br from-purple-400/40 to-rose-400/30 rounded-full"></div>
          <div className="absolute inset-6 rounded-3xl border-2 border-white/40 dark:border-white/10"></div>
          <Shield className="absolute inset-0 m-auto w-44 h-44 md:w-64 md:h-64 text-purple-600/60 dark:text-purple-400/50" />
        </div>
      </div>
    <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      
      <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md">
        <Shield className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Roles Trash</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">View soft-deleted roles. Items are permanently deleted after 30 days.</p>
      </div>
    </div>
    <BackButton to="/trash" />
    </div>
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="overflow-x-auto relative">
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deleted</th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            {loading ? (
              <TableLoader rows={8} columns={5} />
            ) : (
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <NoResults
                      title="Network or server error"
                      description={error}
                      icon={<User className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
                      isError
                    />
                  </td>
                </tr>
              ) : roles.length > 0 ? (
                roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
                          <Shield className="h-4 w-4 text-white" />
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">{role.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{role.description ?? "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" /> {new Date(role.deletedAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleRestore(role.id)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                          title="Restore role"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(role.id)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          title="Delete permanently"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <NoResults
                      icon={<User className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
                      description="No deleted roles found."
                    />
                  </td>
                </tr>
              )}
            </tbody>
            )}
          </table>
        </div>
        <Pagination
          currentPage={page}
          totalPages={pages}
          totalItems={total}
          onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          itemsPerPage={limit}
        />
      </div>
    </div>
  );
};

export default TrashRoles;

