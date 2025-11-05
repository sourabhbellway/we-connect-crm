import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCounts } from "../contexts/CountsContext";
import {
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Eye,
  Search,
  Upload,
  FileDown,
  RefreshCw,
  ArrowRightLeft,
  ChevronDown,
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
import MetaBar from "./list/MetaBar";
import ListToolbar from "./list/ListToolbar";
import TableSortHeader from "./list/TableSortHeader";

// Add getStatusColor function that was missing
const getStatusColor = (status: string) => {
  const statusOptions = [
    {
      value: "new",
      label: "New",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    },
    {
      value: "contacted",
      label: "Contacted",
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    },
    {
      value: "qualified",
      label: "Qualified",
      color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    },
    {
      value: "proposal",
      label: "Proposal",
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    },
    {
      value: "negotiation",
      label: "Negotiation",
      color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    },
    {
      value: "closed",
      label: "Closed",
      color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    },
    {
      value: "lost",
      label: "Lost",
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    },
    {
      value: "converted",
      label: "Converted",
      color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
  ];
  
  const statusOption = statusOptions.find(
    (option) => option.value === status
  );
  return statusOption?.color || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
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

  // Simple client-side sorting for current list view
  type LeadSortBy = 'name' | 'email' | 'phone' | 'company' | 'status' | 'createdAt';
  const [sortBy, setSortBy] = useState<LeadSortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const onHeaderSort = (col: LeadSortBy) => {
    setSortBy(prev => {
      if (prev === col) { setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); return prev; }
      setSortOrder('asc');
      return col;
    });
  };
  const sortedLeads = React.useMemo(() => {
    const arr = [...leads];
    const dir = sortOrder === 'asc' ? 1 : -1;
    const val = (l: Lead) => {
      switch (sortBy) {
        case 'name': return `${l.firstName} ${l.lastName}`.toLowerCase();
        case 'email': return l.email?.toLowerCase() || '';
        case 'phone': return l.phone || '';
        case 'company': return l.company?.toLowerCase() || '';
        case 'status': return l.status || '';
        case 'createdAt': default: return l.createdAt || '';
      }
    };
    return arr.sort((a,b) => String(val(a)).localeCompare(String(val(b))) * dir);
  }, [leads, sortBy, sortOrder]);

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

      const list = response?.data?.leads ?? response?.data?.items ?? [];
      setLeads(list);
      const pag = response?.data?.pagination ?? (response?.data?.total != null
        ? {
            totalItems: response.data.total,
            currentPage: response.data.page ?? 1,
            pageSize: response.data.limit ?? list.length ?? 0,
            totalPages: Math.ceil((response.data.total || 0) / (response.data.limit || 1)),
          }
        : null);
      setPagination(pag as any);
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
        lead.id === leadId ? { ...lead, status: newStatus as Lead['status'] } : lead
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
      // Ensure dealData.status is properly typed
      const typedConversionData: ConversionData = {
        ...conversionData,
        dealData: {
          ...conversionData.dealData,
          status: conversionData.dealData?.status as "DRAFT" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST" | undefined,
        },
      };
      await leadService.convertLead(leadToConvert.id, typedConversionData);
      
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
          const typedConversionData: ConversionData = {
            ...conversionData,
            dealData: {
              ...conversionData.dealData,
              status: conversionData.dealData?.status as "DRAFT" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST" | undefined,
            },
          };
          await leadService.convertLeadForce(leadToConvert.id, typedConversionData);
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
            const typedConversionData: ConversionData = {
              ...conversionData,
              dealData: {
                ...conversionData.dealData,
                status: conversionData.dealData?.status as "DRAFT" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST" | undefined,
              },
            };
            await leadService.convertLead(leadToConvert.id, typedConversionData);
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
        <ListToolbar
          title="Leads"
          subtitle="Capture and manage your incoming opportunities"
          addLabel="Add Lead"
          onAdd={handleCreateLead}
          bulkActions={[
            { label: 'Download Template', onClick: handleDownloadTemplate, icon: <FileDown className="w-4 h-4" /> },
            { label: 'Import Leads', onClick: () => setShowImportModal(true), icon: <Upload className="w-4 h-4" /> },
            { label: 'Export Leads', onClick: handleExportLeads, icon: <FileDown className="w-4 h-4" />, disabled: isExporting },
            { label: 'Sync Integrations', onClick: handleSyncIntegrations, icon: <RefreshCw className="w-4 h-4" />, disabled: isSyncingIntegrations },
          ]}
        />
        {/* Mobile-first responsive layout */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Search */}
          <div className="">
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
                  <span className="ml-2 text-gray-500 dark:text-gray-400">
                    • Showing {leads?.length ?? 0} of {pagination.totalItems} leads
                    {pagination.totalPages > 1 &&
                      ` • Page ${pagination.currentPage} of ${pagination.totalPages}`}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <MetaBar
              currentPage={pagination.currentPage}
              itemsPerPage={pagination.itemsPerPage || filters.limit || 10}
              totalItems={pagination.totalItems || leads.length}
              onItemsPerPageChange={(n) => handleFilterChange('limit', n)}
            />
          </div>
          <div className="overflow-hidden relative">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 mobile-card-view table-fixed">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <TableSortHeader label={t("leads.table.lead") as string} column={'name'} sortBy={sortBy} sortOrder={sortOrder} onChange={(c:any)=>onHeaderSort(c)} />
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <TableSortHeader label={t("leads.form.email") as string} column={'email'} sortBy={sortBy} sortOrder={sortOrder} onChange={(c:any)=>onHeaderSort(c)} />
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <TableSortHeader label="Phone" column={'phone'} sortBy={sortBy} sortOrder={sortOrder} onChange={(c:any)=>onHeaderSort(c)} />
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <TableSortHeader label={t("leads.table.company") as string} column={'company'} sortBy={sortBy} sortOrder={sortOrder} onChange={(c:any)=>onHeaderSort(c)} />
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center justify-center">
                        <TableSortHeader label={t("leads.table.status") as string} column={'status'} sortBy={sortBy} sortOrder={sortOrder} onChange={(c:any)=>onHeaderSort(c)} />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("leads.table.assignedTo")}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <TableSortHeader label={t("leads.table.created") as string} column={'createdAt'} sortBy={sortBy} sortOrder={sortOrder} onChange={(c:any)=>onHeaderSort(c)} />
                    </th>
                    <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("leads.table.actions")}
                    </th>
                  </tr>
                </thead>
                {loading ? (
                  <TableLoader rows={8} columns={8} />
                ) : (
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
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
                    sortedLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap" data-label="Lead">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#EF444E] to-[#ff5a64] flex items-center justify-center">
                                <span className="text-white font-medium text-sm leading-none">
                                  {lead.firstName?.[0] || ''}
                                  {lead.lastName?.[0] || ''}
                                </span>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                <button
                                  onClick={() => handleViewLead(lead)}
                                  className="hover:underline hover:text-[#ef444e] text-left truncate"
                                >
                                  {lead.firstName} {lead.lastName}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" data-label="Email">
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{lead.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" data-label="Phone">
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span>{lead.phone || '-'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" data-label="Company">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {lead.company || "-"}
                          </div>
                          {lead.position && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                              <Briefcase className="h-3 w-3 flex-shrink-0" />
                              <span>{lead.position}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center" data-label="Status">
                          <div className="relative inline-flex items-center justify-center">
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                              disabled={updatingStatus[lead.id]}
                              style={{ WebkitAppearance: 'none', backgroundImage: 'none', lineHeight: '1.5', textAlign: 'center', textAlignLast: 'center' }}
                              className={`pr-5 pl-3 text-xs font-semibold rounded-full py-1 border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 text-center leading-tight ${
                                getStatusColor(lead.status)
                              }`}
                            >
                              {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 text-blue-800/80 dark:text-blue-300/80" />
                            {updatingStatus[lead.id] && (
                              <div className="absolute right-1 top-1 w-3 h-3">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" data-label="Assigned to">
                          {lead.assignedUser
                            ? `${lead.assignedUser.firstName} ${lead.assignedUser.lastName}`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" data-label="Created">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium" data-label="Actions">
                          <div className="flex items-center justify-end gap-2">
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
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
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
        onConvert={async (data) => {
          await handleConvertLead(data as ConversionData);
        }}
        lead={leadToConvert}
        isConverting={isConverting}
      />
    </div>
  );
};

export default Leads;
