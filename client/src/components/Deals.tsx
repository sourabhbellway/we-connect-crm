import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCounts } from '../contexts/CountsContext';
import { Button } from './ui';
import { PERMISSIONS } from '../constants';
import { dealService, Deal } from '../services/dealService';
import {
  Plus,
  DollarSign,
  Calendar,
  User,
  Edit,
  Trash2,
  Eye,
  LayoutList,
  LayoutGrid,
} from 'lucide-react';
import SearchInput from './SearchInput';
import NoResults from './NoResults';
import DropdownFilter from './DropdownFilter';
import Pagination from './Pagination';
import { useDebouncedSearch } from '../hooks/useDebounce';
import { useBusinessSettings } from '../contexts/BusinessSettingsContext';
import type { DealStage } from '../features/business-settings/types';
import DealsKanban from './deal/DealsKanban';
import { toast } from 'react-toastify';
import MetaBar from './list/MetaBar';
import ListToolbar from './list/ListToolbar';
import TableSortHeader, { SortOrder as TblSortOrder } from './list/TableSortHeader';

// Helper to get stage pill class from its color
const stagePillStyle = (color: string) => `text-xs px-2 py-1 rounded-full text-white`;

const Deals: React.FC = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  const { hasPermission } = useAuth();
  const { refreshDealsCount } = useCounts();
  const { getDealStages } = useBusinessSettings();

  // Debounced search and local sort/filter/pagination
  const { searchValue, debouncedSearchValue, setSearch, isSearching } = useDebouncedSearch('', 500);
  type SortBy = 'createdAt' | 'title' | 'value' | 'stage' | 'expectedCloseDate';
  type SortOrder = 'asc' | 'desc';
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const stages = useMemo<DealStage[]>(() => getDealStages(), [getDealStages]);

  useEffect(() => {
    fetchDeals();
  }, []);

useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchValue, sortBy, sortOrder, stageFilter, itemsPerPage]);

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

