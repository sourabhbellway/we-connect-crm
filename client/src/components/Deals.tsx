import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCounts } from '../contexts/CountsContext';
import { Button } from './ui';
import { PERMISSIONS } from '../constants';
import { dealService, Deal } from '../services/dealService';
import {
  Plus,
  Filter,
  DollarSign,
  Calendar,
  User,
  Building,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import SearchInput from './SearchInput';
import NoResults from './NoResults';
import DropdownFilter from './DropdownFilter';
import Pagination from './Pagination';
import { useDebouncedSearch } from '../hooks/useDebounce';

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  PROPOSAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  NEGOTIATION: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  WON: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  LOST: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const Deals: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { hasPermission } = useAuth();
  const { refreshDealsCount } = useCounts();

  // Debounced search and local sort/filter/pagination
  const { searchValue, debouncedSearchValue, setSearch, isSearching } = useDebouncedSearch('', 500);
  type SortBy = 'createdAt' | 'title' | 'value' | 'status' | 'expectedCloseDate';
  type SortOrder = 'asc' | 'desc';
  type StatusFilter = 'ALL' | 'DRAFT' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchDeals();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchValue, sortBy, sortOrder, statusFilter, itemsPerPage]);

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

    const matchesStatus = statusFilter === 'ALL' || deal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const dir = sortOrder === 'asc' ? 1 : -1;
    const getVal = (d: Deal) => {
      switch (sortBy) {
        case 'title': return d.title || '';
        case 'value': return d.value || 0;
        case 'status': return d.status || '';
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

  // Paginate
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = sorted.slice(start, end);

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(value);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deals</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your sales opportunities
          </p>
        </div>
        {hasPermission(PERMISSIONS.DEAL.CREATE) && (
          <Link to="/deals/new">
            <Button variant="PRIMARY" size="MD">
              <Plus size={20} className="mr-2" />
              New Deal
            </Button>
          </Link>
        )}
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

          {/* Status Filter */}
          <div className="w-full sm:w-56 sm:min-w-[220px]">
            <DropdownFilter
              label="Status"
              value={statusFilter}
              onChange={(v) => setStatusFilter((v as string) as any)}
              options={[
                { value: 'ALL', label: 'All statuses' },
                { value: 'DRAFT', label: 'Draft' },
                { value: 'PROPOSAL', label: 'Proposal' },
                { value: 'NEGOTIATION', label: 'Negotiation' },
                { value: 'WON', label: 'Won' },
                { value: 'LOST', label: 'Lost' },
              ]}
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
                { value: 'status', label: 'Status' },
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
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="SECONDARY">
            <Filter size={20} className="mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Deals List (table view) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 transition-all duration-300">
        <div className="p-6">
          <div className="overflow-hidden relative">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Expected Close
                    </th>
                    <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {pageItems.map((deal) => (
                    <tr key={deal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{deal.title}</div>
                        {deal.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{deal.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-semibold text-green-600 dark:text-green-400">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatCurrency(deal.value, deal.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{deal.companies?.name || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[deal.status]}`}>
                          {deal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
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