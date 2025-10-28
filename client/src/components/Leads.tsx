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
  Eye,
  Search,
  Download,
  Upload,
  FileDown,
  RefreshCw,
  ArrowRightLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { leadService, Lead, LeadFilters, ConversionData } from "../services/leadService";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";
import LeadConversionModal from "./LeadConversionModal";
import SearchInput from "./SearchInput";
import DropdownFilter from "./DropdownFilter";
import { useDebouncedSearch } from "../hooks/useDebounce";
import Pagination from "./Pagination";
import NoResults from "./NoResults";
import TableLoader from "./TableLoader";
import { STORAGE_KEYS } from "../constants";

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
    {
      value: "converted",
      label: "Converted",
      color: "bg-emerald-100 text-emerald-800",
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
  const { refreshLeadsCount, refreshContactsCount, refreshDealsCount } = useCounts();
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
  
  // Conversion modal states
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  
  // Bulk import/export states
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncingIntegrations, setIsSyncingIntegrations] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showBulkMenu, setShowBulkMenu] = useState(false);

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
    {
      value: "converted",
      label: t("leads.status.converted"),
      color: "bg-emerald-100 text-emerald-800",
    },
  ];

  const isSearchActive = !!debouncedSearchValue;
  const isStatusActive = !!filters.status;

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

  const handleViewLead = (lead: Lead) => {
    navigate(`/leads/${lead.id}`);
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

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: filters.limit || 10,
      status: undefined,
    });
    setCurrentPage(1);
    setSearch("");
  };

  // Quick status change functionality
  const [updatingStatus, setUpdatingStatus] = useState<{[key: number]: boolean}>({});
  
  const handleStatusChange = async (leadId: number, newStatus: string) => {
    setUpdatingStatus(prev => ({ ...prev, [leadId]: true }));
    try {
      await leadService.updateLeadStatus(leadId, newStatus);
      
      // Update the leads array locally
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
      
      await refreshLeadsCount();
      toast.success('Lead status updated successfully');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to update status';
      toast.error(message);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [leadId]: false }));
    }
  };

  // Bulk import/export functions
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/leads/bulk/csv-template', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to download template');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('CSV template downloaded successfully');
    } catch (error) {
      toast.error('Failed to download CSV template');
    }
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setImportFile(file);
    }
  };

  const handleBulkImport = async () => {
    if (!importFile) {
      toast.error('Please select a CSV file to import');
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('csvFile', importFile);

      const response = await fetch('/api/leads/bulk/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Import failed');
      }

      toast.success(result.message || 'Import completed successfully');
      setShowImportModal(false);
      setImportFile(null);
      fetchLeads();
      refreshLeadsCount();
    } catch (error: any) {
      toast.error(error.message || 'Failed to import leads');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportLeads = async () => {
    setIsExporting(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (debouncedSearchValue) queryParams.append('search', debouncedSearchValue);
      
      const response = await fetch(`/api/leads/bulk/export?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to export leads');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Leads exported successfully');
    } catch (error) {
      toast.error('Failed to export leads');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSyncIntegrations = async () => {
    setIsSyncingIntegrations(true);
    try {
      const response = await fetch('/api/leads/integrations/sync-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Sync failed');
      }

      toast.success('Integrations synced successfully');
      fetchLeads();
      refreshLeadsCount();
    } catch (error: any) {
      toast.error(error.message || 'Failed to sync integrations');
    } finally {
      setIsSyncingIntegrations(false);
    }
  };

  // Lead conversion functions
  const requestConvertLead = (lead: Lead) => {
    // Allow reconversion even if status is 'converted'
    if (lead.status === 'converted') {
      toast.info('This lead was already converted. You can reconvert; we will handle it automatically.');
    }
    setLeadToConvert(lead);
    setShowConversionModal(true);
  };

  const handleConvertLead = async (conversionData: ConversionData) => {
    if (!leadToConvert) return;
    
    setIsConverting(true);
    try {
      const response = await leadService.convertLead(leadToConvert.id, conversionData);
      
      toast.success('Lead converted successfully!');
      setShowConversionModal(false);
      setLeadToConvert(null);
      
      // Refresh the leads list and all related counts
      fetchLeads();
      await Promise.all([
        refreshLeadsCount(),
        refreshContactsCount(),
        refreshDealsCount()
      ]);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to convert lead';
      const alreadyConverted = /already\s*converted/i.test(message) || err?.response?.status === 409;
      if (alreadyConverted && leadToConvert) {
        try {
          // Try force conversion
          const forceRes = await leadService.convertLeadForce(leadToConvert.id, conversionData);
          toast.success('Lead converted successfully!');
          setShowConversionModal(false);
          setLeadToConvert(null);
          fetchLeads();
          await Promise.all([
            refreshLeadsCount(),
            refreshContactsCount(),
            refreshDealsCount()
          ]);
          return;
        } catch (forceErr: any) {
          // Reset status then retry once
          try {
            await leadService.updateLeadStatus(leadToConvert.id, 'qualified');
            const retryRes = await leadService.convertLead(leadToConvert.id, conversionData);
            toast.success('Lead converted successfully!');
            setShowConversionModal(false);
            setLeadToConvert(null);
            fetchLeads();
            await Promise.all([
              refreshLeadsCount(),
              refreshContactsCount(),
              refreshDealsCount()
            ]);
            return;
          } catch (retryErr: any) {
            const m = retryErr?.response?.data?.message || forceErr?.response?.data?.message || message;
            toast.error(m);
          }
        }
      } else {
        toast.error(message);
      }
    } finally {
      setIsConverting(false);
    }
  };

  // Dynamic empty-state description similar to Users
  const noResultsDescription = isSearchActive && isStatusActive
    ? "No leads match your search and filters. Try adjusting your filters or search terms. You can also clear all filters to see all leads."
    : isSearchActive
    ? "No leads found for your search. Try adjusting your search terms. You can also clear all filters to see all leads."
    : isStatusActive
    ? "No leads found for the selected filters. Try adjusting your filters or clear all filters to see all leads."
    : "No leads found.";

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="space-y-4">
        {/* Mobile-first responsive layout */}
        <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-4">
          {/* Filters - Responsive grid to avoid overflow on 13" screens */}
<div className="filters-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4 flex-1 min-w-0">
            {/* Search */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <div className="flex items-center gap-2">
                  {t("common.search")}
                  {isSearching && (
                    <span className="text-xs text-blue-500 flex items-center gap-1">
                      <Search className="h-3 w-3" />
                      Searching...
                    </span>
                  )}
                </div>
              </label>
              <SearchInput
                value={searchValue}
                onChange={handleSearch}
                placeholder={t("leads.searchLeads")}
                className="max-w-full"
              />
            </div>

            {/* Status */}
            <div className="w-full sm:w-48 sm:min-w-[220px]">
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
            <div className="w-full sm:w-48 sm:min-w-[200px]">
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

          {/* Action buttons - Full width on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Bulk operations dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowBulkMenu(!showBulkMenu)}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Bulk Actions
              </button>
              {showBulkMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <div className="py-1">
                  <button
                    onClick={() => {
                      handleDownloadTemplate();
                      setShowBulkMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </button>
                  <button
                    onClick={() => {
                      setShowImportModal(true);
                      setShowBulkMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Leads
                  </button>
                  <button
                    onClick={() => {
                      handleExportLeads();
                      setShowBulkMenu(false);
                    }}
                    disabled={isExporting}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExporting ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileDown className="h-4 w-4 mr-2" />
                    )}
                    Export Leads
                  </button>
                  <hr className="my-1 border-gray-200 dark:border-gray-600" />
                  <button
                    onClick={() => {
                      handleSyncIntegrations();
                      setShowBulkMenu(false);
                    }}
                    disabled={isSyncingIntegrations}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSyncingIntegrations ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Sync Integrations
                  </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Add Lead button */}
            <button
              onClick={handleCreateLead}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-3 bg-[#ef444e] text-white rounded-lg hover:bg-[#f26971] transition-colors text-sm font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("leads.addLead")}
            </button>
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700  transition-all duration-300">
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
                          <div className="relative">
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                              disabled={updatingStatus[lead.id]}
                              className={`text-xs font-semibold rounded-full px-2 py-1 border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${
                                getStatusColor(lead.status)
                              }`}
                            >
                              {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {updatingStatus[lead.id] && (
                              <div className="absolute right-1 top-1 w-3 h-3">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                              </div>
                            )}
                          </div>
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
                              onClick={() => handleViewLead(lead)}
                              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                              title="View Lead"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {lead.status !== 'converted' && (
                              <button
                                onClick={() => requestConvertLead(lead)}
                                className="text-purple-600 hover:text-purple-900 p-1 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                                title="Convert Lead"
                              >
                                <ArrowRightLeft className="h-4 w-4" />
                              </button>
                            )}
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
      
      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Import Leads from CSV
                </h3>
                <button
                  onClick={() => {
                    if (!isImporting) {
                      setShowImportModal(false);
                      setImportFile(null);
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  disabled={isImporting}
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="mb-2">Upload a CSV file to import multiple leads at once.</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Use our template for best results</li>
                    <li>Required columns: firstName, lastName, email</li>
                    <li>Maximum file size: 10MB</li>
                    <li>Duplicate emails will be skipped</li>
                  </ul>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportFile}
                    disabled={isImporting}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  />
                  {importFile && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                      Selected: {importFile.name}
                    </p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportFile(null);
                    }}
                    disabled={isImporting}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkImport}
                    disabled={!importFile || isImporting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Leads
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Lead Conversion Modal */}
      <LeadConversionModal
        isOpen={showConversionModal}
        onClose={() => {
          if (isConverting) return;
          setShowConversionModal(false);
          setLeadToConvert(null);
        }}
        onConvert={handleConvertLead}
        lead={leadToConvert}
        isConverting={isConverting}
      />
    </div>
  );
};

export default Leads;
