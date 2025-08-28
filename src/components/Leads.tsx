import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Activity,
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { leadService, Lead, LeadFilters } from "../services/leadService";
import { userService } from "../services/userService";
import { tagService, Tag } from "../services/tagService";
import { leadSourceService, LeadSource } from "../services/leadSourceService";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";

const Leads: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [filters, setFilters] = useState<LeadFilters>({
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusOptions = [
    {
      value: "new",
      label: t("leads.status.new"),
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "contacted",
      label: t("leads.status.contacted"),
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "qualified",
      label: t("leads.status.qualified"),
      color: "bg-green-100 text-green-800",
    },
    {
      value: "proposal",
      label: t("leads.status.proposal"),
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "negotiation",
      label: t("leads.status.negotiation"),
      color: "bg-orange-100 text-orange-800",
    },
    {
      value: "closed",
      label: t("leads.status.closed"),
      color: "bg-green-100 text-green-800",
    },
    {
      value: "lost",
      label: t("leads.status.lost"),
      color: "bg-red-100 text-red-800",
    },
  ];

  useEffect(() => {
    fetchLeads();
    fetchUsers();
    fetchTags();
    fetchLeadSources();
  }, [filters]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await leadService.getLeads(filters);
      console.log(response);
      setLeads(response.data.leads);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || t("leads.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers();
      setUsers(response.data.users);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchTags = async () => {
    try {
      const tags = await tagService.getTags();
      setTags(tags.data.tags);
    } catch (err: any) {
      console.error("Error fetching tags:", err);
    }
  };

  const fetchLeadSources = async () => {
    try {
      const sources = await leadSourceService.getLeadSources();
      setLeadSources(sources.data.leadSources);
    } catch (err: any) {
      console.error("Error fetching lead sources:", err);
    }
  };

  const handleFilterChange = (
    key: keyof LeadFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleCreateLead = () => {
    navigate("/leads/new");
  };

  const handleEditLead = (lead: Lead) => {
    navigate(`/leads/${lead.id}/edit`);
  };

  const handleViewLead = (lead: Lead) => {
    // Optionally navigate to a view page later
  };

  const requestDeleteLead = (lead: Lead) => {
    setLeadToDelete(lead);
    setShowDeleteModal(true);
  };

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    try {
      await leadService.deleteLead(leadToDelete.id);
      setShowDeleteModal(false);
      setLeadToDelete(null);
      toast.success(t("leads.deleteSuccess"));
      fetchLeads();
    } catch (err: any) {
      const message = err.response?.data?.message || t("leads.deleteError");
      setError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(
      (option) => option.value === status
    );
    return statusOption?.color || "bg-gray-100 text-gray-800";
  };

  if (loading && leads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("leads.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t("leads.leadManagement")}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Search className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={handleCreateLead}
            className="flex items-center px-4 py-3 bg-[#ef444e] text-white rounded-full hover:bg-[#f26971] transition-colors text-sm font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("leads.addLead")}
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("common.filter")}
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              <Filter className="h-4 w-4 mr-1" />
              {showFilters ? t("common.hide") : t("common.show")}{" "}
              {t("common.filter")}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("common.search")}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder={t("leads.searchLeads")}
                    value={filters.search || ""}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("leads.form.status")}
                </label>
                <select
                  value={filters.status || ""}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t("leads.form.allStatuses")}</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("leads.form.itemsPerPage")}
                </label>
                <select
                  value={filters.limit || 10}
                  onChange={(e) =>
                    handleFilterChange("limit", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("All Leads")}
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t("common.showing")} {leads.length} {t("common.of")}{" "}
              {pagination.totalItems} {t("leads.leads")}
            </div>
          </div>

      {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

          {leads.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <User className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {t("leads.noLeads")}
          </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t("leads.getStartedByCreating")}
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreateLead}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#ef444e] hover:bg-[#f26971] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ef444e]"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  {t("leads.addLead")}
                </button>
              </div>
        </div>
          ) : (
            <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("leads.form.name")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("leads.form.email")}
                </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("leads.form.company")}
                </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("leads.form.status")}
                </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("leads.form.assignedTo")}
                </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("common.created")}
                </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {lead.firstName} {lead.lastName}
                        </div>
                        {lead.phone && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {lead.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {lead.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {lead.company || "-"}
                          </div>
                          {lead.position && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {lead.position}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        lead.status
                      )}`}
                    >
                            {statusOptions.find(
                              (option) => option.value === lead.status
                            )?.label || lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {lead.assignedUser
                            ? `${lead.assignedUser.firstName} ${lead.assignedUser.lastName}`
                            : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                    
                      <button
                        onClick={() => handleEditLead(lead)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              title={t("common.edit")}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => requestDeleteLead(lead)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title={t("common.delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
            </div>
          )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {t("common.previous")}
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {t("common.next")}
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    {t("common.showing")}{" "}
                  <span className="font-medium">
                    {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                  </span>{" "}
                    {t("common.to")}{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.currentPage * pagination.itemsPerPage,
                      pagination.totalItems
                    )}
                  </span>{" "}
                    {t("common.of")}{" "}
                  <span className="font-medium">{pagination.totalItems}</span>{" "}
                    {t("common.results")}
                </p>
              </div>
              <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <span className="sr-only">{t("common.previous")}</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.currentPage
                            ? "z-10 bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                          : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <span className="sr-only">{t("common.next")}</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
                  </div>
                </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={showDeleteModal && !!leadToDelete}
        title={t("leads.deleteLead")}
        description={
          leadToDelete ? (
            <div>
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#EF444E] to-[#ff5a64] flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {leadToDelete.firstName} {leadToDelete.lastName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {leadToDelete.email}
                  </div>
                </div>
              </div>
              <p>{t("leads.deleteConfirmation")}</p>
            </div>
          ) : null
        }
        confirmText={t("leads.deleteLead")}
        cancelText={t("common.cancel")}
        loading={isDeleting}
        onConfirm={confirmDeleteLead}
        onClose={() => {
          if (isDeleting) return;
          setShowDeleteModal(false);
          setLeadToDelete(null);
        }}
      />
    </div>
  );
};

export default Leads;
