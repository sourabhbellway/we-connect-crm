import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
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
    LayoutList,
    LayoutGrid,
    MoreVertical,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { leadService, Lead, LeadFilters, ConversionData } from "../services/leadService";
import { businessSettingsService } from "../features/business-settings/services/businessSettingsService";
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

const LeadActionMenu = ({
    lead,
    onView,
    onEdit,
    onDelete,
    onConvert,
    isConverted
}: {
    lead: Lead;
    onView: (lead: Lead) => void;
    onEdit: (lead: Lead) => void;
    onDelete: (lead: Lead) => void;
    onConvert: (lead: Lead) => void;
    isConverted: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                // Check if click is inside the portal menu (we can identify it by class or ref, but simple outside check is okay if we don't ref the portal content easily)
                // Actually easier: just close if click is anywhere in window and we didn't click the button
                // But we need to allow clicks INSIDE the menu.
                const target = event.target as Element;
                if (!target.closest('.action-menu-dropdown')) {
                    setIsOpen(false);
                }
            }
        };

        if (isOpen) {
            window.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', () => setIsOpen(false), true); // Close on scroll
            window.addEventListener('resize', () => setIsOpen(false));
        }
        return () => {
            window.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', () => setIsOpen(false), true);
            window.removeEventListener('resize', () => setIsOpen(false));
        };
    }, [isOpen]);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Calculate position: align right edge of menu with right edge of button
            // Menu width is roughly 192px (w-48)
            const menuWidth = 192;
            let left = rect.right - menuWidth;
            let top = rect.bottom + 4;

            // Check if it goes off screen left
            if (left < 0) left = rect.left;

            // Check bottom edge
            if (top + 200 > window.innerHeight) {
                top = rect.top - 200; // open upwards if close to bottom
            }

            setMenuStyle({
                position: 'fixed',
                top: `${top}px`,
                left: `${left}px`,
                zIndex: 9999,
                width: `${menuWidth}px`
            });
        }
        setIsOpen(!isOpen);
    };

    return (
        <>
            <button
                ref={buttonRef}
                onClick={handleToggle}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                <MoreVertical className="h-4 w-4" />
            </button>

            {isOpen && ReactDOM.createPortal(
                <div
                    className="bg-white dark:bg-gray-800 rounded-md shadow-xl border border-gray-200 dark:border-gray-700 py-1 action-menu-dropdown"
                    style={menuStyle}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onView(lead);
                            setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2.5"
                    >
                        <Eye className="h-4 w-4 text-gray-400" />
                        {t("common.view") || "View"}
                    </button>
                    {!isConverted && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onConvert(lead);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2.5"
                        >
                            <ArrowRightLeft className="h-4 w-4 text-purple-500" />
                            {t("leads.convertLead") || "Convert"}
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(lead);
                            setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2.5"
                    >
                        <Edit className="h-4 w-4 text-blue-500" />
                        {t("common.edit") || "Edit"}
                    </button>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(lead);
                            setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2.5"
                    >
                        <Trash2 className="h-4 w-4" />
                        {t("common.delete") || "Delete"}
                    </button>
                </div>,
                document.body
            )}
        </>
    );
};

