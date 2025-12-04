import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, DollarSign, Calendar, CheckCircle, Clock, AlertCircle, 
  Download, Eye, Plus, Search, Filter, MoreVertical, FileText, 
  TrendingUp, TrendingDown, Receipt, Banknote
} from 'lucide-react';
import { Button, Card } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { useBusinessSettings } from '../../contexts/BusinessSettingsContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';

interface Payment {
  id: string;
  paymentNumber: string;
  amount: number;
  currency: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'STRIPE' | 'RAZORPAY' | 'UPI' | 'CHEQUE' | 'OTHER';
  paymentDate: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  reference?: string;
  notes?: string;
  receiptUrl?: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  processedAt?: string;
  createdAt: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  title: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';
  dueDate?: string;
  issuedAt?: string;
  paidAt?: string;
  createdAt: string;
}

interface PaymentTrackerProps {
  entityType: 'lead' | 'deal' | 'contact' | 'company';
  entityId: string;
  payments: Payment[];
  invoices: Invoice[];
  currency?: string; // preferred currency from parent (e.g., deal currency)
}

const PaymentTracker: React.FC<PaymentTrackerProps> = ({ 
  entityType, 
  entityId, 
  payments: initialPayments,
  invoices: initialInvoices,
  currency: preferredCurrency 
}) => {
  const { user, hasPermission } = useAuth();
  const { formatCurrency, getCurrency } = useBusinessSettings();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  // Determine display currency preference: parent -> invoices -> business default
  const displayCurrency = preferredCurrency || invoices?.[0]?.currency || getCurrency();

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    currency: displayCurrency,
    paymentMethod: 'CASH',
    paymentDate: new Date().toISOString().slice(0,10),
    reference: '',
    notes: '',
    invoiceId: '',
  });

  // Calculate totals
  const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
  const totalOutstanding = invoices.reduce((sum, invoice) => sum + invoice.dueAmount, 0);
  const overdueInvoices = invoices.filter(invoice => 
    invoice.dueDate && new Date(invoice.dueDate) < new Date() && 
    ['SENT', 'VIEWED', 'PARTIALLY_PAID'].includes(invoice.status)
  );

  const getPaymentMethodIcon = (method: string) => {
    const icons = {
      CASH: Banknote,
      BANK_TRANSFER: CreditCard,
      CREDIT_CARD: CreditCard,
      DEBIT_CARD: CreditCard,
      PAYPAL: CreditCard,
      STRIPE: CreditCard,
      RAZORPAY: CreditCard,
      UPI: CreditCard,
      CHEQUE: Receipt,
      OTHER: DollarSign
    };
    return icons[method as keyof typeof icons] || DollarSign;
  };

  const getStatusColor = (status: string, type: 'payment' | 'invoice') => {
    if (type === 'payment') {
      const colors = {
        PENDING: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300',
        PROCESSING: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
        COMPLETED: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
        FAILED: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
        CANCELLED: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
        REFUNDED: 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300'
      };
      return colors[status as keyof typeof colors] || colors.PENDING;
    } else {
      const colors = {
        DRAFT: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
        SENT: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
        VIEWED: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300',
        PAID: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
        PARTIALLY_PAID: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300',
        OVERDUE: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
        CANCELLED: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
        REFUNDED: 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300'
      };
      return colors[status as keyof typeof colors] || colors.DRAFT;
    }
  };

  const getStatusIcon = (status: string, type: 'payment' | 'invoice') => {
    if (type === 'payment') {
      switch (status) {
        case 'COMPLETED':
          return <CheckCircle size={16} className="text-green-600" />;
        case 'PROCESSING':
          return <Clock size={16} className="text-blue-600" />;
        case 'FAILED':
          return <AlertCircle size={16} className="text-red-600" />;
        default:
          return <Clock size={16} className="text-yellow-600" />;
      }
    } else {
      switch (status) {
        case 'PAID':
          return <CheckCircle size={16} className="text-green-600" />;
        case 'OVERDUE':
          return <AlertCircle size={16} className="text-red-600" />;
        case 'PARTIALLY_PAID':
          return <Clock size={16} className="text-orange-600" />;
        default:
          return <FileText size={16} className="text-gray-600" />;
      }
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchTerm === '' || 
      payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Payment Tracker
        </h2>
        <div className="flex items-center space-x-3">
          {hasPermission(`${entityType}.create`) && (
            <>
              <Button 
                variant="OUTLINE" 
                className="flex items-center gap-2"
                onClick={() => navigate(`/invoices/new?entityType=${entityType}&entityId=${entityId}`)}
              >
                <FileText size={16} />
                Create Invoice
              </Button>
              <Button className="flex items-center gap-2" onClick={() => setShowPaymentModal(true)}>
                <Plus size={16} />
                Record Payment
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Invoiced</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalInvoiced, displayCurrency)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Paid</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalPaid, displayCurrency)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-300" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Outstanding</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalOutstanding, displayCurrency)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-300" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overdueInvoices.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'invoices', label: 'Invoices', icon: FileText },
            { id: 'payments', label: 'Payments', icon: CreditCard }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-weconnect-red text-weconnect-red'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Payment Summary
            </h3>
            {totalInvoiced > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Payment Progress</span>
                  <span>{Math.round((totalPaid / totalInvoiced) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 bg-green-600 rounded-full transition-all duration-300"
                    style={{ width: `${(totalPaid / totalInvoiced) * 100}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Paid</p>
                    <p className="font-semibold text-green-600">{formatCurrency(totalPaid, getCurrency())}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Outstanding</p>
                    <p className="font-semibold text-orange-600">{formatCurrency(totalOutstanding, getCurrency())}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No invoices created yet.</p>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      payment.status === 'COMPLETED' ? 'bg-green-500' : 
                      payment.status === 'FAILED' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Payment {payment.paymentNumber}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(payment.amount, payment.currency)}
                  </span>
                </div>
              ))}
              {payments.length === 0 && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">No payments recorded yet.</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-weconnect-red focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-weconnect-red focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          {/* Invoice List */}
          {filteredInvoices.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Invoices Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first invoice to start tracking payments.
              </p>
              {hasPermission(`${entityType}.create`) && (
                <Button onClick={() => navigate(`/invoices/new?entityType=${entityType}&entityId=${entityId}`)}>Create Invoice</Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <Card key={invoice.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        {getStatusIcon(invoice.status, 'invoice')}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {invoice.invoiceNumber}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {invoice.title}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>Created: {new Date(invoice.createdAt).toLocaleDateString()}</span>
                          {invoice.dueDate && (
                            <span className={isOverdue(invoice.dueDate) ? 'text-red-600 font-medium' : ''}>
                              Due: {new Date(invoice.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status, 'invoice')}`}>
                          {invoice.status.replace('_', ' ')}
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(invoice.totalAmount, invoice.currency)}
                        </span>
                      </div>
                      
                      {invoice.status === 'PARTIALLY_PAID' && (
                        <div className="text-sm">
                          <span className="text-green-600">Paid: {formatCurrency(invoice.paidAmount, invoice.currency)}</span>
                          <span className="text-orange-600 ml-2">Due: {formatCurrency(invoice.dueAmount, invoice.currency)}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 mt-2">
                        <Button size="SM" variant="GHOST">
                          <Eye size={14} />
                        </Button>
                        <Button size="SM" variant="GHOST">
                          <Download size={14} />
                        </Button>
                        <Button size="SM" variant="GHOST">
                          <MoreVertical size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-weconnect-red focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-weconnect-red focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Payment List */}
          {filteredPayments.length === 0 ? (
            <Card className="p-8 text-center">
              <CreditCard size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Payments Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Record your first payment to start tracking transactions.
              </p>
              {hasPermission(`${entityType}.create`) && (
                <Button onClick={() => setShowPaymentModal(true)}>Record Payment</Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => {
                const PaymentMethodIcon = getPaymentMethodIcon(payment.paymentMethod);
                return (
                  <Card key={payment.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <PaymentMethodIcon size={20} className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {payment.paymentNumber}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {payment.paymentMethod.replace('_', ' ')} • {new Date(payment.paymentDate).toLocaleDateString()}
                          </p>
                          {payment.reference && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Ref: {payment.reference}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status, 'payment')}`}>
                            {getStatusIcon(payment.status, 'payment')}
                            <span className="ml-1">{payment.status}</span>
                          </span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatCurrency(payment.amount, payment.currency)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {payment.receiptUrl && (
                            <Button size="SM" variant="GHOST">
                              <Receipt size={14} />
                            </Button>
                          )}
                          <Button size="SM" variant="GHOST">
                            <Eye size={14} />
                          </Button>
                          <Button size="SM" variant="GHOST">
                            <MoreVertical size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">Record Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Amount</label>
                <input 
                  type="number" 
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Currency</label>
                <input 
                  type="text" 
                  value={paymentForm.currency}
                  onChange={(e) => setPaymentForm({ ...paymentForm, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="PAYPAL">PayPal</option>
                  <option value="STRIPE">Stripe</option>
                  <option value="RAZORPAY">Razorpay</option>
                  <option value="UPI">UPI</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Payment Date</label>
                <input 
                  type="date" 
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Reference</label>
                <input 
                  type="text" 
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Transaction ID, cheque no, etc."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Notes</label>
                <textarea 
                  rows={3}
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Optional notes"
                />
              </div>

              {/* Invoice selection */}
              {invoices.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Invoice Number {invoices.length > 0 && <span className="text-red-500">*</span>}</label>
                  <select
                    value={paymentForm.invoiceId}
                    onChange={(e) => {
                      const invoiceId = e.target.value;
                      setPaymentForm({ ...paymentForm, invoiceId });
                      const inv = invoices.find(i => String(i.id) === invoiceId);
                      if (inv && inv.dueAmount > 0 && (!paymentForm.amount || Number(paymentForm.amount) <= 0)) {
                        setPaymentForm(prev => ({ ...prev, amount: String(inv.dueAmount) }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="">-- Select invoice --</option>
                    {invoices
                      .filter(inv => (inv.dueAmount ?? Math.max(inv.totalAmount - (inv.paidAmount || 0), 0)) > 0)
                      .map((inv) => (
                        <option key={String(inv.id)} value={String(inv.id)}>
                          {inv.invoiceNumber} • Due {formatCurrency(inv.dueAmount ?? Math.max(inv.totalAmount - (inv.paidAmount || 0), 0), inv.currency)}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center gap-3 justify-end">
              <Button 
                onClick={async () => {
                  try {
                    if (invoices.length > 0 && !paymentForm.invoiceId) {
                      toast.error('Please select an invoice number');
                      return;
                    }
                    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
                      toast.error('Enter a valid amount');
                      return;
                    }
                    setIsSavingPayment(true);
                    const payload: any = {
                      amount: Number(paymentForm.amount),
                      currency: paymentForm.currency,
                      paymentMethod: paymentForm.paymentMethod,
                      paymentDate: new Date(paymentForm.paymentDate).toISOString(),
                      reference: paymentForm.reference || undefined,
                      notes: paymentForm.notes || undefined,
                      entityType,
                      entityId: Number(entityId),
                    };
                    if (entityType === 'deal') payload.dealId = Number(entityId);
                    if (entityType === 'lead') payload.leadId = Number(entityId);
                    if (paymentForm.invoiceId) payload.invoiceId = Number(paymentForm.invoiceId);
                    const res = await apiClient.post('/payments', payload);
                    const created = res?.data?.data?.payment || res?.data?.payment || res?.data;
                    if (created) {
                      setPayments(prev => [{
                        id: String(created.id || Date.now()),
                        paymentNumber: created.paymentNumber || `PMT-${created.id || Date.now()}`,
                        amount: Number(created.amount),
                        currency: created.currency || paymentForm.currency,
                        paymentMethod: created.paymentMethod || paymentForm.paymentMethod,
                        paymentDate: created.paymentDate || new Date().toISOString(),
                        status: created.status || 'COMPLETED',
                        reference: created.reference,
                        notes: created.notes,
                        receiptUrl: created.receiptUrl,
                        createdBy: created.createdBy || { id: String(user?.id || '0'), firstName: user?.firstName || '', lastName: user?.lastName || '' },
                        createdAt: created.createdAt || new Date().toISOString(),
                      }, ...prev]);
                      toast.success('Payment recorded');
                      setShowPaymentModal(false);
                      setPaymentForm({ amount: '', currency: displayCurrency, paymentMethod: 'CASH', paymentDate: new Date().toISOString().slice(0,10), reference: '', notes: '', invoiceId: '' });
                    }
                  } catch (e: any) {
                    toast.error(e?.response?.data?.message || 'Failed to record payment');
                  } finally {
                    setIsSavingPayment(false);
                  }
                }}
                disabled={isSavingPayment}
                className="bg-weconnect-red hover:bg-red-600"
              >
                {isSavingPayment ? 'Saving...' : 'Save Payment'}
              </Button>
              <Button variant="OUTLINE" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTracker;
