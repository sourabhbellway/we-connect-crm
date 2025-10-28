import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, Plus, Eye, Download, Filter, Search, Edit, Trash2, Send, DollarSign } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

interface Invoice {
  id: string;
  invoiceNumber: string;
  title: string;
  totalAmount: number;
  paidAmount: number;
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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    // TODO: Fetch invoices from API
    // Mock data for now
    setInvoices([
      {
        id: '1',
        invoiceNumber: 'INV-2025-001',
        title: 'Website Development - Phase 1',
        totalAmount: 7500,
        paidAmount: 7500,
        currency: 'USD',
        status: 'PAID',
        dueDate: '2025-02-15',
        createdAt: '2025-01-15',
        customerName: 'Acme Corporation',
        customerEmail: 'contact@acme.com',
        relatedTo: 'Deal #234',
        relatedType: 'deal'
      },
      {
        id: '2',
        invoiceNumber: 'INV-2025-002',
        title: 'Mobile App Development - Milestone 1',
        totalAmount: 12500,
        paidAmount: 5000,
        currency: 'USD',
        status: 'PARTIALLY_PAID',
        dueDate: '2025-02-28',
        createdAt: '2025-01-20',
        customerName: 'Tech Solutions Inc',
        customerEmail: 'info@techsolutions.com',
        relatedTo: 'Deal #567',
        relatedType: 'deal'
      },
      {
        id: '3',
        invoiceNumber: 'INV-2025-003',
        title: 'Consulting Services - January',
        totalAmount: 3500,
        paidAmount: 0,
        currency: 'USD',
        status: 'SENT',
        dueDate: '2025-02-10',
        createdAt: '2025-01-25',
        customerName: 'Global Enterprises',
        customerEmail: 'billing@globalent.com',
        relatedTo: 'Contact #890',
        relatedType: 'contact'
      }
    ]);
    setLoading(false);
  }, []);

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
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
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
            <Button className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow">
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
              ${invoices.reduce((sum, inv) => sum + inv.paidAmount, 0).toLocaleString()}
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
                <Button>Create Invoice</Button>
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
                            <span>${invoice.paidAmount.toLocaleString()} / ${invoice.totalAmount.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(invoice.paidAmount / invoice.totalAmount) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-6">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {invoice.currency} ${invoice.totalAmount.toLocaleString()}
                    </div>
                    {invoice.status === 'PARTIALLY_PAID' && (
                      <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-3 font-medium">
                        ${invoice.paidAmount.toLocaleString()} paid
                      </div>
                    )}
                    {invoice.status === 'PAID' && (
                      <div className="text-sm text-green-600 dark:text-green-400 mb-3 font-medium flex items-center justify-end gap-1">
                        <DollarSign size={14} />
                        Fully Paid
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-3">
                      <Button size="SM" variant="GHOST" title="View">
                        <Eye size={16} />
                      </Button>
                      <Button size="SM" variant="GHOST" title="Edit">
                        <Edit size={16} />
                      </Button>
                      <Button size="SM" variant="GHOST" title="Download">
                        <Download size={16} />
                      </Button>
                      {invoice.status === 'DRAFT' && (
                        <Button size="SM" variant="PRIMARY" className="ml-2" title="Send">
                          <Send size={16} />
                        </Button>
                      )}
                      <Button size="SM" variant="GHOST" className="text-red-600 hover:text-red-700" title="Delete">
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