const Leads: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { refreshLeadsCount, refreshDealsCount } = useCounts();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
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

    // Column visibility state
    const [visibleColumns, setVisibleColumns] = useState<string[]>([
        'name',
        'email',
        'phone',
        'company',
        'status',
        'assignedTo',
        'createdAt',
    ]);

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

    // Bulk assign states
    const [selectedLeadIds, setSelectedLeadIds] = useState<Set<number>>(new Set());
    const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
    const [assignToUserId, setAssignToUserId] = useState<string>('');
    const [users, setUsers] = useState<Array<{ id: number; firstName: string; lastName: string }>>([]);
    const [isBulkAssigning, setIsBulkAssigning] = useState(false);
    const [fieldConfigs, setFieldConfigs] = useState<any[]>([]);

    // Debounced search with 500ms delay for better UX
    const { searchValue, debouncedSearchValue, setSearch, isSearching } =
        useDebouncedSearch("", 500);

    // Debounced email search
    const {
        searchValue: emailSearchValue,
        debouncedSearchValue: debouncedEmailSearchValue,
        setSearch: setEmailSearch,
        isSearching: isSearchingEmail
    } = useDebouncedSearch("", 500);

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

    const isSearchActive = !!debouncedSearchValue || !!debouncedEmailSearchValue;
    const isStatusActive = !!filters.status || !!filters.assignedTo;

    const isColumnVisible = (id: string) => visibleColumns.includes(id);

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
        return arr.sort((a, b) => String(val(a)).localeCompare(String(val(b))) * dir);
    }, [leads, sortBy, sortOrder]);

    useEffect(() => {
        fetchLeads();
    }, [debouncedSearchValue, debouncedEmailSearchValue, filters.status, filters.assignedTo, filters.limit, currentPage]);

    useEffect(() => {
        const fetchFieldConfigs = async () => {
            try {
                const response = await businessSettingsService.getFieldConfigs('lead');
                if (response.success) {
                    setFieldConfigs(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch field configs:', error);
            }
        };
        fetchFieldConfigs();

        window.addEventListener('fieldConfigsUpdated', fetchFieldConfigs);
        return () => window.removeEventListener('fieldConfigsUpdated', fetchFieldConfigs);
    }, []);

    // Load column visibility preferences
    useEffect(() => {
        try {
            const stored = localStorage.getItem('leads_visible_columns');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.every((c) => typeof c === 'string')) {
                    setVisibleColumns(parsed);
                }
            }
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('leads_visible_columns', JSON.stringify(visibleColumns));
        } catch {
            // ignore
        }
    }, [visibleColumns]);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const response = await leadService.getLeads({
                ...filters,
                page: currentPage,
                search: debouncedSearchValue,
                email: debouncedEmailSearchValue,
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
            assignedTo: undefined,
        });
        setCurrentPage(1);
        setSearch("");
        setEmailSearch("");
    };

    // Quick status change functionality
    const [updatingStatus, setUpdatingStatus] = useState<{ [key: number]: boolean }>({});

    const handleStatusChange = async (leadId: number, newStatus: string) => {
        setUpdatingStatus(prev => ({ ...prev, [leadId]: true }));
        try {
            // Check if status change should trigger conversion
            const shouldConvert = newStatus === 'closed' || newStatus === 'converted';

            if (shouldConvert) {
                // Find the lead to trigger conversion modal
                const lead = leads.find(l => l.id === leadId);
                if (!lead) {
                    throw new Error('Lead not found');
                }

                // Trigger the conversion modal instead of direct conversion
                setLeadToConvert(lead);
                setShowConversionModal(true);
            } else {
                // Regular status update
                await leadService.updateLeadStatus(leadId, newStatus);

                // Update the leads array locally
                setLeads(prev => prev.map(lead =>
                    lead.id === leadId ? { ...lead, status: newStatus as Lead['status'] } : lead
                ));

                toast.success('Lead status updated successfully');
            }

            await refreshLeadsCount();
            await refreshDealsCount();
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to update status';
            toast.error(message);
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [leadId]: false }));
        }
    };

    // Bulk selection handlers
    const handleSelectLead = (leadId: number) => {
        const newSelected = new Set(selectedLeadIds);
        if (newSelected.has(leadId)) {
            newSelected.delete(leadId);
        } else {
            newSelected.add(leadId);
        }
        setSelectedLeadIds(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedLeadIds.size === leads.length) {
            setSelectedLeadIds(new Set());
        } else {
            setSelectedLeadIds(new Set(leads.map(lead => lead.id)));
        }
    };

    const handleBulkAssign = async () => {
        if (!assignToUserId) {
            toast.error('Please select a user to assign to');
            return;
        }

        if (selectedLeadIds.size === 0) {
            toast.error('Please select at least one lead to assign');
            return;
        }

        setIsBulkAssigning(true);
        try {
            const leadIdArray = Array.from(selectedLeadIds);
            const userId = assignToUserId === 'unassigned' ? null : parseInt(assignToUserId);

            await leadService.bulkAssignLeads(leadIdArray, userId);

            // Update leads locally
            setLeads(prev => prev.map(lead =>
                selectedLeadIds.has(lead.id)
                    ? { ...lead, assignedTo: userId ?? undefined }
                    : lead
            ));

            setSelectedLeadIds(new Set());
            setShowBulkAssignModal(false);
            setAssignToUserId('');
            await refreshLeadsCount();

            toast.success(`Successfully assigned ${leadIdArray.length} leads`);
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to bulk assign leads';
            toast.error(message);
        } finally {
            setIsBulkAssigning(false);
        }
    };

    // Fetch users for assignment
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { userService } = await import('../services/userService');
                const response = await userService.getUsers({ page: 1, limit: 100 });
                const userList = response?.data?.users || response?.data || response?.users || [];
                setUsers(userList.map((u: any) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName })));
            } catch (err) {
                console.error('Failed to fetch users:', err);
            }
        };

        fetchUsers();
    }, []);

    // Bulk import/export functions
    const handleDownloadTemplate = () => {
        try {
            let headers = [];

            if (fieldConfigs && fieldConfigs.length > 0) {
                // Use field configs to generate headers
                headers = fieldConfigs
                    .filter(field => field.isVisible)
                    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                    .map(field => field.fieldName);
            } else {
                // Fallback to default headers if configs are not loaded
                headers = [
                    'firstName',
                    'lastName',
                    'email',
                    'phone',
                    'company',
                    'position',
                    'status',
                    'website',
                    'industry',
                    'companySize',
                    'annualRevenue',
                    'budget',
                    'currency',
                    'priority',
                    'leadScore',
                    'address',
                    'city',
                    'state',
                    'country',
                    'zipCode',
                    'linkedinProfile',
                    'timezone',
                    'preferredContactMethod',
                    'notes'
                ];
            }
            const csvContent = headers.join(',') + '\n';
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
            toast.error('Failed to generate CSV template');
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

            // Check content type to ensure we're getting JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // If not JSON, it's likely an error page (HTML)
                const text = await response.text();
                if (text.includes('<!DOCTYPE')) {
                    throw new Error('Server returned an error page. Please check the server logs.');
                }
                throw new Error('Invalid response format from server');
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Import failed');
            }

            // Show detailed import results
            if (result.data?.errors && result.data.errors.length > 0) {
                const errorMsg = result.data.errors.slice(0, 3).map((e: any) => `Row ${e.row}: ${e.error}`).join('\n');
                toast.warning(`${result.data?.message}\n\n${errorMsg}`, { autoClose: 5000 });
            } else {
                toast.success(result.data?.message || result.message || 'Import completed successfully');
            }

            setShowImportModal(false);
            setImportFile(null);
            fetchLeads();
            refreshLeadsCount();
        } catch (error: any) {
            console.error('Import error:', error);
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
                    status: conversionData.dealData?.status as string | undefined,
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
                            status: conversionData.dealData?.status as string | undefined,
                        },
                    };
                    await leadService.convertLeadForce(leadToConvert.id, typedConversionData);
                    toast.success('Lead converted successfully!');
                    setShowConversionModal(false);
                    setLeadToConvert(null);
                    fetchLeads();
                    await Promise.all([
                        refreshLeadsCount(),
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
                                status: conversionData.dealData?.status as string | undefined,
                            },
                        };
                        await leadService.convertLead(leadToConvert.id, typedConversionData);
                        toast.success('Lead converted successfully!');
                        setShowConversionModal(false);
                        setLeadToConvert(null);
                        fetchLeads();
                        await Promise.all([
                            refreshLeadsCount(),
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
    const noResultsDescription = isSearchActive || isStatusActive
        ? "No leads match your search and filters. Try adjusting your filters or search terms. You can also clear all filters to see all leads."
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
                    actions={[
                        { label: 'Sync Integrations', onClick: handleSyncIntegrations, icon: <RefreshCw className="w-4 h-4" />, loading: isSyncingIntegrations },
                    ]}
                    bulkActions={[
                        { label: 'Download Template', onClick: handleDownloadTemplate, icon: <FileDown className="w-4 h-4" /> },
                        { label: 'Import Leads', onClick: () => setShowImportModal(true), icon: <Upload className="w-4 h-4" /> },
                        { label: 'Export Leads', onClick: handleExportLeads, icon: <FileDown className="w-4 h-4" />, disabled: isExporting },
                        ...(selectedLeadIds.size > 0 ? [
                            { label: `Bulk Assign (${selectedLeadIds.size})`, onClick: () => setShowBulkAssignModal(true), icon: <User className="w-4 h-4" /> }
                        ] : [])
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

                    {/* Email Search */}
                    <div className="">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <div className="flex items-center gap-2">
                                Email Search
                                {isSearchingEmail && (
                                    <span className="text-xs text-blue-500 flex items-center gap-1">
                                        <Search className="h-3 w-3" />
                                        Searching...
                                    </span>
                                )}
                            </div>
                        </label>
                        <SearchInput
                            value={emailSearchValue}
                            onChange={(val) => {
                                setEmailSearch(val);
                                setCurrentPage(1);
                            }}
                            placeholder="Search by email..."
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

                    {/* Assigned To */}
                    <div className="w-full sm:w-48 sm:min-w-[220px]">
                        <DropdownFilter
                            label="Assigned To"
                            value={filters.assignedTo?.toString() || ""}
                            onChange={(value) =>
                                handleFilterChange("assignedTo", value === "" ? "" : Number(value))
                            }
                            options={[
                                { value: "", label: "All Users" },
                                ...users.map((u) => ({
                                    value: u.id.toString(),
                                    label: `${u.firstName} ${u.lastName}`,
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

                {/* View toggle - Right aligned */}
                <div className="hidden sm:flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 ml-auto">
                    <button
                        className={`flex items-center justify-center p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                        onClick={() => setViewMode('list')}
                        title="List view"
                    >
                        <LayoutList className="w-4 h-4" />
                    </button>
                    <button
                        className={`flex items-center justify-center p-2 rounded-md transition-colors ${viewMode === 'card' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                        onClick={() => setViewMode('card')}
                        title="Card view"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Leads List/Card View */}
            {viewMode === 'card' ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 transition-all duration-300 p-6">
                    {leads.length === 0 ? (
                        <NoResults
                            title={error ? "Network or server error" : "No leads found"}
                            description={error ? (typeof error === 'string' ? error : String(error)) : noResultsDescription}
                            icon={<User className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
                            showClearButton={!error && (isSearchActive || isStatusActive)}
                            onClear={!error ? clearFilters : undefined}
                            isError={!!error}
                        />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {sortedLeads.map((lead) => (
                                <div
                                    key={lead.id}
                                    className="rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                    style={{ minHeight: '280px' }}
                                >
                                    {/* Card Header */}
                                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-br from-[#EF444E] to-[#ff5a64] rounded-lg shadow-2xl">
                                                    <User className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {lead.firstName} {lead.lastName}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {lead.company || 'No company'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex items-center justify-between">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(lead.status)}`}>
                                                {lead.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-4 flex-1">
                                        <div className="space-y-2">
                                            {lead.email && (
                                                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                                    <Mail className="h-3 w-3 flex-shrink-0" />
                                                    <span className="truncate">{lead.email}</span>
                                                </div>
                                            )}
                                            {lead.phone && (
                                                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                                    <Phone className="h-3 w-3 flex-shrink-0" />
                                                    <span>{lead.phone}</span>
                                                </div>
                                            )}
                                            {lead.assignedUser && (
                                                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                                    <User className="h-3 w-3 flex-shrink-0" />
                                                    <span>{lead.assignedUser.firstName} {lead.assignedUser.lastName}</span>
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                <Calendar className="h-3 w-3 flex-shrink-0" />
                                                <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Actions */}
                                    <div className="px-4 pb-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-gray-400">
                                                ID: #{lead.id}
                                            </div>
                                            <LeadActionMenu
                                                lead={lead}
                                                onView={handleViewLead}
                                                onEdit={handleEditLead}
                                                onDelete={requestDeleteLead}
                                                onConvert={requestConvertLead}
                                                isConverted={lead.status === 'converted'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination for Card View */}
                    {leads.length > 0 && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                totalItems={pagination.totalItems}
                                onPageChange={handlePageChange}
                                itemsPerPage={pagination.itemsPerPage || filters.limit || 10}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700  transition-all duration-300">
                    <div className="p-6">
                        <div className="mb-4">
                            <MetaBar
                                currentPage={pagination.currentPage}
                                itemsPerPage={pagination.itemsPerPage || filters.limit || 10}
                                totalItems={pagination.totalItems || leads.length}
                                onItemsPerPageChange={(n) => handleFilterChange('limit', n)}
                                columnConfig={{
                                    columns: [
                                        { id: 'name', label: 'Lead' },
                                        { id: 'email', label: 'Email' },
                                        { id: 'phone', label: 'Phone' },
                                        { id: 'company', label: 'Company' },
                                        { id: 'status', label: 'Status' },
                                        { id: 'assignedTo', label: 'Assigned To' },
                                        { id: 'createdAt', label: 'Created' },
                                    ],
                                    visibleColumns,
                                    onChange: setVisibleColumns,
                                    minVisible: 1,
                                }}
                            />
                        </div>
                        <div className="overflow-hidden relative">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 mobile-card-view table-fixed">
                                    <thead className="bg-gray-50 dark:bg-gray-900">
                                        <tr>
                                            <th className="w-12 px-4 py-3 text-start">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLeadIds.size === leads.length && leads.length > 0}
                                                    onChange={handleSelectAll}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </th>
                                            <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('name') ? 'hidden' : ''}`}>
                                                <TableSortHeader label={t("leads.table.lead") as string} column={'name'} sortBy={sortBy} sortOrder={sortOrder} onChange={(c: any) => onHeaderSort(c)} />
                                            </th>
                                            <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('email') ? 'hidden' : ''}`}>
                                                <TableSortHeader label={t("leads.form.email") as string} column={'email'} sortBy={sortBy} sortOrder={sortOrder} onChange={(c: any) => onHeaderSort(c)} />
                                            </th>
                                            <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('phone') ? 'hidden' : ''}`}>
                                                <TableSortHeader label="Phone" column={'phone'} sortBy={sortBy} sortOrder={sortOrder} onChange={(c: any) => onHeaderSort(c)} />
                                            </th>
                                            <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('company') ? 'hidden' : ''}`}>
                                                <TableSortHeader label={t("leads.table.company") as string} column={'company'} sortBy={sortBy} sortOrder={sortOrder} onChange={(c: any) => onHeaderSort(c)} />
                                            </th>
                                            <th className={`px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('status') ? 'hidden' : ''}`}>
                                                <div className="flex items-center justify-center">
                                                    <TableSortHeader label={t("leads.table.status") as string} column={'status'} sortBy={sortBy} sortOrder={sortOrder} onChange={(c: any) => onHeaderSort(c)} />
                                                </div>
                                            </th>
                                            <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('assignedTo') ? 'hidden' : ''}`}>
                                                {t("leads.table.assignedTo")}
                                            </th>
                                            <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('createdAt') ? 'hidden' : ''}`}>
                                                <TableSortHeader label={t("leads.table.created") as string} column={'createdAt'} sortBy={sortBy} sortOrder={sortOrder} onChange={(c: any) => onHeaderSort(c)} />
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
                                                    <td colSpan={visibleColumns.length + 1} className="px-6 py-12 text-center">
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
                                                        <td className="w-12 px-4 py-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedLeadIds.has(lead.id)}
                                                                onChange={() => handleSelectLead(lead.id)}
                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('name') ? 'hidden' : ''}`} data-label="Lead">
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
                                                        <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('email') ? 'hidden' : ''}`} data-label="Email">
                                                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                                <Mail className="h-3 w-3 flex-shrink-0" />
                                                                <span className="truncate">{lead.email}</span>
                                                            </div>
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('phone') ? 'hidden' : ''}`} data-label="Phone">
                                                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                                <Phone className="h-3 w-3 flex-shrink-0" />
                                                                <span>{lead.phone || '-'}</span>
                                                            </div>
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('company') ? 'hidden' : ''}`} data-label="Company">
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
                                                        <td className={`px-6 py-4 whitespace-nowrap text-center ${!isColumnVisible('status') ? 'hidden' : ''}`} data-label="Status">
                                                            <div className="relative inline-flex items-center justify-center">
                                                                <select
                                                                    value={lead.status}
                                                                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                                    disabled={updatingStatus[lead.id]}
                                                                    style={{ WebkitAppearance: 'none', backgroundImage: 'none', lineHeight: '1.5', textAlign: 'center', textAlignLast: 'center' }}
                                                                    className={`pr-5 pl-3 text-xs font-semibold rounded-full py-1 border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 text-center leading-tight ${getStatusColor(lead.status)
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
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 ${!isColumnVisible('assignedTo') ? 'hidden' : ''}`} data-label="Assigned to">
                                                            {lead.assignedUser
                                                                ? `${lead.assignedUser.firstName} ${lead.assignedUser.lastName}`
                                                                : "-"}
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 ${!isColumnVisible('createdAt') ? 'hidden' : ''}`} data-label="Created">
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar className="h-3 w-3 flex-shrink-0" />
                                                                <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium" data-label="Actions">
                                                            <div className="flex items-center justify-end gap-2 text-right">
                                                                <LeadActionMenu
                                                                    lead={lead}
                                                                    onView={handleViewLead}
                                                                    onEdit={handleEditLead}
                                                                    onDelete={requestDeleteLead}
                                                                    onConvert={requestConvertLead}
                                                                    isConverted={lead.status === 'converted'}
                                                                />
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
                                        <span className="text-white font-medium text-sm">
                                            {leadToDelete.firstName?.[0] || ''}
                                            {leadToDelete.lastName?.[0] || ''}
                                        </span>
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

            {/* Bulk Assign Modal */}
            {showBulkAssignModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Bulk Assign Leads
                                </h3>
                                <button
                                    onClick={() => {
                                        if (!isBulkAssigning) {
                                            setShowBulkAssignModal(false);
                                            setAssignToUserId('');
                                        }
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                                    disabled={isBulkAssigning}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Assign {selectedLeadIds.size} selected lead(s) to a user
                                </p>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Assign to User
                                    </label>
                                    <select
                                        value={assignToUserId}
                                        onChange={(e) => setAssignToUserId(e.target.value)}
                                        disabled={isBulkAssigning}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                                    >
                                        <option value="">-- Select a user --</option>
                                        <option value="unassigned">Unassigned</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id.toString()}>
                                                {user.firstName} {user.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-2 pt-4">
                                    <button
                                        onClick={() => {
                                            setShowBulkAssignModal(false);
                                            setAssignToUserId('');
                                        }}
                                        disabled={isBulkAssigning}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleBulkAssign}
                                        disabled={!assignToUserId || isBulkAssigning}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        {isBulkAssigning ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                Assigning...
                                            </>
                                        ) : (
                                            <>
                                                <User className="h-4 w-4 mr-2" />
                                                Assign Leads
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