// Filter
  const filtered = deals.filter((deal) => {
    const term = debouncedSearchValue.toLowerCase();
    const matchesSearch = !term ||
      deal.title.toLowerCase().includes(term) ||
      (deal.description?.toLowerCase().includes(term) ?? false) ||
      (deal.contact?.firstName.toLowerCase().includes(term) ?? false) ||
      (deal.contact?.lastName.toLowerCase().includes(term) ?? false) ||
      (deal.companies?.name.toLowerCase().includes(term) ?? false);

    const matchesStage = stageFilter === 'ALL' || (deal.stage || '') === stageFilter;
    return matchesSearch && matchesStage;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const dir = sortOrder === 'asc' ? 1 : -1;
    const getVal = (d: Deal) => {
      switch (sortBy) {
        case 'title': return d.title || '';
        case 'value': return d.value || 0;
        case 'stage': return d.stage || '';
        case 'expectedCloseDate': return d.expectedCloseDate || '';
        case 'createdAt': default: return d.createdAt || '';
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

const getStageColor = (stageName?: string) => {
    if (!stageName) return '#6B7280';
    const s = stages.find(s => s.name === stageName);
    return s?.color || '#6B7280';
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
          onAdd={hasPermission(PERMISSIONS.DEAL.CREATE) ? () => navigate('/deals/new') : undefined}
        />
      </div>

      {/* Search, Sort, Filter */}
      <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-4">
        <div className="filters-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 gap-3 md:gap-4 flex-1 min-w-0">
          {/* Search */}
          <div className="w-full">
            <SearchInput
              value={searchValue}
              onChange={setSearch}
              placeholder="Search deals..."
            />
            {isSearching && (
              <div className="mt-1 text-xs text-blue-500">Searching...</div>
            )}
          </div>

          {/* Stage Filter */}
          <div className="w-full sm:w-56 sm:min-w-[220px]">
            <DropdownFilter
              label="Stage"
              value={stageFilter}
              onChange={(v) => setStageFilter((v as string))}
              options={[{ value: 'ALL', label: 'All stages' }, ...stages.map(s => ({ value: s.name, label: s.name }))]}
            />
          </div>

          {/* Sort By */}
          <div className="w-full sm:w-56 sm:min-w-[220px]">
            <DropdownFilter
              label="Sort by"
              value={sortBy}
              onChange={(v) => setSortBy((v as string) as any)}
              options={[
                { value: 'createdAt', label: 'Created date' },
                { value: 'title', label: 'Title' },
                { value: 'value', label: 'Value' },
                { value: 'stage', label: 'Stage' },
                { value: 'expectedCloseDate', label: 'Expected close' },
              ]}
            />
          </div>

          {/* Sort Order */}
          <div className="w-full sm:w-40 sm:min-w-[200px]">
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
          <div className="w-full sm:w-40 sm:min-w-[200px]">
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
        {/* View toggle */}
        <div className="hidden sm:flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 self-start">
          <button
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}
            onClick={() => setViewMode('list')}
          >
            <LayoutList className="w-4 h-4" /> List
          </button>
          <button
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="w-4 h-4" /> Kanban
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 transition-all duration-300 p-4">
          <div className="mb-4">
            <MetaBar
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onItemsPerPageChange={(n) => setItemsPerPage(n)}
            />
          </div>
          <DealsKanban
            deals={sorted}
            stages={stages}
            onUpdateStage={async (dealId, newStage) => {
              try {
                setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));
                await dealService.updateDeal(dealId, { stage: newStage });
                toast.success('Deal moved to ' + newStage);
              } catch (e) {
                toast.error('Failed to move deal');
                await fetchDeals();
              }
            }}
            onCreateDeal={hasPermission(PERMISSIONS.DEAL.CREATE) ? () => navigate('/deals/new') : undefined}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 transition-all duration-300">
          <div className="p-6">
            <div className="mb-4">
              <MetaBar
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onItemsPerPageChange={(n) => setItemsPerPage(n)}
              />
            </div>
            {/* Bulk actions bar */}
            {selectedIds.length > 0 && (
              <div className="mb-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="text-sm text-blue-800 dark:text-blue-200">{selectedIds.length} selected</div>
                <div className="flex items-center gap-2">
                  <DropdownFilter
                    label="Move to stage"
                    value={''}
                    onChange={async (v) => {
                      const target = v as string;
                      if (!target) return;
                      try {
                        setDeals(prev => prev.map(d => selectedIds.includes(d.id) ? { ...d, stage: target } : d));
                        await Promise.all(selectedIds.map(id => dealService.updateDeal(id, { stage: target })));
                        toast.success('Updated selected deals');
                        setSelectedIds([]);
                      } catch (e) {
                        toast.error('Failed to update selected deals');
                      }
                    }}
                    options={stages.map(s => ({ value: s.name, label: s.name }))}
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
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <TableSortHeader label="Title" column={'title'} sortBy={sortBy as any} sortOrder={sortOrder as any} onChange={(c:any)=>onHeaderSort(c)} />
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <TableSortHeader label="Value" column={'value'} sortBy={sortBy as any} sortOrder={sortOrder as any} onChange={(c:any)=>onHeaderSort(c)} />
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <TableSortHeader label="Stage" column={'stage'} sortBy={sortBy as any} sortOrder={sortOrder as any} onChange={(c:any)=>onHeaderSort(c)} />
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <TableSortHeader label="Expected Close" column={'expectedCloseDate'} sortBy={sortBy as any} sortOrder={sortOrder as any} onChange={(c:any)=>onHeaderSort(c)} />
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
                        <td className="px-6 py-4 whitespace-nowrap" data-label="Title">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#EF444E] to-[#ff5a64] flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {(deal.contact?.firstName?.[0] || deal.companies?.name?.[0] || 'D').toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{deal.title}</div>
                              {deal.description && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{deal.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" data-label="Value">
                          <div className="flex items-center text-sm font-semibold text-green-600 dark:text-green-400">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: deal.currency }).format(deal.value)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" data-label="Company">
                          <div className="text-sm text-gray-900 dark:text-white">{deal.companies?.name || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" data-label="Contact">
                          <div className="text-sm text-gray-900 dark:text-white flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" data-label="Stage">
                          <span className={`px-2 py-1 text-xs rounded-full text-white`} style={{ backgroundColor: getStageColor(deal.stage) }}>
                            {deal.stage || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" data-label="Expected Close">
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
    </div>
  );
};

export default Deals;