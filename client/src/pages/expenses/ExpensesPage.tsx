import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DollarSign, Plus, Search, Calendar, User, Building, FileText, CheckCircle, XCircle, Clock, Edit, Trash2 } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import { expenseService, ExpensePayload, ExpenseType, ExpenseStatus } from '../../services/expenseService';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';
import DropdownFilter from '../../components/DropdownFilter';
import { useAuth } from '../../contexts/AuthContext';

interface Expense {
  id: number;
  expenseDate: string;
  createdAt: string;
  amount: number;
  type: ExpenseType;
  description?: string;
  remarks?: string;
  receiptUrl?: string;
  status: ExpenseStatus;
  currency: string;
  exceedsBudget?: boolean;
  approvedAt?: string | null;
  submittedByUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdByUser?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  approvedByUser?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  rejectedByUser?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  deal?: {
    id: number;
    title: string;
  };
  lead?: {
    id: number;
    firstName: string;
    lastName: string;
    company: string;
  };
}

const ExpensesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasPermission, hasRole } = useAuth();
  const [searchParams] = useSearchParams();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [users, setUsers] = useState<Array<{ id: number; firstName: string; lastName: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL');
  const [form, setForm] = useState<Partial<ExpensePayload>>({
    expenseDate: new Date().toISOString().split('T')[0],
    amount: 0,
    type: 'TRAVEL',
    description: '',
    remarks: '',
    receiptUrl: '',
    submittedBy: user?.id || 0,
    currency: 'USD',
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selected, setSelected] = useState<Expense | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ExpensePayload>>({});

  const expenseTypes: ExpenseType[] = [
    'TRAVEL',
    'MEALS',
    'ACCOMMODATION',
    'OFFICE_SUPPLIES',
    'UTILITIES',
    'MARKETING',
    'ENTERTAINMENT',
    'TRAINING',
    'EQUIPMENT',
    'SOFTWARE',
    'CONSULTING',
    'MISCELLANEOUS',
    'OTHER',
  ];

  useEffect(() => {
    fetchExpenses();
    fetchUsers();
  }, [searchQuery, statusFilter, typeFilter, currencyFilter, startDate, endDate]);

  const fetchUsers = async () => {
    try {
      const resp = await userService.getUsers({ page: 1, limit: 100 });
      const items = resp?.data?.users || resp?.data || resp?.users || [];
      setUsers(items.map((u: any) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName })));
    } catch {}
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expenseService.list({
        page: 1,
        limit: 100,
        search: searchQuery || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        currency: currencyFilter !== 'ALL' ? currencyFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      
      if (response.success) {
        const data = response.data || {};
        const items = Array.isArray(data) ? data : (data.items || data.expenses || []);
        setExpenses(items);
      }
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      toast.error(error?.response?.data?.message || 'Failed to fetch expenses');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async () => {
    if (!form.expenseDate) {
      toast.error('Expense date is required');
      return;
    }
    if (!form.amount || form.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    if (!user?.id) {
      toast.error('User information not available');
      return;
    }

    try {
      const payload: ExpensePayload = {
        expenseDate: new Date(form.expenseDate).toISOString(),
        amount: form.amount!,
        type: form.type as ExpenseType,
        description: form.description || undefined,
        remarks: form.remarks || undefined,
        submittedBy: user.id,
        currency: form.currency || 'USD',
      };
      
      const created = await expenseService.create(payload);
      const createdExpense = created?.data?.expense || created?.data || created?.expense;

      // Upload receipt if provided and then update expense with a download URL
      if (receiptFile && createdExpense?.id) {
        try {
          const up = await expenseService.uploadReceipt(createdExpense.id, receiptFile, `receipt-${createdExpense.id}`);
          const file = up?.data?.file || up?.file;
          const downloadUrl = file?.id ? `/files/${file.id}/download?disposition=inline` : file?.filePath;
          if (downloadUrl) await expenseService.update(createdExpense.id, { receiptUrl: downloadUrl });
        } catch (err) {
          console.error('Receipt upload failed:', err);
          toast.warn('Expense created, but receipt upload failed');
        }
      }

      toast.success('Expense created successfully');
      setShowNew(false);
      setReceiptFile(null);
      setForm({
        expenseDate: new Date().toISOString().split('T')[0],
        amount: 0,
        type: 'TRAVEL',
        description: '',
        remarks: '',
        receiptUrl: '',
        submittedBy: user.id,
        currency: 'USD',
      });
      fetchExpenses();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to create expense');
    }
  };

  const getStatusColor = (status: ExpenseStatus) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      REIMBURSED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    };
    return colors[status] || colors.PENDING;
  };

  const getStatusIcon = (status: ExpenseStatus) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="text-green-600 dark:text-green-400" size={18} />;
      case 'REJECTED':
        return <XCircle className="text-red-600 dark:text-red-400" size={18} />;
      case 'REIMBURSED':
        return <CheckCircle className="text-blue-600 dark:text-blue-400" size={18} />;
      default:
        return <Clock className="text-yellow-600 dark:text-yellow-400" size={18} />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const openView = (expense: Expense) => {
    setSelected(expense);
    setEditing(false);
    setEditForm({
      expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0],
      amount: expense.amount,
      type: expense.type,
      description: expense.description,
      remarks: expense.remarks,
      currency: expense.currency,
      submittedBy: expense.submittedByUser?.id || user?.id || 0,
      dealId: expense.deal?.id,
      leadId: expense.lead?.id,
    });
  };

  const saveEdit = async () => {
    if (!selected) return;
    try {
      await expenseService.update(selected.id, {
        ...editForm,
        expenseDate: editForm.expenseDate ? new Date(editForm.expenseDate).toISOString() : undefined,
      });
      toast.success('Expense updated');
      setEditing(false);
      fetchExpenses();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update expense');
    }
  };

  const deleteExpense = async () => {
    if (!selected) return;
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expenseService.remove(selected.id);
      toast.success('Expense deleted');
      setSelected(null);
      fetchExpenses();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to delete expense');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <DollarSign className="text-emerald-600 dark:text-emerald-400" size={32} />
              Expense Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track and manage all your expenses
            </p>
          </div>
          <Button 
            className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => setShowNew(!showNew)}
          >
            <Plus size={20} />
            Create Expense
          </Button>
        </div>

        {/* Create Expense Form */}
        {showNew && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create New Expense</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expense Date *
                </label>
                <input
                  type="date"
                  value={form.expenseDate}
                  onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type *
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as ExpenseType })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                  required
                >
                  {expenseTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Currency
                </label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                  <option value="AUD">AUD</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Upload Receipt (optional)
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                  rows={3}
                  placeholder="Additional details about this expense..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Remarks
                </label>
                <textarea
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                  rows={2}
                  placeholder="Internal notes..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="OUTLINE" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button onClick={createExpense}>Create Expense</Button>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="w-full md:w-48">
              <DropdownFilter
                label="Status"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as string)}
                options={[
                  { value: 'ALL', label: 'All Status' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'APPROVED', label: 'Approved' },
                  { value: 'REJECTED', label: 'Rejected' },
                  { value: 'REIMBURSED', label: 'Reimbursed' },
                ]}
              />
            </div>
            <div className="w-full md:w-48">
              <DropdownFilter
                label="Type"
                value={typeFilter}
                onChange={(value) => setTypeFilter(value as string)}
                options={[
                  { value: 'ALL', label: 'All Types' },
                  ...expenseTypes.map((type) => ({
                    value: type,
                    label: type.replace('_', ' '),
                  })),
                ]}
              />
            </div>
            <div className="w-full md:w-40">
              <DropdownFilter
                label="Currency"
                value={currencyFilter}
                onChange={(value) => setCurrencyFilter(value as string)}
                options={[
                  { value: 'ALL', label: 'All Currencies' },
                  { value: 'USD', label: 'USD' },
                  { value: 'EUR', label: 'EUR' },
                  { value: 'GBP', label: 'GBP' },
                  { value: 'INR', label: 'INR' },
                  { value: 'AUD', label: 'AUD' },
                  { value: 'CAD', label: 'CAD' },
                ]}
              />
            </div>
            <div className="w-full md:w-40">
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:text-white" />
            </div>
            <div className="w-full md:w-40">
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:text-white" />
            </div>
          </div>
        </Card>

        {/* Expenses List */}
        <Card className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">No expenses found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'Create your first expense to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {expense.type.replace('_', ' ')}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                          {getStatusIcon(expense.status)}
                          {expense.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(expense.expenseDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <DollarSign size={14} />
                          {formatCurrency(expense.amount, expense.currency)}
                          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">({expense.currency})</span>
                        </span>
                        {(expense.createdByUser || expense.submittedByUser) && (
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {(expense.createdByUser?.firstName || expense.submittedByUser?.firstName) || ''} {(expense.createdByUser?.lastName || expense.submittedByUser?.lastName) || ''}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Created: {new Date(expense.createdAt).toLocaleDateString()} {new Date(expense.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {expense.lead && (
                          <span className="flex items-center gap-1">
                            <Building size={14} />
                            {expense.lead.firstName} {expense.lead.lastName} ({expense.lead.company})
                          </span>
                        )}
                        {expense.deal && (
                          <span className="flex items-center gap-1">
                            <FileText size={14} />
                            {expense.deal.title}
                          </span>
                        )}
                      </div>
                      {expense.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{expense.description}</p>
                      )}
                      {expense.approvedByUser && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Approved by: {expense.approvedByUser.firstName} {expense.approvedByUser.lastName}{expense.approvedAt ? ` on ${new Date(expense.approvedAt).toLocaleString()}` : ''}
                        </p>
                      )}
                      {expense.rejectedByUser && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Rejected by: {expense.rejectedByUser.firstName} {expense.rejectedByUser.lastName}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {(hasPermission('expense.read') || hasRole('Admin')) && (
                        <Button
                          variant="OUTLINE"
                          size="sm"
                          onClick={() => openView(expense)}
                          title="View"
                        >
                          View
                        </Button>
                      )}
                      {(hasPermission('expense.approve') || hasRole('Admin')) && expense.status === 'PENDING' && (
                        <>
                          <Button
                            className="bg-green-500 hover:bg-green-600 text-white"
                            size="sm"
                            onClick={async () => {
                              const remarks = prompt('Approval remarks (optional)');
                              try {
                                await expenseService.approve(expense.id, { status: 'APPROVED', reviewedBy: user!.id, approvalRemarks: remarks || undefined });
                                toast.success('Expense approved');
                                fetchExpenses();
                              } catch (e: any) {
                                toast.error(e?.response?.data?.message || 'Approval failed');
                              }
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            className="bg-rose-500 hover:bg-rose-600 text-white"
                            size="sm"
                            onClick={async () => {
                              const remarks = prompt('Rejection remarks (optional)');
                              try {
                                await expenseService.approve(expense.id, { status: 'REJECTED', reviewedBy: user!.id, approvalRemarks: remarks || undefined });
                                toast.success('Expense rejected');
                                fetchExpenses();
                              } catch (e: any) {
                                toast.error(e?.response?.data?.message || 'Rejection failed');
                              }
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* View/Edit Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Expense #{selected.id}</h3>
              <div className="flex gap-2">
                {(hasPermission('expense.update') || hasRole('Admin')) && selected.status === 'PENDING' && (
                  <Button variant="OUTLINE" onClick={() => setEditing((v) => !v)}>
                    <Edit size={16} /> {editing ? 'Cancel' : 'Edit'}
                  </Button>
                )}
                {(hasPermission('expense.delete') || hasRole('Admin')) && (
                  <Button variant="OUTLINE" onClick={deleteExpense}>
                    <Trash2 size={16} /> Delete
                  </Button>
                )}
                <Button variant="OUTLINE" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </div>

            {!editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Date</div>
                  <div className="text-gray-900 dark:text-white">{new Date(selected.expenseDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Amount</div>
                  <div className="text-gray-900 dark:text-white">{formatCurrency(selected.amount, selected.currency)}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Type</div>
                  <div className="text-gray-900 dark:text-white">{selected.type.replace('_', ' ')}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Created At</div>
                  <div className="text-gray-900 dark:text-white">{new Date(selected.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Currency</div>
                  <div className="text-gray-900 dark:text-white">{selected.currency}</div>
                </div>
                {selected.description && (
                  <div className="md:col-span-2">
                    <div className="text-gray-500 dark:text-gray-400">Description</div>
                    <div className="text-gray-900 dark:text-white">{selected.description}</div>
                  </div>
                )}
                {selected.remarks && (
                  <div className="md:col-span-2">
                    <div className="text-gray-500 dark:text-gray-400">Remarks</div>
                    <div className="text-gray-900 dark:text-white">{selected.remarks}</div>
                  </div>
                )}
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Created By</div>
                  <div className="text-gray-900 dark:text-white">{selected.createdByUser ? `${selected.createdByUser.firstName} ${selected.createdByUser.lastName}` : '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Approved At</div>
                  <div className="text-gray-900 dark:text-white">{selected.approvedAt ? new Date(selected.approvedAt).toLocaleString() : '-'}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-gray-500 dark:text-gray-400">Status</div>
                  <div className="text-gray-900 dark:text-white">{selected.status}</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input type="date" value={editForm.expenseDate as string} onChange={(e) => setEditForm({ ...editForm, expenseDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                  <input type="number" step="0.01" min="0" value={editForm.amount ?? 0} onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select value={editForm.type as string} onChange={(e) => setEditForm({ ...editForm, type: e.target.value as ExpenseType })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white">
                    {expenseTypes.map((t) => (
                      <option key={t} value={t}>{t.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                  <select value={editForm.currency || 'USD'} onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                    <option value="AUD">AUD</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white" rows={3} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
                  <textarea value={editForm.remarks || ''} onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white" rows={2} />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button variant="OUTLINE" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button onClick={saveEdit}>Save</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;

