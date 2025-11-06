import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Receipt, Plus, Eye, Download, Filter, Search, Edit, Trash2, Send, DollarSign } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import { toast } from 'react-toastify';

interface Invoice {
  id: string | number;
  invoiceNumber: string;
  title: string;
  totalAmount: number | string;
  paidAmount?: number | string;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';
  dueDate?: string;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  relatedTo?: string;
  relatedType?: 'lead' | 'deal' | 'contact';
}

const InvoicesPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchInvoices();
  }, [searchQuery, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/invoices', {
        params: {
          search: searchQuery || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        }
      });
      if (response.data.success) {
        const data = response.data.data || {};
        const items = Array.isArray(data) ? data : (data.items || []);
        // Map API response to Invoice interface
        const mappedInvoices = items.map((item: any) => ({
          id: item.id,
          invoiceNumber: item.invoiceNumber,
          title: item.title,
          totalAmount: Number(item.totalAmount) || 0,
          paidAmount: Number(item.paidAmount) || 0,
          currency: item.currency || 'USD',
          status: item.status,
          dueDate: item.dueDate,
          createdAt: item.createdAt,
          customerName: item.lead ? `${item.lead.firstName || ''} ${item.lead.lastName || ''}`.trim() || item.lead.company : undefined,
          customerEmail: item.lead?.email,
          relatedTo: item.deal ? `Deal #${item.deal.id}` : item.lead ? `Lead #${item.lead.id}` : undefined,
          relatedType: item.dealId ? 'deal' : item.leadId ? 'lead' : undefined,
        }));
        setInvoices(mappedInvoices);
      }
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast.error(error?.response?.data?.message || 'Failed to fetch invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      VIEWED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      PAID: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      REFUNDED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inv.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-weconnect-red"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Receipt className="text-emerald-600 dark:text-emerald-400" size={32} />
              Invoices
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track payments and manage all your invoices
            </p>
          </div>
          {hasPermission('deal.create') && (
            <Button 
              className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
              onClick={() => {
                const entityType = searchParams.get('entityType');
                const entityId = searchParams.get('entityId');
                if (entityType && entityId) {
                  navigate(`/invoices/new?entityType=${entityType}&entityId=${entityId}`);
                } else {
                  navigate('/invoices/new');
                }
              }}
            >
              <Plus size={20} />
              Create Invoice
            </Button>
          )}
        </div>

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:text-white"
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="VIEWED">Viewed</option>
                <option value="PAID">Paid</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800">
            <div className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Total Invoices</div>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">{invoices.length}</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <div className="text-green-600 dark:text-green-400 text-sm font-medium">Paid</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
              {invoices.filter(inv => inv.status === 'PAID').length}
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
            <div className="text-red-600 dark:text-red-400 text-sm font-medium">Overdue</div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
              {invoices.filter(inv => inv.status === 'OVERDUE').length}
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Revenue</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
              ${invoices.reduce((sum, inv) => sum + (Number(inv.paidAmount) || 0), 0).toLocaleString()}
            </div>
          </Card>
        </div>

        {/* Invoices List */}
        <div className="space-y-4">
          {filteredInvoices.length === 0 ? (
            <Card className="p-12 text-center">
              <Receipt size={64} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Invoices Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery || statusFilter !== 'ALL' 
                  ? 'Try adjusting your filters' 
                  : 'Create your first invoice to get started'}
              </p>
              {hasPermission('deal.create') && (
                <Button onClick={() => navigate('/invoices/new')}>Create Invoice</Button>
              )}
            </Card>
          ) : (
            filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="p-6 hover:shadow-2xl transition-all duration-200 hover:scale-[1.01]">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 rounded-2xl">
                      <Receipt size={28} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {invoice.invoiceNumber}
                        </h3>
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {invoice.title}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>Customer: <span className="font-medium text-gray-900 dark:text-white">{invoice.customerName}</span></span>
                        {invoice.relatedTo && (
                          <span>•</span>
                        )}
                        {invoice.relatedTo && (
                          <span>Related: <span className="font-medium text-gray-900 dark:text-white">{invoice.relatedTo}</span></span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <span>Created: {new Date(invoice.createdAt).toLocaleDateString()}</span>
                        {invoice.dueDate && (
                          <>
                            <span>•</span>
                            <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                      {/* Payment Progress */}
                      {invoice.status === 'PARTIALLY_PAID' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>Payment Progress</span>
                            <span>${(Number(invoice.paidAmount) || 0).toLocaleString()} / ${Number(invoice.totalAmount).toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${((Number(invoice.paidAmount) || 0) / Number(invoice.totalAmount)) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-6">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {invoice.currency} ${Number(invoice.totalAmount).toLocaleString()}
                    </div>
                    {invoice.status === 'PARTIALLY_PAID' && (
                      <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-3 font-medium">
                        ${(Number(invoice.paidAmount) || 0).toLocaleString()} paid
                      </div>
                    )}
                    {invoice.status === 'PAID' && (
                      <div className="text-sm text-green-600 dark:text-green-400 mb-3 font-medium flex items-center justify-end gap-1">
                        <DollarSign size={14} />
                        Fully Paid
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-3">
                      <Button 
                        size="SM" 
                        variant="GHOST" 
                        title="View"
                        onClick={async () => {
                          try {
                            const res = await apiClient.get(`/invoices/${invoice.id}/pdf/preview`, { responseType: 'blob' });
                            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                            window.open(url, '_blank');
                          } catch (error: any) {
                            toast.error(error?.response?.data?.message || 'Failed to preview invoice');
                          }
                        }}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button 
                        size="SM" 
                        variant="GHOST" 
                        title="Edit"
                        onClick={() => navigate(`/invoices/edit/${invoice.id}`)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        size="SM" 
                        variant="GHOST" 
                        title="Download"
                        onClick={async () => {
                          try {
                            const res = await apiClient.get(`/invoices/${invoice.id}/pdf/download`, { responseType: 'blob' });
                            const url = URL.createObjectURL(new Blob([res.data]));
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${invoice.invoiceNumber || 'invoice'}.pdf`;
                            a.click();
                            toast.success('Invoice downloaded successfully');
                          } catch (error: any) {
                            toast.error(error?.response?.data?.message || 'Failed to download invoice');
                          }
                        }}
                      >
                        <Download size={16} />
                      </Button>
                      {invoice.status === 'DRAFT' && (
                        <Button 
                          size="SM" 
                          variant="PRIMARY" 
                          className="ml-2" 
                          title="Send"
                          onClick={async () => {
                            try {
                              await apiClient.put(`/invoices/${invoice.id}/send`);
                              toast.success('Invoice sent successfully');
                              fetchInvoices();
                            } catch (error: any) {
                              toast.error(error?.response?.data?.message || 'Failed to send invoice');
                            }
                          }}
                        >
                          <Send size={16} />
                        </Button>
                      )}
                      <Button 
                        size="SM" 
                        variant="GHOST" 
                        className="text-red-600 hover:text-red-700" 
                        title="Delete"
                        onClick={async () => {
                          if (!window.confirm('Are you sure you want to delete this invoice?')) {
                            return;
                          }
                          try {
                            await apiClient.delete(`/invoices/${invoice.id}`);
                            toast.success('Invoice deleted successfully');
                            fetchInvoices();
                          } catch (error: any) {
                            toast.error(error?.response?.data?.message || 'Failed to delete invoice');
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;
