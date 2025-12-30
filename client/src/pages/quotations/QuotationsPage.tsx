import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, Plus, Eye, Download, Filter, Search, Edit, Trash2, Send, FileDown, FileText, LayoutList, LayoutGrid, MoreHorizontal, Calendar, User, Mail, DollarSign, Clock } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import ListToolbar from '../../components/list/ListToolbar';
import MetaBar from '../../components/list/MetaBar';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import { toast } from 'react-toastify';
import { exportToCsv, exportTableToPrintPdf } from '../../utils/exportUtils';

interface Quotation {
  id: string;
  quotationNumber: string;
  title: string;
  totalAmount: number;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
  validUntil?: string;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  relatedTo?: string;
  relatedType?: 'lead' | 'deal' | 'contact';
}

const QuotationsPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [processingInvoice, setProcessingInvoice] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'quotationNumber',
    'customer',
    'email',
    'related',
    'amount',
    'status',
    'date',
  ]);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Load column visibility preferences
  useEffect(() => {
    try {
      const stored = localStorage.getItem('quotations_visible_columns');
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
      localStorage.setItem('quotations_visible_columns', JSON.stringify(visibleColumns));
    } catch {
      // ignore
    }
  }, [visibleColumns]);

  useEffect(() => {
    fetchQuotations();
  }, [searchQuery, statusFilter, currentPage, itemsPerPage]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/quotations', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        }
      });
      if (response.data.success) {
        const data = response.data.data || {};
        const items = Array.isArray(data) ? data : (data.items || []);
        const total = data.total || items.length || 0;
        const page = data.page || currentPage;
        const limit = data.limit || itemsPerPage;
        // Map API response to include customer info
        const mappedQuotations = items.map((q: any) => ({
          ...q,
          customerName: q.lead ? `${q.lead.firstName || ''} ${q.lead.lastName || ''}`.trim() || q.lead.company : q.deal?.title || '-',
          customerEmail: q.lead?.email || '-',
          relatedTo: q.deal ? `Deal #${q.deal.id}` : q.lead ? `Lead #${q.lead.id}` : undefined,
          relatedType: q.dealId ? 'deal' : q.leadId ? 'lead' : undefined,
        }));
        setQuotations(mappedQuotations);
        setPagination({
          currentPage: page,
          totalPages: Math.max(1, Math.ceil(total / limit)),
          totalItems: total,
          itemsPerPage: limit,
        });
      }
    } catch (error: any) {
      console.error('Error fetching quotations:', error);
      toast.error(error?.response?.data?.message || t('quotations.fetch_error') || 'Failed to fetch quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (quotationId: string) => {
    try {
      const response = await apiClient.get(`/quotations/${quotationId}/pdf/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const quotation = quotations.find(q => q.id === quotationId);
      link.setAttribute('download', `${quotation?.quotationNumber || 'quotation'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error(error?.response?.data?.message || t('quotations.download_error') || 'Failed to download PDF');
    }
  };

  const handlePreviewPDF = async (quotationId: string) => {
    try {
      const response = await apiClient.get(`/quotations/${quotationId}/pdf/preview`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error: any) {
      console.error('Error previewing PDF:', error);
      toast.error(error?.response?.data?.message || t('quotations.preview_error') || 'Failed to preview PDF');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      VIEWED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      EXPIRED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <FileCheck className="w-3 h-3" />;
      case 'SENT':
        return <Send className="w-3 h-3" />;
      case 'VIEWED':
        return <Eye className="w-3 h-3" />;
      case 'ACCEPTED':
        return <FileCheck className="w-3 h-3" />;
      case 'REJECTED':
        return <Trash2 className="w-3 h-3" />;
      case 'EXPIRED':
        return <Clock className="w-3 h-3" />;
      case 'CANCELLED':
        return <Trash2 className="w-3 h-3" />;
      default:
        return <FileCheck className="w-3 h-3" />;
    }
  };

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (quotationId: string) => {
    if (!window.confirm(t('quotations.confirm_delete') || 'Are you sure you want to delete this quotation?')) {
      return;
    }
    try {
      const response = await apiClient.delete(`/quotations/${quotationId}`);
      if (response.data.success) {
        toast.success(t('quotations.delete_success') || 'Quotation deleted successfully');
        fetchQuotations();
      }
    } catch (error: any) {
      console.error('Error deleting quotation:', error);
      toast.error(error?.response?.data?.message || t('quotations.delete_error') || 'Failed to delete quotation');
    }
  };

  const handleEdit = (quotationId: string) => {
    navigate(`/quotations/edit/${quotationId}`);
  };

  const handleBookOrder = async (quotationId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (processingInvoice === quotationId) {
      return; // Prevent duplicate calls
    }
    try {
      setProcessingInvoice(quotationId);
      // Mark accepted then create invoice
      await apiClient.put(`/quotations/${quotationId}/accept`);
      const res = await apiClient.post(`/quotations/${quotationId}/generate-invoice`);
      if (res.data?.success) {
        toast.success('Sales order booked and invoice created');
        fetchQuotations(); // Refresh the list
        navigate('/invoices');
      } else {
        toast.info('Quotation accepted, but invoice not created');
      }
    } catch (error: any) {
      console.error('Error booking sales order:', error);
      toast.error(error?.response?.data?.message || 'Failed to book sales order');
    } finally {
      setProcessingInvoice(null);
    }
  };

  const toggleDropdown = (id: string) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="space-y-6 p-6">
          {/* Header Skeleton */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              <div>
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse"></div>
              </div>
            </div>
            <div className="h-11 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          {/* Filters Skeleton */}
          <div className="mb-6 flex gap-3">
            <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-40 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          {/* Table Skeleton */}
          <Card className="overflow-hidden bg-white dark:bg-gray-800">
            <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="col-span-2 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="col-span-2 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="col-span-2 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="col-span-2 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="col-span-1 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4">
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="col-span-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
                  </div>
                  <div className="col-span-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-20"></div>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <ListToolbar
            title="Quotations"
            subtitle={`Manage and track your quotations • Showing ${pagination.totalItems} quotation${pagination.totalItems !== 1 ? 's' : ''}`}
            addLabel="Add Quotation"
            onAdd={hasPermission('deal.create') ? () => navigate('/quotations/new') : undefined}
            bulkActions={[
              {
                label: 'Export Quotations (Excel)',
                icon: <FileDown className="w-4 h-4" />,
                onClick: () => {
                  const headers = [
                    'Quotation #',
                    'Title',
                    'Customer',
                    'Email',
                    'Related',
                    'Amount',
                    'Status',
                    'Created',
                    'Valid Until',
                  ];
                  const rows = filteredQuotations.map((q) => [
                    q.quotationNumber,
                    q.title,
                    q.customerName || '',
                    q.customerEmail || '',
                    q.relatedTo || '',
                    `${q.currency} ${q.totalAmount.toLocaleString()}`,
                    q.status,
                    new Date(q.createdAt).toLocaleDateString(),
                    q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '',
                  ]);
                  exportToCsv('quotations_export.csv', headers, rows);
                },
              },
              {
                label: 'Export Quotations (PDF)',
                icon: <FileText className="w-4 h-4" />,
                onClick: () => {
                  const headers = [
                    'Quotation #',
                    'Title',
                    'Customer',
                    'Email',
                    'Related',
                    'Amount',
                    'Status',
                    'Created',
                    'Valid Until',
                  ];
                  const rows = filteredQuotations.map((q) => [
                    q.quotationNumber,
                    q.title,
                    q.customerName || '',
                    q.customerEmail || '',
                    q.relatedTo || '',
                    `${q.currency} ${q.totalAmount.toLocaleString()}`,
                    q.status,
                    new Date(q.createdAt).toLocaleDateString(),
                    q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '',
                  ]);
                  exportTableToPrintPdf('Quotations', headers, rows);
                },
              },
            ]}
          />
        </div>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search quotations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm min-w-[150px]"
                >
                  <option value="ALL">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="VIEWED">Viewed</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Items per page */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            {/* View toggle - Right aligned */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                className={`flex items-center justify-center p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                className={`flex items-center justify-center p-2 rounded-md transition-colors ${viewMode === 'card' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                onClick={() => setViewMode('card')}
                title="Card view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quotations List/Card View */}
        {viewMode === 'card' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            {filteredQuotations.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCheck size={40} className="text-gray-400 dark:text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Quotations Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {searchQuery || statusFilter !== 'ALL'
                    ? 'Try adjusting your filters or search terms'
                    : 'Create your first quotation to get started with tracking your sales pipeline'}
                </p>
                {hasPermission('deal.create') && (
                  <Button
                    onClick={() => navigate('/quotations/new')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Plus size={18} className="mr-2" />
                    Create Quotation
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredQuotations.map((quotation) => (
                  <div
                    key={quotation.id}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                            <FileCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                              {quotation.quotationNumber}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                              {quotation.title}
                            </p>
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDropdown(quotation.id);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {dropdownOpen === quotation.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1 border border-gray-200 dark:border-gray-700">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdown(quotation.id);
                                  handlePreviewPDF(quotation.id);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Eye size={16} />
                                Preview
                              </button>
                              {hasPermission('deal.update') && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDropdown(quotation.id);
                                    handleEdit(quotation.id);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Edit size={16} />
                                  Edit
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdown(quotation.id);
                                  handleDownloadPDF(quotation.id);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Download size={16} />
                                Download
                              </button>
                              {hasPermission('deal.delete') && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDropdown(quotation.id);
                                    handleDelete(quotation.id);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                          {getStatusIcon(quotation.status)}
                          {quotation.status}
                        </span>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {quotation.currency} {quotation.totalAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      {quotation.customerName && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <User size={14} />
                          <span className="truncate">{quotation.customerName}</span>
                        </div>
                      )}
                      {quotation.customerEmail && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail size={14} />
                          <span className="truncate">{quotation.customerEmail}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar size={14} />
                        <span>Created: {new Date(quotation.createdAt).toLocaleDateString()}</span>
                      </div>
                      {quotation.validUntil && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock size={14} />
                          <span>Valid: {new Date(quotation.validUntil).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="pt-2 flex items-center justify-between">
                        <button
                          onClick={() => navigate(`/quotations/${quotation.id}`)}
                          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                        >
                          View Details
                        </button>
                        {quotation.status === 'ACCEPTED' && hasPermission('deal.update') && (
                          <button
                            onClick={(e) => handleBookOrder(quotation.id, e)}
                            disabled={processingInvoice === quotation.id}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            <Send size={12} />
                            {processingInvoice === quotation.id ? 'Processing...' : 'Book Order'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
            <MetaBar
              currentPage={pagination.currentPage}
              itemsPerPage={pagination.itemsPerPage}
              totalItems={pagination.totalItems}
              onItemsPerPageChange={(n) => {
                setItemsPerPage(n);
                setCurrentPage(1);
              }}
              columnConfig={{
                columns: [
                  { id: 'quotationNumber', label: 'Quotation' },
                  { id: 'customer', label: 'Customer' },
                  { id: 'email', label: 'Email' },
                  { id: 'related', label: 'Related' },
                  { id: 'amount', label: 'Amount' },
                  { id: 'status', label: 'Status' },
                  { id: 'date', label: 'Date' },
                ],
                visibleColumns,
                onChange: setVisibleColumns,
                minVisible: 1,
              }}
            />
            <div className="overflow-x-auto">
              <div className="min-w-[1000px]">
                {/* Table Header */}
                <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                  <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {visibleColumns.includes('quotationNumber') && <div className="col-span-2">Quotation</div>}
                    {visibleColumns.includes('customer') && <div className="col-span-2">Customer</div>}
                    {visibleColumns.includes('email') && <div className="col-span-2">Email</div>}
                    {visibleColumns.includes('related') && <div className="col-span-1">Related</div>}
                    {visibleColumns.includes('amount') && <div className="col-span-1">Amount</div>}
                    {visibleColumns.includes('status') && <div className="col-span-1">Status</div>}
                    {visibleColumns.includes('date') && <div className="col-span-1">Date</div>}
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                </div>

                {/* Table Body */}
                {filteredQuotations.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileCheck size={40} className="text-gray-400 dark:text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No Quotations Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      {searchQuery || statusFilter !== 'ALL'
                        ? 'Try adjusting your filters or search terms'
                        : 'Create your first quotation to get started with tracking your sales pipeline'}
                    </p>
                    {hasPermission('deal.create') && (
                      <Button
                        onClick={() => navigate('/quotations/new')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <Plus size={18} className="mr-2" />
                        Create Quotation
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredQuotations.map((quotation) => (
                      <div
                        key={quotation.id}
                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors items-center cursor-pointer"
                        onClick={() => navigate(`/quotations/${quotation.id}`)}
                      >
                        {/* Quotation Number & Title */}
                        {visibleColumns.includes('quotationNumber') && (
                          <div className="col-span-2 min-w-0">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                                <FileCheck className="text-indigo-600 dark:text-indigo-400" size={18} />
                              </div>
                              <div className="min-w-0 overflow-hidden">
                                <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                  {quotation.quotationNumber}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {quotation.title}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Customer */}
                        {visibleColumns.includes('customer') && (
                          <div className="col-span-2 min-w-0">
                            <div className="flex items-center gap-2">
                              <User size={14} className="text-gray-400" />
                              <div className="text-sm text-gray-900 dark:text-white font-medium truncate">
                                {quotation.customerName || '-'}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Email */}
                        {visibleColumns.includes('email') && (
                          <div className="col-span-2 min-w-0">
                            <div className="flex items-center gap-2">
                              <Mail size={14} className="text-gray-400" />
                              <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                {quotation.customerEmail || '-'}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Related */}
                        {visibleColumns.includes('related') && (
                          <div className="col-span-1 min-w-0">
                            <div className="text-xs text-gray-600 dark:text-gray-400 truncate capitalize">
                              {quotation.relatedType ? `${quotation.relatedType}${quotation.relatedTo ? `: ${quotation.relatedTo}` : ''}` : '-'}
                            </div>
                          </div>
                        )}

                        {/* Amount */}
                        {visibleColumns.includes('amount') && (
                          <div className="col-span-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <DollarSign size={14} className="text-gray-400" />
                              <div className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                {quotation.currency} {quotation.totalAmount.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Status */}
                        {visibleColumns.includes('status') && (
                          <div className="col-span-1 min-w-0">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                              {getStatusIcon(quotation.status)}
                              {quotation.status}
                            </span>
                          </div>
                        )}

                        {/* Date - More compact layout */}
                        {visibleColumns.includes('date') && (
                          <div className="col-span-1 min-w-0">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                                <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                  {new Date(quotation.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              {quotation.validUntil && (
                                <div className="flex items-center gap-1">
                                  <Clock size={12} className="text-gray-400 flex-shrink-0" />
                                  <div className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                                    Valid: {new Date(quotation.validUntil).toLocaleDateString()}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions - Wider column with proper spacing */}
                        <div
                          className="col-span-2 flex items-center justify-end gap-1 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewPDF(quotation.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Preview"
                          >
                            <Eye size={14} />
                          </button>
                          {hasPermission('deal.update') && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(quotation.id);
                                }}
                                className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              {quotation.status === 'ACCEPTED' && (
                                <button
                                  onClick={(e) => handleBookOrder(quotation.id, e)}
                                  disabled={processingInvoice === quotation.id}
                                  className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Book Sales Order & Create Invoice"
                                >
                                  <Send size={14} />
                                </button>
                              )}
                            </>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPDF(quotation.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Download"
                          >
                            <Download size={14} />
                          </button>
                          {hasPermission('deal.delete') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(quotation.id);
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-gray-800 px-6 py-4 rounded-xl shadow-sm gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-medium text-gray-900 dark:text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, pagination.totalItems)}</span> of <span className="font-medium text-gray-900 dark:text-white">{pagination.totalItems}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === pageNum
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationsPage;
