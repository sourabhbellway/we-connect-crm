import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCounts } from "../contexts/CountsContext";
import {
  Plus,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { leadService, Lead, LeadFilters } from "../services/leadService";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";
import SearchInput from "./SearchInput";
import DropdownFilter from "./DropdownFilter";
import { useDebouncedSearch } from "../hooks/useDebounce";
import Pagination from "./Pagination";
import NoResults from "./NoResults";
import TableLoader from "./TableLoader";

// Add getStatusColor function that was missing
const getStatusColor = (status: string) => {
  const statusOptions = [
    {
      value: "new",
      label: "New",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "contacted",
      label: "Contacted",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "qualified",
      label: "Qualified",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "proposal",
      label: "Proposal",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "negotiation",
      label: "Negotiation",
      color: "bg-orange-100 text-orange-800",
    },
    {
      value: "closed",
      label: "Closed",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "lost",
      label: "Lost",
      color: "bg-red-100 text-red-800",
    },
  ];
  
  const statusOption = statusOptions.find(
    (option) => option.value === status
  );
  return statusOption?.color || "bg-gray-100 text-gray-800";
};
const Leads: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refreshLeadsCount } = useCounts();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  

  // Pagination states - separate from filters for consistency with Users
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounced search with 500ms delay for better UX
  const { searchValue, debouncedSearchValue, setSearch, isSearching } =
    useDebouncedSearch("", 500);

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
  }, [debouncedSearchValue, filters.status, filters.limit, currentPage]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await leadService.getLeads({
        ...filters,
        page: currentPage,
        search: debouncedSearchValue,
      });

      setLeads(response.data.leads);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err: any) {
      const message = err?.response?.data?.message || t("leads.fetchError");
      setError(message);
      toast.error(message, { toastId: "leads_fetch_error" });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    key: keyof LeadFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the table
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateLead = () => {
    navigate("/leads/new");
  };

  const handleEditLead = (lead: Lead) => {
    navigate(`/leads/${lead.id}/edit`);
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
      await refreshLeadsCount();
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


  // Dynamic empty-state description similar to Users
  const isSearchActive = !!debouncedSearchValue;
  const isStatusActive = !!filters.status;
  const noResultsDescription = isSearchActive && isStatusActive
    ? "No leads match your search and filters. Try adjusting your filters or search terms. You can also clear all filters to see all leads."
    : isSearchActive
    ? "No leads found for your search. Try adjusting your search terms. You can also clear all filters to see all leads."
    : isStatusActive
    ? "No leads found for the selected filters. Try adjusting your filters or clear all filters to see all leads."
    : "No leads found.";

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: filters.limit || 10,
      status: undefined,
    });
    setCurrentPage(1);
    setSearch("");
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="space-y-4">
        {/* Mobile-first responsive layout */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          {/* Filters - Stack on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <div className="flex items-center gap-2">
                  {t("common.search")}
                  {isSearching && (
                    <div className="flex items-center gap-1 text-xs text-blue-500">
                      <Search className="h-3 w-3 animate-pulse" />
                      <span>Searching...</span>
                    </div>
                  )}
                </div>
              </label>
              <SearchInput
                value={searchValue}
                onChange={handleSearch}
                placeholder={t("leads.searchLeads")}
              />
            </div>

            {/* Status */}
            <div className="w-full sm:w-48">
              <DropdownFilter
                label={t("leads.form.status")}
                value={filters.status || ""}
                onChange={(value) =>
                  handleFilterChange("status", value as string)
                }
                options={[
                  { value: "", label: t("leads.form.allStatuses") },
                  ...statusOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                  })),
                ]}
              />
            </div>

            {/* Items Per Page */}
            <div className="w-full sm:w-48">
              <DropdownFilter
                label={t("leads.form.itemsPerPage")}
                value={String(filters.limit || 10)}
                onChange={(value) => handleFilterChange("limit", Number(value))}
                options={[
                  { value: "5", label: "5" },
                  { value: "10", label: "10" },
                  { value: "20", label: "20" },
                  { value: "50", label: "50" },
                ]}
              />
            </div>
          </div>

          {/* Add Lead button - Full width on mobile, auto on desktop */}
          <button
            onClick={handleCreateLead}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-3 bg-[#ef444e] text-white rounded-full hover:bg-[#f26971] transition-colors text-sm font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("leads.addLead")}
          </button>
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("leads.form.allLeads")} {pagination && `(${pagination.totalItems})`}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage and track your leads
                {pagination && (
                  <span className="ml-2 text-gray-500">
                    • Showing {leads.length} of {pagination.totalItems} leads
                    {pagination.totalPages > 1 &&
                      ` • Page ${pagination.currentPage} of ${pagination.totalPages}`}
                  </span>
                )}
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400"></div>
          </div>

        

          <div className="overflow-hidden relative">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("leads.table.lead")}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("leads.form.email")}
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
                {loading ? (
                  <TableLoader rows={8} columns={7} />
                ) : (
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <NoResults
                          title={error ? "Network or server error" : "No leads found"}
                          description={error ? (typeof error === 'string' ? error : String(error)) : noResultsDescription}
                          icon={<User className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
                          showClearButton={!error && (isSearchActive || isStatusActive)}
                          onClear={!error ? clearFilters : undefined}
                          isError={!!error}
                        />
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#EF444E] to-[#ff5a64] flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {lead.firstName[0]}
                                  {lead.lastName[0]}
                                </span>
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
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {lead.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {lead.assignedUser
                            ? `${lead.assignedUser.firstName} ${lead.assignedUser.lastName}`
                            : "-"}
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
                              onClick={() => handleEditLead(lead)}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title={t("common.edit")}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => requestDeleteLead(lead)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title={t("common.delete")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                )}
              </table>
            </div>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            onPageChange={handlePageChange}
            itemsPerPage={pagination.itemsPerPage || filters.limit || 10}
          />
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