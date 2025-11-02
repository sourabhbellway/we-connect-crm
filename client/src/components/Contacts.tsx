import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCounts } from '../contexts/CountsContext';
import { Button } from './ui';
import { PERMISSIONS } from '../constants';
import { contactService, Contact } from '../services/contactService';
import { toast } from 'react-toastify';
import {
  Plus,
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import SearchInput from './SearchInput';
import NoResults from './NoResults';
import { useDebouncedSearch } from '../hooks/useDebounce';
import DropdownFilter from './DropdownFilter';
import Pagination from './Pagination';
import MetaBar from './list/MetaBar';
import ListToolbar from './list/ListToolbar';
import TableSortHeader from './list/TableSortHeader';

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { hasPermission } = useAuth();
  const { refreshContactsCount } = useCounts();

  // Debounced search for consistent UX with Leads
  const { searchValue, debouncedSearchValue, setSearch, isSearching } = useDebouncedSearch('', 500);

  // Filters and pagination (server-side like Leads)
  const [phoneFilter, setPhoneFilter] = useState<'all' | 'has' | 'none'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 });

  useEffect(() => {
    fetchContacts();
  }, [debouncedSearchValue, itemsPerPage, currentPage]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contactService.getContacts(currentPage, itemsPerPage, debouncedSearchValue || undefined);
      const apiContacts = response.data.contacts || [];
      // Apply simple client-side phone filter on current page
      const filtered = apiContacts.filter(c => phoneFilter === 'all' ? true : phoneFilter === 'has' ? Boolean(c.phone) : !c.phone);
      setContacts(filtered);
      const p = response.data.pagination || { page: currentPage, limit: itemsPerPage, total: apiContacts.length, pages: 1 } as any;
      setPagination({
        currentPage: (p.currentPage || p.page || currentPage) as number,
        totalPages: (p.totalPages || p.pages || 1) as number,
        totalItems: (p.totalItems || p.total || apiContacts.length) as number,
        itemsPerPage: (p.itemsPerPage || p.limit || itemsPerPage) as number,
      });
      await refreshContactsCount();
    } catch (err: any) {
      console.error('Error fetching contacts:', err);
      if (err.response?.status === 404) {
        setError('Contact API endpoints are being set up. Please check back in a moment.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view contacts. Please contact your administrator.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch contacts');
      }
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  // Client-side sorting for minimal table UX
  type ContactSortBy = 'name' | 'email' | 'company' | 'createdAt';
  const [sortBy, setSortBy] = useState<ContactSortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const onHeaderSort = (col: ContactSortBy) => {
    setSortBy(prev => { if (prev === col) { setSortOrder(o=> o==='asc'?'desc':'asc'); return prev;} setSortOrder('asc'); return col; });
  };
  const pageItems = React.useMemo(() => {
    const arr = [...contacts];
    const dir = sortOrder === 'asc' ? 1 : -1;
    const val = (c: Contact) => {
      switch (sortBy) {
        case 'name': return `${c.firstName} ${c.lastName}`.toLowerCase();
        case 'email': return c.email?.toLowerCase() || '';
        case 'company': return c.company?.toLowerCase() || '';
        case 'createdAt': default: return c.createdAt || '';
      }
    };
    return arr.sort((a,b) => String(val(a)).localeCompare(String(val(b))) * dir);
  }, [contacts, sortBy, sortOrder]);
  const totalItems = pagination.totalItems;

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await contactService.deleteContact(id);
      toast.success('Contact deleted successfully');
      setContacts((prev) => prev.filter((c) => c.id !== id));
      await refreshContactsCount();
    } catch (err: any) {
      console.error('Failed to delete contact:', err);
      const msg = err?.response?.data?.message || 'Failed to delete contact';
      toast.error(msg);
    }
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
      {/* Header + Actions (match Leads) */}
      <div className="space-y-4">
        <ListToolbar
          title="Contacts"
          subtitle="Manage your converted leads and customer contacts"
          addLabel="Add Contact"
          onAdd={hasPermission(PERMISSIONS.CONTACT.CREATE) ? () => window.location.assign('/contacts/new') : undefined}
        />

        {/* Filters (match Leads layout) */}
        <div className="filters-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4 flex-1 min-w-0">
          <div className="w-full">
            <SearchInput
              value={searchValue}
              onChange={setSearch}
              placeholder="Search contacts..."
            />
            {isSearching && (
              <div className="mt-1 text-xs text-blue-500">Searching...</div>
            )}
          </div>
          <div className="w-full sm:w-56">
            <DropdownFilter
              label="Phone"
              value={phoneFilter}
              onChange={(v) => setPhoneFilter((v as string) as any)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'has', label: 'Has phone only' },
                { value: 'none', label: 'No phone only' },
              ]}
            />
          </div>
          <div className="w-full sm:w-40">
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
      </div>

      {/* Error Message */}
      {error && (
        <NoResults
          title="Network or server error"
          description={typeof error === 'string' ? error : String(error)}
          icon={<User className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
          isError
        />
      )}

      {/* Contacts List (table view) */}
      {!error && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 transition-all duration-300">
          <div className="p-6">
            <div className="mb-4">
              <MetaBar
                currentPage={pagination.currentPage}
                itemsPerPage={pagination.itemsPerPage || itemsPerPage}
                totalItems={pagination.totalItems}
                onItemsPerPageChange={(n) => setItemsPerPage(n)}
              />
            </div>
            <div className="overflow-hidden relative">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 mobile-card-view table-fixed">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <TableSortHeader label="Contact" column={'name'} sortBy={sortBy} sortOrder={sortOrder} onChange={(c:any)=>onHeaderSort(c)} />
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <TableSortHeader label="Email" column={'email'} sortBy={sortBy} sortOrder={sortOrder} onChange={(c:any)=>onHeaderSort(c)} />
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <TableSortHeader label="Company" column={'company'} sortBy={sortBy} sortOrder={sortOrder} onChange={(c:any)=>onHeaderSort(c)} />
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <TableSortHeader label="Created" column={'createdAt'} sortBy={sortBy} sortOrder={sortOrder} onChange={(c:any)=>onHeaderSort(c)} />
                      </th>
                      <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {pageItems.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap" data-label="Contact">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#EF444E] to-[#ff5a64] flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {contact.firstName?.[0]}
                                  {contact.lastName?.[0]}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {contact.firstName} {contact.lastName}
                              </div>
                              {contact.phone && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {contact.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" data-label="Email">
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {contact.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" data-label="Company">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {contact.company || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" data-label="Created">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium" data-label="Actions">
                          <div className="flex items-center justify-end space-x-2">
                            {hasPermission(PERMISSIONS.CONTACT.READ) && (
                              <Link
                                to={`/contacts/${contact.id}`}
                                className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                title="View Contact"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            )}
                            {hasPermission(PERMISSIONS.CONTACT.UPDATE) && (
                              <Link
                                to={`/contacts/${contact.id}/edit`}
                                className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Edit Contact"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                            )}
                            {hasPermission(PERMISSIONS.CONTACT.DELETE) && (
                              <button
                                onClick={() => handleDelete(Number(contact.id))}
                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Delete Contact"
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
            {!error && totalItems > 0 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage || itemsPerPage}
                onPageChange={(p) => setCurrentPage(p)}
              />
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!error && totalItems === 0 && !loading && (
        <NoResults
          title="No contacts found"
          description={searchValue ? 'No contacts match your search criteria.' : 'Get started by converting leads to contacts.'}
          icon={<User className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
          showClearButton={!!searchValue}
          onClear={() => setSearch('')}
        />
      )}
    </div>
  );
};

export default Contacts;
