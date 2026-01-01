import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCounts } from '../contexts/CountsContext';
import { Button } from './ui';
import { PERMISSIONS } from '../constants';
import { dealService, Deal } from '../services/dealService';
import { userService } from '../services/userService';
import {
  DollarSign,
  Calendar,
  User,
  Edit,
  Trash2,
  Eye,
  LayoutList,
  LayoutGrid,
  Building,
  MessageSquare,
  Paperclip,
  MoreVertical,
  FileDown,
  Upload,
  FileSpreadsheet,
} from 'lucide-react';
import SearchInput from './SearchInput';
import NoResults from './NoResults';
import DropdownFilter from './DropdownFilter';
import Pagination from './Pagination';
import { useDebouncedSearch } from '../hooks/useDebounce';
import { useBusinessSettings } from '../contexts/BusinessSettingsContext';
import type { DealStatus } from '../features/business-settings/types';

import { toast } from 'react-toastify';
import MetaBar from './list/MetaBar';
import ListToolbar from './list/ListToolbar';
import TableSortHeader from './list/TableSortHeader';
import { exportToCsv } from '../utils/exportUtils';

// Helper to get stage pill class from its color


// Deal status helpers - will be used inside component to access context
const getStatusStyles = (statusName: string, dealStatuses: DealStatus[]) => {
  const status = dealStatuses.find(s => s.name.toUpperCase() === (statusName || '').toUpperCase());
  if (status && status.color) {
    return {
      backgroundColor: `${status.color}20`, // 20% opacity for bg
      color: status.color,
      border: `1px solid ${status.color}40`
    };
  }
  return {
    backgroundColor: '#f3f4f6',
    color: '#374151'
  };
};

