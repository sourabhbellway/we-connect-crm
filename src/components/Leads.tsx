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
  X,
  RefreshCw,
} from "lucide-react";
import { leadService, Lead, LeadFilters } from "../services/leadService";
import { userService } from "../services/userService";
import { tagService, Tag } from "../services/tagService";
import { leadSourceService, LeadSource } from "../services/leadSourceService";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";

const Leads: React.FC = () => {
  const { t } = useTranslation();
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
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    sourceId: undefined as number | undefined,
    status: "new" as any,
    notes: "",
    assignedTo: undefined as number | undefined,
    tags: [] as number[],
  });

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

  // Sources are loaded from API into `leadSources`

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
      // console.log(tags);
      setTags(tags.data.tags);
    } catch (err: any) {
      console.error("Error fetching tags:", err);
    }
  };

  const fetchLeadSources = async () => {
    try {
      const sources = await leadSourceService.getLeadSources();
      // console.log(sources);
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
    setModalMode("create");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      sourceId: undefined,
      status: "new",
      notes: "",
      assignedTo: undefined,
      tags: [],
    });
    setShowModal(true);
  };

  const handleEditLead = (lead: Lead) => {
    setModalMode("edit");
    setSelectedLead(lead);
    setFormData({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone || "",
      company: lead.company || "",
      position: lead.position || "",
      sourceId: lead.sourceId || undefined,
      status: lead.status as any,
      notes: lead.notes || "",
      assignedTo: lead.assignedTo || undefined,
      tags: (lead.tags || []).map((t: any) => t.id),
    });
    setShowModal(true);
  };

  const handleViewLead = (lead: Lead) => {
    setModalMode("view");
    setSelectedLead(lead);
    setFormData({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone || "",
      company: lead.company || "",
      position: lead.position || "",
      sourceId: lead.sourceId || undefined,
      status: lead.status as any,
      notes: lead.notes || "",
      assignedTo: lead.assignedTo || undefined,
      tags: (lead.tags || []).map((t: any) => t.id),
    });
    setShowModal(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const cleanFormData = {
        ...formData,
        sourceId: formData.sourceId || undefined,
        assignedTo: formData.assignedTo || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        status: formData.status ? formData.status.toLowerCase() : undefined,
      };

      if (modalMode === "create") {
        await leadService.createLead(cleanFormData);
        toast.success("Lead created successfully");
      } else if (modalMode === "edit" && selectedLead) {
        await leadService.updateLead(selectedLead.id, cleanFormData);
        toast.success("Lead updated successfully");
      }

      setShowModal(false);
      fetchLeads();
      // fetchStats()
    } catch (err: any) {
      setError(err.response?.data?.message || t("leads.saveError"));
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Leads Table Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("leads.form.allLeads")} ({leads.length})
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t("leads.form.manageAndTrack")}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("leads.table.lead")}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("leads.table.company")}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("leads.table.status")}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("leads.table.assignedTo")}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("leads.table.created")}
                </th>
                <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("leads.table.actions")}
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
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#EF444E] to-[#ff5a64] flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {lead.firstName} {lead.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {lead.email}
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
                    {lead.company && (
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {lead.company}
                          </div>
                          {lead.position && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {lead.position}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        lead.status
                      )}`}
                    >
                      {statusOptions.find((s) => s.value === lead.status)
                        ?.label || lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {lead.assignedUser ? (
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2">
                          <User className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                        </div>
                        {lead.assignedUser.firstName}{" "}
                        {lead.assignedUser.lastName}
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">
                        {t("leads.form.unassigned")}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewLead(lead)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title={t("leads.form.viewLead")}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditLead(lead)}
                        className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                        title={t("leads.form.editLead")}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => requestDeleteLead(lead)}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title={t("leads.deleteLead")}
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                {t("leads.pagination.previous")}
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                {t("leads.pagination.next")}
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t("leads.pagination.showing")}{" "}
                  <span className="font-medium">
                    {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                  </span>{" "}
                  {t("leads.pagination.to")}{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.currentPage * pagination.itemsPerPage,
                      pagination.totalItems
                    )}
                  </span>{" "}
                  {t("leads.pagination.of")}{" "}
                  <span className="font-medium">{pagination.totalItems}</span>{" "}
                  {t("leads.pagination.results")}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                        page === pagination.currentPage
                          ? "z-10 bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400"
                          : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-60 overflow-y-auto w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto p-4 sm:p-6 border w-full max-w-2xl shadow-xl rounded-2xl bg-white dark:bg-gray-800 max-h-[90vh] overflow-y-auto border-gray-100 dark:border-gray-700">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {modalMode === "create"
                    ? t("leads.form.createNewLead")
                    : modalMode === "edit"
                    ? t("leads.form.editLead")
                    : t("leads.form.viewLead")}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information Section */}
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    {t("leads.form.personalInformation")}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("leads.form.firstName")} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder={t("leads.form.enterFirstName")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("leads.form.lastName")} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder={t("leads.form.enterLastName")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("leads.form.email")} *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder={t("leads.form.enterEmail")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("leads.form.phone")}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder={t("leads.form.enterPhone")}
                      />
                    </div>
                  </div>
                </div>

                {/* Company Information Section */}
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-green-600" />
                    {t("leads.form.company")} {t("common.information")}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("leads.form.company")}
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder={t("leads.form.enterCompany")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("leads.form.position")}
                      </label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) =>
                          setFormData({ ...formData, position: e.target.value })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder={t("leads.form.enterPosition")}
                      />
                    </div>
                  </div>
                </div>

                {/* Lead Management Section */}
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-purple-600" />
                    {t("leads.leadManagement")}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("leads.leadSource")}
                      </label>
                      <select
                        value={formData.sourceId || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sourceId: parseInt(e.target.value) || undefined,
                          })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">
                          {t("leads.form.selectLeadSource")}
                        </option>
                        {leadSources.map((source) => (
                          <option key={source.id} value={source.id}>
                            {source.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("leads.form.status")}
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as any,
                          })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("leads.form.assignedTo")}
                    </label>
                    <select
                      value={formData.assignedTo || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assignedTo: parseInt(e.target.value),
                        })
                      }
                      disabled={modalMode === "view"}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">
                        {t("leads.form.selectAssignedUser")}
                      </option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("leads.form.notes")}
                    </label>
                    <textarea
                      rows={4}
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      disabled={modalMode === "view"}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                      placeholder={t("leads.form.enterNotes")}
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("leads.form.tags")}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <label
                          key={tag.id}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.tags.includes(tag.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  tags: [...formData.tags, tag.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  tags: formData.tags.filter(
                                    (id) => id !== tag.id
                                  ),
                                });
                              }
                            }}
                            disabled={modalMode === "view"}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span
                            className="px-2 py-1 text-xs rounded-full text-white"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {modalMode !== "view" && (
                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      {modalMode === "create"
                        ? t("leads.addLead")
                        : t("common.update")}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

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