const Deals: React.FC = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const { hasPermission } = useAuth();
  const { refreshDealsCount } = useCounts();
  const { dealStatuses } = useBusinessSettings();

  // Debounced search and local sort/filter/pagination
  const { searchValue, debouncedSearchValue, setSearch, isSearching } = useDebouncedSearch('', 500);
  type SortBy =
    | 'createdAt'
    | 'title'
    | 'value'
    | 'expectedCloseDate'
    | 'company'
    | 'contact'
    | 'phone'
    | 'status';
  type SortOrder = 'asc' | 'desc';
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'title',
    'value',
    'company',
    'contact',
    'phone',
    'status',
    'expectedCloseDate',
  ]);

  useEffect(() => {
    fetchDeals();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers({ limit: 100 });
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchValue, sortBy, sortOrder, statusFilter, itemsPerPage]);

  // Load column visibility preferences
  useEffect(() => {
    try {
      const stored = localStorage.getItem('deals_visible_columns');
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
      localStorage.setItem('deals_visible_columns', JSON.stringify(visibleColumns));
    } catch {
      // ignore
    }
  }, [visibleColumns]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dealService.getDeals(1, 100, debouncedSearchValue || undefined);
      setDeals(response.data.deals || []);
      await refreshDealsCount();
    } catch (err: any) {
      console.error('Error fetching deals:', err);
      if (err.response?.status === 404) {
        setError('Deal API endpoints are being set up. Please check back in a moment.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view deals. Please contact your administrator.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch deals');
      }
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatusInline = async (id: number, nextStatus: Deal['status']) => {
    const prev = deals;
    setDeals(prev => prev.map(d => (d.id === id ? { ...d, status: nextStatus } : d)));
    try {
      await dealService.updateDeal(id, { status: nextStatus });
      toast.success('Status updated');
    } catch (e) {
      toast.error('Failed to update status');
      setDeals(prev); // revert
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ['title', 'description', 'value', 'currency', 'status', 'probability', 'expectedCloseDate'];
    const rows = [['Sample Deal', 'Sample Description', '1000', 'USD', 'DRAFT', '50', '2023-12-31']];
    exportToCsv('deals_template.csv', headers, rows);
    toast.success('Template downloaded');
  };

  const handleExportDeals = async () => {
    setIsExporting(true);
    try {
      const blob = await dealService.bulkExportDeals(debouncedSearchValue);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deals_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Deals exported successfully');
    } catch (error) {
      toast.error('Failed to export deals');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      setImportFile(file);
    }
  };

  const handleBulkImport = async () => {
    if (!importFile) {
      toast.error('Please select a file');
      return;
    }
    setIsImporting(true);
    try {
      const result = await dealService.bulkImportDeals(importFile);
      if (result.success) {
        toast.success(result.data?.message || 'Import successful');
        setShowImportModal(false);
        setImportFile(null);
        fetchDeals();
      } else {
        toast.error(result.message || 'Import failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleBulkAssign = async (userId: string) => {
    if (!userId) return;
    const targetUserId = userId === 'unassigned' ? null : parseInt(userId);
    try {
      await dealService.bulkAssignDeals(selectedIds, targetUserId);
      setDeals(prev => prev.map(d => selectedIds.includes(d.id) ? { ...d, assignedTo: targetUserId ?? undefined } : d));
      setSelectedIds([]);
      toast.success('Deals assigned successfully');
    } catch (error) {
      toast.error('Failed to assign deals');
    }
  };

  // Filter
  const filtered = deals.filter((deal) => {
    const term = (debouncedSearchValue || '').toLowerCase();
    const companyName = deal.companies?.name || (deal.lead as any)?.company || '';
    const matchesSearch = !term ||
      (deal.title || '').toLowerCase().includes(term) ||
      ((deal.description || '').toLowerCase().includes(term)) ||
      ((deal.lead?.firstName || '').toLowerCase().includes(term)) ||
      ((deal.lead?.lastName || '').toLowerCase().includes(term)) ||
      ((deal.lead?.phone || '').toLowerCase().includes(term)) ||
      companyName.toLowerCase().includes(term);

    companyName.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'ALL' || (deal.status || '') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const dir = sortOrder === 'asc' ? 1 : -1;
    const getVal = (d: Deal) => {
      switch (sortBy) {
        case 'title':
          return d.title || '';
        case 'value':
          return d.value || 0;
        case 'expectedCloseDate':
          return d.expectedCloseDate || '';
        case 'company': {
          const companyName = d.companies?.name || (d.lead as any)?.company || '';
          return companyName.toLowerCase();
        }
        case 'contact':
          return `${d.lead?.firstName || ''} ${d.lead?.lastName || ''}`.toLowerCase();
        case 'phone':
          return d.lead?.phone || '';
        case 'status':
          return d.status || '';
        case 'createdAt':
        default:
          return d.createdAt || '';
      }
    };
    const va = getVal(a);
    const vb = getVal(b);

    // Numeric sort for value
    if (sortBy === 'value') return ((va as number) - (vb as number)) * dir;

    // Date sorts
    if (sortBy === 'createdAt' || sortBy === 'expectedCloseDate') {
      return (new Date(va as string).getTime() - new Date(vb as string).getTime()) * dir;
    }

    return String(va).localeCompare(String(vb)) * dir;
  });

  // Sort header toggle
  const onHeaderSort = (col: SortBy) => {
    setSortBy((prev) => {
      if (prev === col) {
        setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortOrder('asc');
      return col;
    });
  };

  // Paginate
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = sorted.slice(start, end);

  const isColumnVisible = (id: string) => visibleColumns.includes(id);



  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityCardBg = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-950/40 dark:to-orange-950/30 border-red-300 dark:border-red-800/30';
      case 'medium':
        return 'bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-950/40 dark:to-yellow-950/30 border-amber-300 dark:border-amber-800/30';
      case 'low':
        return 'bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-950/40 dark:to-cyan-950/30 border-blue-300 dark:border-blue-800/30';
      default:
        return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getPriorityLabel = (priority?: string) => {
    if (!priority) return 'Medium';
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="space-y-4">
        <ListToolbar
          title="Deals"
          subtitle="Track and manage your sales opportunities"
          addLabel="Add Deal"
          onAdd={hasPermission(PERMISSIONS.DEAL.CREATE) ? () => navigate('/leads/new') : undefined}
          bulkActions={[
            {
              label: 'Download Template',
              icon: <FileSpreadsheet className="w-4 h-4" />,
              onClick: handleDownloadTemplate,
            },
            {
              label: 'Import Deals',
              icon: <Upload className="w-4 h-4" />,
              onClick: () => setShowImportModal(true),
            },
            {
              label: 'Export Deals (CSV)',
              icon: <FileDown className="w-4 h-4" />,
              onClick: handleExportDeals,
              disabled: isExporting,
            },
          ]}
        />
      </div>

      {/* Search, Sort, Filter */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 flex-1">
          {/* Search */}
          <div className="">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <div className="flex items-center gap-2">
                Search
                {isSearching && (
                  <span className="text-xs text-blue-500 flex items-center gap-1">
                    Searching...
                  </span>
                )}
              </div>
            </label>
            <SearchInput
              value={searchValue}
              onChange={setSearch}
              placeholder="Search deals..."
              className="max-w-full"
            />
          </div>



          {/* Status Filter */}
          <div className="w-full sm:w-48 sm:min-w-[220px]">
            <DropdownFilter
              label="Status"
              value={statusFilter}
              onChange={(v) => setStatusFilter((v as string))}
              options={[{ value: 'ALL', label: 'All statuses' }, ...(dealStatuses || []).map(s => ({ value: s.name, label: s.name }))]}
            />
          </div>

          {/* Sort By */}
          <div className="w-full sm:w-48 sm:min-w-[220px]">
            <DropdownFilter
              label="Sort by"
              value={sortBy}
              onChange={(v) => setSortBy((v as string) as any)}
              options={[
                { value: 'createdAt', label: 'Created date' },
                { value: 'title', label: 'Title' },
                { value: 'value', label: 'Value' },
                { value: 'expectedCloseDate', label: 'Expected close' },
              ]}
            />
          </div>

          {/* Sort Order */}
          <div className="w-full sm:w-48 sm:min-w-[200px]">
            <DropdownFilter
              label="Order"
              value={sortOrder}
              onChange={(v) => setSortOrder((v as string) as any)}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
            />
          </div>

          {/* Items per page */}
          <div className="w-full sm:w-48 sm:min-w-[200px]">
            <DropdownFilter
              label="Items per page"
              value={String(itemsPerPage)}
              onChange={(v) => setItemsPerPage(Number(v))}
              options={[
                { value: '5', label: '5' },
                { value: '10', label: '10' },
                { value: '20', label: '20' },
                { value: '50', label: '50' },
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
            className={`flex items-center justify-center p-2 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            onClick={() => setViewMode('kanban')}
            title="Kanban view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* List or Kanban */}
      {viewMode === 'kanban' ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 transition-all duration-300 p-6">
          {pageItems.length === 0 ? (
            <NoResults
              title="No deals found"
              description={searchValue ? 'No deals match your search criteria.' : 'Get started by creating your first deal.'}
              icon={<DollarSign className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
              showClearButton={!!searchValue}
              onClear={() => setSearch('')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pageItems.map((deal) => {
                // Calculate progress percentage (mock - you can add actual progress field)
                const progress = deal.probability || 0;
                const priority = (deal as any).priority || 'medium';

                return (
                  <div
                    key={deal.id}
                    className={`rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col ${getPriorityCardBg(priority)}`}
                    style={{ minHeight: '320px' }}
                  >
                    {/* Partition 1: Priority & Status Badges */}
                    <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getPriorityColor(priority)}`}>
                        {getPriorityLabel(priority)}
                      </span>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={getStatusStyles(deal.status || '', dealStatuses)}
                      >
                        {deal.status || 'DRAFT'}
                      </span>
                    </div>

                    {/* Partition 2: Title & Description */}
                    <div className="px-4 pb-3 flex-1">
                      <h3
                        className="text-sm font-semibold text-gray-900 dark:text-white mb-2  cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => hasPermission(PERMISSIONS.DEAL.READ) && navigate(`/deals/${deal.id}`)}
                      >
                        {deal.title}
                      </h3>
                      {deal.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400  mb-3">
                          {deal.description}
                        </p>
                      )}

                      {/* Deal Value */}
                      <div className="flex items-center text-sm font-semibold text-green-600 dark:text-green-400 mb-3">
                        <DollarSign className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: deal.currency || 'USD' }).format(deal.value || 0)}
                        </span>
                      </div>

                      {/* Company & Contact Info */}
                      <div className="space-y-1.5">
                        {(deal.companies?.name || (deal.lead as any)?.company) && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                            <Building className="h-3 w-3 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{deal.companies?.name || (deal.lead as any)?.company}</span>
                          </div>
                        )}
                        {deal.lead && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                            <User className="h-3 w-3 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{deal.lead.firstName} {deal.lead.lastName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Partition 3: Progress Bar */}
                    <div className="px-4 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Partition 4: Actions & Details */}
                    <div className="px-4 pb-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        {/* Left: Assigned Users & Stats */}
                        <div className="flex items-center gap-3">
                          {/* Assigned User Avatar */}
                          {deal.assignedUser ? (
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#EF444E] to-[#ff5a64] flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {deal.assignedUser.firstName?.[0] || ''}{deal.assignedUser.lastName?.[0] || ''}
                              </span>
                            </div>
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <User className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}

                          {/* Mock stats - you can add real data later */}
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>0</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Paperclip className="h-3 w-3" />
                              <span>0</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Action Buttons */}
                        <div className="flex items-center gap-1">
                          {hasPermission(PERMISSIONS.DEAL.READ) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/deals/${deal.id}`);
                              }}
                              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title="View Deal"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          {hasPermission(PERMISSIONS.DEAL.UPDATE) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/deals/${deal.id}/edit`);
                              }}
                              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                              title="Edit Deal"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {hasPermission(PERMISSIONS.DEAL.DELETE) && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!confirm('Delete this deal?')) return;
                                try {
                                  await dealService.deleteDeal(deal.id);
                                  setDeals(prev => prev.filter(d => d.id !== deal.id));
                                  toast.success('Deal deleted');
                                } catch (e) {
                                  toast.error('Failed to delete');
                                }
                              }}
                              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Delete Deal"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="More options"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination for Kanban */}
          {totalItems > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 transition-all duration-300">
          <div className="p-6">
            <div className="mb-4">
              <MetaBar
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onItemsPerPageChange={(n) => setItemsPerPage(n)}
                columnConfig={{
                  columns: [
                    { id: 'title', label: 'Title' },
                    { id: 'value', label: 'Value' },
                    { id: 'company', label: 'Company' },
                    { id: 'contact', label: 'Contact' },
                    { id: 'phone', label: 'Phone' },
                    { id: 'stage', label: 'Stage' },
                    { id: 'status', label: 'Status' },
                    { id: 'expectedCloseDate', label: 'Expected Close' },
                  ],
                  visibleColumns,
                  onChange: setVisibleColumns,
                  minVisible: 1,
                }}
              />
            </div>
            {/* Bulk actions bar */}
            {selectedIds.length > 0 && (
              <div className="mb-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="text-sm text-blue-800 dark:text-blue-200">{selectedIds.length} selected</div>
                <div className="flex items-center gap-2">
                  <DropdownFilter
                    label="Move to status"
                    value={''}
                    onChange={async (v) => {
                      const target = v as string;
                      if (!target) return;
                      try {
                        setDeals(prev => prev.map(d => selectedIds.includes(d.id) ? { ...d, status: target as any } : d));
                        await Promise.all(selectedIds.map(id => dealService.updateDeal(id, { status: target as any })));
                        toast.success('Updated selected deals');
                        setSelectedIds([]);
                      } catch (e) {
                        toast.error('Failed to update selected deals');
                      }
                    }}
                    options={dealStatuses.map(s => ({ value: s.name, label: s.name }))}
                  />
                  <DropdownFilter
                    label="Assign to"
                    value={''}
                    onChange={(v) => handleBulkAssign(v as string)}
                    options={[
                      { value: 'unassigned', label: 'Unassigned' },
                      ...users.map(u => ({ value: String(u.id), label: `${u.firstName} ${u.lastName}` }))
                    ]}
                  />
                  {hasPermission(PERMISSIONS.DEAL.DELETE) && (
                    <Button
                      variant="DESTRUCTIVE"
                      size="SM"
                      onClick={async () => {
                        if (!confirm('Delete selected deals?')) return;
                        try {
                          await Promise.all(selectedIds.map(id => dealService.deleteDeal(id)));
                          setDeals(prev => prev.filter(d => !selectedIds.includes(d.id)));
                          setSelectedIds([]);
                          toast.success('Deleted selected deals');
                        } catch (e) {
                          toast.error('Failed to delete selected deals');
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="overflow-hidden relative">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 mobile-card-view table-fixed">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={pageItems.length > 0 && pageItems.every(d => selectedIds.includes(d.id))}
                          onChange={(e) => {
                            const allIds = pageItems.map(d => d.id);
                            setSelectedIds(e.target.checked ? Array.from(new Set([...selectedIds, ...allIds])) : selectedIds.filter(id => !allIds.includes(id)));
                          }}
                        />
                      </th>
                      <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('title') ? 'hidden' : ''}`}>
                        <TableSortHeader label="Title" column={'title'} sortBy={sortBy as any} sortOrder={sortOrder as any} onChange={(c: any) => onHeaderSort(c)} />
                      </th>
                      <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('value') ? 'hidden' : ''}`}>
                        <TableSortHeader label="Value" column={'value'} sortBy={sortBy as any} sortOrder={sortOrder as any} onChange={(c: any) => onHeaderSort(c)} />
                      </th>
                      <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('company') ? 'hidden' : ''}`}>
                        <TableSortHeader label="Company" column={'company'} sortBy={sortBy as any} sortOrder={sortOrder as any} onChange={(c: any) => onHeaderSort(c)} />
                      </th>
                      <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('contact') ? 'hidden' : ''}`}>
                        <TableSortHeader label="Contact" column={'contact'} sortBy={sortBy as any} sortOrder={sortOrder as any} onChange={(c: any) => onHeaderSort(c)} />
                      </th>
                      <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('phone') ? 'hidden' : ''}`}>
                        <TableSortHeader label="Phone" column={'phone'} sortBy={sortBy as any} sortOrder={sortOrder as any} onChange={(c: any) => onHeaderSort(c)} />
                      </th>

                      <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('status') ? 'hidden' : ''}`}>
                        Status
                      </th>
                      <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('expectedCloseDate') ? 'hidden' : ''}`}>
                        <TableSortHeader label="Expected Close" column={'expectedCloseDate'} sortBy={sortBy as any} sortOrder={sortOrder as any} onChange={(c: any) => onHeaderSort(c)} />
                      </th>
                      <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {pageItems.map((deal) => (
                      <tr key={deal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-4" data-label="Select">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(deal.id)}
                            onChange={(e) => {
                              setSelectedIds(prev => e.target.checked ? [...prev, deal.id] : prev.filter(id => id !== deal.id));
                            }}
                          />
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('title') ? 'hidden' : ''}`} data-label="Title">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#EF444E] to-[#ff5a64] flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {(deal.lead?.firstName?.[0] || deal.companies?.name?.[0] || 'D').toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="min-w-[12rem]">
                              {/* Deal title */}
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                <Link
                                  to={`/deals/${deal.id}`}
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  {deal.title}
                                </Link>
                              </div>
                              {deal.description && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{deal.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('value') ? 'hidden' : ''}`} data-label="Value">
                          <div className="flex items-center text-sm font-semibold text-green-600 dark:text-green-400">
                            <div className="h-4 w-4 mr-1" />
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: deal.currency }).format(deal.value)}
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('company') ? 'hidden' : ''}`} data-label="Company">
                          <div className="text-sm text-gray-900 dark:text-white">{deal.companies?.name || (deal.lead as any)?.company || '-'}</div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('contact') ? 'hidden' : ''}`} data-label="Contact">
                          <div className="text-sm text-gray-900 dark:text-white flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {deal.lead ? `${deal.lead.firstName} ${deal.lead.lastName}` : '-'}
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('phone') ? 'hidden' : ''}`} data-label="Phone">
                          <div className="text-sm text-gray-900 dark:text-white">{deal.lead?.phone || '-'}</div>
                        </td>

                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${!isColumnVisible('status') ? 'hidden' : ''}`} data-label="Status">
                          {hasPermission(PERMISSIONS.DEAL.UPDATE) ? (
                            <select
                              className={`text-xs px-2 py-1 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              style={getStatusStyles(deal.status || '', dealStatuses)}
                              value={deal.status}
                              onChange={(e) => updateStatusInline(deal.id, e.target.value as Deal['status'])}
                            >
                              {(dealStatuses || []).filter(s => s.isActive).map(s => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`px-2 py-1 text-xs rounded-full`}
                              style={getStatusStyles(deal.status || '', dealStatuses)}
                            >
                              {deal.status}
                            </span>
                          )}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 ${!isColumnVisible('expectedCloseDate') ? 'hidden' : ''}`} data-label="Expected Close">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium" data-label="Actions">
                          <div className="flex items-center justify-end space-x-2">
                            {hasPermission(PERMISSIONS.DEAL.READ) && (
                              <Link
                                to={`/deals/${deal.id}`}
                                className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                title="View Deal"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            )}
                            {hasPermission(PERMISSIONS.DEAL.UPDATE) && (
                              <Link
                                to={`/deals/${deal.id}/edit`}
                                className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Edit Deal"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                            )}
                            {hasPermission(PERMISSIONS.DEAL.DELETE) && (
                              <button
                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Delete Deal"
                                onClick={async () => {
                                  if (!confirm('Delete this deal?')) return;
                                  try {
                                    await dealService.deleteDeal(deal.id);
                                    setDeals(prev => prev.filter(d => d.id !== deal.id));
                                    toast.success('Deal deleted');
                                  } catch (e) {
                                    toast.error('Failed to delete');
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={(p) => setCurrentPage(p)}
              />
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalItems === 0 && !loading && (
        <NoResults
          title="No deals found"
          description={searchValue ? 'No deals match your search criteria.' : 'Get started by creating your first deal.'}
          icon={<DollarSign className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
          showClearButton={!!searchValue}
          onClear={() => setSearch('')}
        />
      )}
      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Import Deals</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <div className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span className="text-xl">×</span>
                </div>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Upload a CSV file with your deals data. Make sure it contains at least <strong>title</strong> and <strong>value</strong> columns.</p>
                <button
                  onClick={handleDownloadTemplate}
                  className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 font-medium"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Download CSV Template
                </button>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select CSV File
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${importFile
                    ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/10'
                    : 'border-gray-300 hover:border-blue-400 dark:border-gray-600'
                    }`}
                >
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportFile}
                    className="hidden"
                    id="deal-import-input"
                  />
                  <label htmlFor="deal-import-input" className="cursor-pointer group">
                    <Upload className={`mx-auto h-12 w-12 mb-3 transition-colors ${importFile ? 'text-green-500' : 'text-gray-400 group-hover:text-blue-500'}`} />
                    <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                      {importFile ? importFile.name : 'Click to upload or drag and drop'}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                      CSV files only (max. 10MB)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                disabled={!importFile || isImporting}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm shadow-blue-200 dark:shadow-none disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Importing...
                  </>
                ) : (
                  'Import Deals'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deals;
