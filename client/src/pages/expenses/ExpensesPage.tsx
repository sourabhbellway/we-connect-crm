import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui';
import { expenseService, ExpensePayload, ExpenseType, ExpenseStatus } from '../../services/expenseService';
import {
  Calendar,
  User,
  Edit,
  Trash2,
  Eye,
  LayoutList,
  LayoutGrid,
  CheckCircle,
  XCircle,
  Clock,
  Receipt,
  Download,
  FileDown,
  FileText,
  CreditCard as DollarSign,
} from 'lucide-react';
import { useBusinessSettings } from '../../contexts/BusinessSettingsContext';
import SearchInput from '../../components/SearchInput';
import NoResults from '../../components/NoResults';
import DropdownFilter from '../../components/DropdownFilter';
import Pagination from '../../components/Pagination';
import { useDebouncedSearch } from '../../hooks/useDebounce';
import { toast } from 'react-toastify';
import MetaBar from '../../components/list/MetaBar';
import ListToolbar from '../../components/list/ListToolbar';
import TableSortHeader from '../../components/list/TableSortHeader';
import { exportToCsv, exportTableToPrintPdf } from '../../utils/exportUtils';

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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selected, setSelected] = useState<Expense | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ExpensePayload>>({});
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<Partial<ExpensePayload>>({
    expenseDate: new Date().toISOString().split('T')[0],
    amount: 0,
    type: 'TRAVEL',
    description: '',
    remarks: '',
    receiptUrl: '',
    submittedBy: 0,
    currency: 'USD',
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const { user, hasPermission, hasRole } = useAuth();
  const { formatCurrency, currencySettings } = useBusinessSettings();

  // Debounced search and local sort/filter/pagination
  const { searchValue, debouncedSearchValue, setSearch, isSearching } = useDebouncedSearch('', 500);
  type SortBy = 'createdAt' | 'expenseDate' | 'amount' | 'type' | 'status' | 'submittedBy';
  type SortOrder = 'asc' | 'desc';
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'type',
    'amount',
    'expenseDate',
    'submittedBy',
    'status',
    'createdAt',
  ]);

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
  }, []);

  // Load column visibility preferences
  useEffect(() => {
    try {
      const stored = localStorage.getItem('expenses_visible_columns');
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
      localStorage.setItem('expenses_visible_columns', JSON.stringify(visibleColumns));
    } catch {
      // ignore
    }
  }, [visibleColumns]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchValue, sortBy, sortOrder, statusFilter, typeFilter, currencyFilter, itemsPerPage]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await expenseService.list({
        page: 1,
        limit: 100,
        search: debouncedSearchValue || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        currency: currencyFilter !== 'ALL' ? currencyFilter : undefined,
      });

      if (response.success) {
        const data = response.data || {};
        const items = Array.isArray(data) ? data : (data.items || data.expenses || []);
        setExpenses(items);
      }
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      setError(err.response?.data?.message || 'Failed to fetch expenses');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter
  const filtered = expenses.filter((expense) => {
    const term = debouncedSearchValue.toLowerCase();
    const matchesSearch = !term ||
      expense.type.toLowerCase().includes(term) ||
      (expense.description?.toLowerCase().includes(term) ?? false) ||
      (expense.submittedByUser?.firstName.toLowerCase().includes(term) ?? false) ||
      (expense.submittedByUser?.lastName.toLowerCase().includes(term) ?? false);

    const matchesStatus = statusFilter === 'ALL' || expense.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || expense.type === typeFilter;
    const matchesCurrency = currencyFilter === 'ALL' || expense.currency === currencyFilter;

    return matchesSearch && matchesStatus && matchesType && matchesCurrency;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const dir = sortOrder === 'asc' ? 1 : -1;
    const getVal = (e: Expense) => {
      switch (sortBy) {
        case 'expenseDate':
          return e.expenseDate || '';
        case 'amount':
          return e.amount || 0;
        case 'type':
          return e.type || '';
        case 'status':
          return e.status || '';
        case 'submittedBy': {
          const name = e.submittedByUser
            ? `${e.submittedByUser.firstName} ${e.submittedByUser.lastName}`
            : '';
          return name.toLowerCase();
        }
        case 'createdAt':
        default:
          return e.createdAt || '';
      }
    };
    const va = getVal(a);
    const vb = getVal(b);

    // Numeric sort for amount
    if (sortBy === 'amount') return ((va as number) - (vb as number)) * dir;

    // Date sorts
    if (sortBy === 'createdAt' || sortBy === 'expenseDate') {
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

  const getStatusColor = (status: ExpenseStatus) => {
    const colors = {
      PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      APPROVED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      REJECTED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      REIMBURSED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    };
    return colors[status] || colors.PENDING;
  };

  const getStatusIcon = (status: ExpenseStatus) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="text-green-600 dark:text-green-400" size={14} />;
      case 'REJECTED':
        return <XCircle className="text-red-600 dark:text-red-400" size={14} />;
      case 'REIMBURSED':
        return <CheckCircle className="text-blue-600 dark:text-blue-400" size={14} />;
      default:
        return <Clock className="text-yellow-600 dark:text-yellow-400" size={14} />;
    }
  };

  const getTypeIcon = (type: ExpenseType) => {
    const icons: Record<string, string> = {
      TRAVEL: '✈️',
      MEALS: '🍽️',
      ACCOMMODATION: '🏨',
      OFFICE_SUPPLIES: '📦',
      UTILITIES: '⚡',
      MARKETING: '📢',
      ENTERTAINMENT: '🎬',
      TRAINING: '📚',
      EQUIPMENT: '🖥️',
      SOFTWARE: '💻',
      CONSULTING: '💼',
      MISCELLANEOUS: '📋',
      OTHER: '📄',
    };
    return icons[type] || '📄';
  };

  // formatCurrency is now taken from BusinessSettingsContext

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
      let expenseDateStr = form.expenseDate;
      if (expenseDateStr && !expenseDateStr.includes('T')) {
        expenseDateStr = new Date(expenseDateStr + 'T00:00:00').toISOString();
      } else if (expenseDateStr) {
        expenseDateStr = new Date(expenseDateStr).toISOString();
      }

      const payload: ExpensePayload = {
        expenseDate: expenseDateStr,
        amount: form.amount!,
        type: form.type as ExpenseType,
        description: form.description || undefined,
        remarks: form.remarks || undefined,
        submittedBy: user.id,
        currency: form.currency || 'USD',
      };

      const created = await expenseService.create(payload);
      const createdExpense = created?.data?.expense || created?.data || created?.expense;

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
      console.error('Error creating expense:', e);
      const errorMessage = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to create expense';
      toast.error(errorMessage);
    }
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
          title="Expenses"
          subtitle="Track and manage your expenses"
          addLabel="Add Expense"
          onAdd={(hasPermission('expense.create') || hasRole('Admin')) ? () => setShowNew(true) : undefined}
          bulkActions={[
            {
              label: 'Export Expenses (Excel)',
              icon: <FileDown className="w-4 h-4" />,
              onClick: () => {
                const cols = [
                  {
                    id: 'type',
                    label: 'Type',
                    value: (e: Expense) => e.type.replace('_', ' '),
                  },
                  {
                    id: 'amount',
                    label: 'Amount',
                    value: (e: Expense) => formatCurrency(e.amount, e.currency),
                  },
                  {
                    id: 'expenseDate',
                    label: 'Expense Date',
                    value: (e: Expense) => new Date(e.expenseDate).toLocaleDateString(),
                  },
                  {
                    id: 'submittedBy',
                    label: 'Submitted By',
                    value: (e: Expense) =>
                      e.submittedByUser
                        ? `${e.submittedByUser.firstName} ${e.submittedByUser.lastName}`
                        : '',
                  },
                  {
                    id: 'status',
                    label: 'Status',
                    value: (e: Expense) => e.status,
                  },
                  {
                    id: 'createdAt',
                    label: 'Created',
                    value: (e: Expense) => new Date(e.createdAt).toLocaleDateString(),
                  },
                ];
                const activeCols = cols.filter((c) => visibleColumns.includes(c.id));
                const headers = activeCols.map((c) => c.label);
                const rows = sorted.map((e) => activeCols.map((c) => c.value(e)));
                exportToCsv('expenses_export.csv', headers, rows);
              },
            },
            {
              label: 'Export Expenses (PDF)',
              icon: <FileText className="w-4 h-4" />,
              onClick: () => {
                const cols = [
                  {
                    id: 'type',
                    label: 'Type',
                    value: (e: Expense) => e.type.replace('_', ' '),
                  },
                  {
                    id: 'amount',
                    label: 'Amount',
                    value: (e: Expense) => formatCurrency(e.amount, e.currency),
                  },
                  {
                    id: 'expenseDate',
                    label: 'Expense Date',
                    value: (e: Expense) => new Date(e.expenseDate).toLocaleDateString(),
                  },
                  {
                    id: 'submittedBy',
                    label: 'Submitted By',
                    value: (e: Expense) =>
                      e.submittedByUser
                        ? `${e.submittedByUser.firstName} ${e.submittedByUser.lastName}`
                        : '',
                  },
                  {
                    id: 'status',
                    label: 'Status',
                    value: (e: Expense) => e.status,
                  },
                  {
                    id: 'createdAt',
                    label: 'Created',
                    value: (e: Expense) => new Date(e.createdAt).toLocaleDateString(),
                  },
                ];
                const activeCols = cols.filter((c) => visibleColumns.includes(c.id));
                const headers = activeCols.map((c) => c.label);
                const rows = sorted.map((e) => activeCols.map((c) => c.value(e)));
                exportTableToPrintPdf('Expenses', headers, rows);
              },
            },
          ]}
        />
      </div>

      {/* Create Expense Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Expense</h3>
              <button
                onClick={() => setShowNew(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expense Date *</label>
                  <input
                    type="date"
                    value={form.expenseDate}
                    onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-medium text-xs">
                      {currencySettings?.symbol || '$'}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as ExpenseType })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                    required
                  >
                    {expenseTypes.map((type) => (
                      <option key={type} value={type}>
                        {getTypeIcon(type)} {type.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Receipt</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
                  <textarea
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="OUTLINE" onClick={() => setShowNew(false)}>Cancel</Button>
                <Button onClick={createExpense}>Create Expense</Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              placeholder="Search expenses..."
              className="max-w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-48 sm:min-w-[220px]">
            <DropdownFilter
              label="Status"
              value={statusFilter}
              onChange={(v) => setStatusFilter((v as string))}
              options={[
                { value: 'ALL', label: 'All statuses' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'REJECTED', label: 'Rejected' },
                { value: 'REIMBURSED', label: 'Reimbursed' },
              ]}
            />
          </div>

          {/* Type Filter */}
          <div className="w-full sm:w-48 sm:min-w-[220px]">
            <DropdownFilter
              label="Type"
              value={typeFilter}
              onChange={(v) => setTypeFilter((v as string))}
              options={[
                { value: 'ALL', label: 'All types' },
                ...expenseTypes.map((type) => ({
                  value: type,
                  label: `${getTypeIcon(type)} ${type.replace('_', ' ')}`,
                })),
              ]}
            />
          </div>

          {/* Currency Filter */}
          <div className="w-full sm:w-48 sm:min-w-[220px]">
            <DropdownFilter
              label="Currency"
              value={currencyFilter}
              onChange={(v) => setCurrencyFilter((v as string))}
              options={[
                { value: 'ALL', label: 'All currencies' },
                { value: 'USD', label: 'USD' },
                { value: 'EUR', label: 'EUR' },
                { value: 'GBP', label: 'GBP' },
                { value: 'INR', label: 'INR' },
              ]}
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
                { value: 'expenseDate', label: 'Expense date' },
                { value: 'amount', label: 'Amount' },
                { value: 'type', label: 'Type' },
                { value: 'status', label: 'Status' },
                { value: 'submittedBy', label: 'Submitted By' },
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
            className={`flex items-center justify-center p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
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

      {/* List or Grid */}
      {viewMode === 'grid' ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 transition-all duration-300 p-6">
          {pageItems.length === 0 ? (
            <NoResults
              title="No expenses found"
              description={searchValue ? 'No expenses match your search criteria.' : 'Get started by creating your first expense.'}
              icon={<DollarSign className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
              showClearButton={!!searchValue}
              onClear={() => setSearch('')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pageItems.map((expense) => {
                return (
                  <div
                    key={expense.id}
                    className="rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    style={{ minHeight: '280px' }}
                  >
                    {/* Partition 1: Status Badge */}
                    <div className="px-4 pt-4 pb-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(expense.status)}`}>
                        {getStatusIcon(expense.status)}
                        {expense.status}
                      </span>
                    </div>

                    {/* Partition 2: Title & Description */}
                    <div className="px-4 pb-3 flex-1">
                      <h3
                        className="text-sm font-semibold text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => openView(expense)}
                      >
                        {getTypeIcon(expense.type)} {expense.type.replace('_', ' ')}
                      </h3>
                      {expense.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {expense.description}
                        </p>
                      )}

                      {/* Expense Amount */}
                      <div className="flex items-center text-sm font-semibold text-green-600 dark:text-green-400 mb-3">
                        <span className="truncate">
                          {formatCurrency(expense.amount, expense.currency)}
                        </span>
                      </div>

                      {/* Date & User Info */}
                      <div className="space-y-1.5">
                        <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                          <Calendar className="h-3 w-3 mr-1.5 flex-shrink-0" />
                          <span className="truncate">{new Date(expense.expenseDate).toLocaleDateString()}</span>
                        </div>
                        {expense.submittedByUser && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                            <User className="h-3 w-3 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{expense.submittedByUser.firstName} {expense.submittedByUser.lastName}</span>
                          </div>
                        )}
                        {expense.approvedByUser && (
                          <div className="text-xs text-green-600 dark:text-green-400 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1.5 flex-shrink-0" />
                            <span className="truncate">Approved by {expense.approvedByUser.firstName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Partition 3: Actions */}
                    <div className="px-4 pb-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        {/* Left: Receipt */}
                        {expense.receiptUrl && (
                          <button
                            onClick={() => window.open(expense.receiptUrl, '_blank')}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="View Receipt"
                          >
                            <Receipt className="h-4 w-4" />
                          </button>
                        )}

                        {/* Right: Action Buttons */}
                        <div className="flex items-center gap-1 ml-auto">
                          {(hasPermission('expense.read') || hasRole('Admin')) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openView(expense);
                              }}
                              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title="View Expense"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          {(hasPermission('expense.approve') || hasRole('Admin')) && expense.status === 'PENDING' && (
                            <>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const remarks = prompt('Approval remarks');
                                  try {
                                    await expenseService.approve(expense.id, { status: 'APPROVED', reviewedBy: user!.id, approvalRemarks: remarks || undefined });
                                    toast.success('Expense approved');
                                    fetchExpenses();
                                  } catch (e: any) {
                                    toast.error(e?.response?.data?.message || 'Approval failed');
                                  }
                                }}
                                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const remarks = prompt('Rejection remarks');
                                  try {
                                    await expenseService.approve(expense.id, { status: 'REJECTED', reviewedBy: user!.id, approvalRemarks: remarks || undefined });
                                    toast.success('Expense rejected');
                                    fetchExpenses();
                                  } catch (e: any) {
                                    toast.error(e?.response?.data?.message || 'Rejection failed');
                                  }
                                }}
                                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {(hasPermission('expense.update') || hasRole('Admin')) && expense.status === 'PENDING' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openView(expense);
                                setEditing(true);
                              }}
                              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                              title="Edit Expense"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {(hasPermission('expense.delete') || hasRole('Admin')) && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!confirm('Delete this expense?')) return;
                                try {
                                  await expenseService.remove(expense.id);
                                  setExpenses(prev => prev.filter(e => e.id !== expense.id));
                                  toast.success('Expense deleted');
                                } catch (e) {
                                  toast.error('Failed to delete');
                                }
                              }}
                              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Delete Expense"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination for Grid */}
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 transition-all duration-300">
          <div className="p-6">
            <div className="mb-4">
              <MetaBar
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onItemsPerPageChange={(n) => setItemsPerPage(n)}
                columnConfig={{
                  columns: [
                    { id: 'type', label: 'Type' },
                    { id: 'amount', label: 'Amount' },
                    { id: 'expenseDate', label: 'Date' },
                    { id: 'submittedBy', label: 'Submitted By' },
                    { id: 'status', label: 'Status' },
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
                      <th className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={pageItems.length > 0 && pageItems.every(e => selectedIds.includes(e.id))}
                          onChange={(e) => {
                            const allIds = pageItems.map(e => e.id);
                            setSelectedIds(e.target.checked ? Array.from(new Set([...selectedIds, ...allIds])) : selectedIds.filter(id => !allIds.includes(id)));
                          }}
                        />
                      </th>
                      <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('type') ? 'hidden' : ''}`}>
                        <TableSortHeader label="Type" column={'type'} sortBy={sortBy as any} sortOrder={sortOrder as any} onChange={(c: any) => onHeaderSort(c)} />
                      </th>
                      <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('amount') ? 'hidden' : ''}`}>
                        <TableSortHeader label="Amount" column={'amount'} sortBy={sortBy as any} sortOrder={sortOrder as any} onChange={(c: any) => onHeaderSort(c)} />
                      </th>
                      <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('expenseDate') ? 'hidden' : ''}`}>
                        <TableSortHeader label="Date" column={'expenseDate'} sortBy={sortBy as any} sortOrder={sortOrder as any} onChange={(c: any) => onHeaderSort(c)} />
                      </th>
                      <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('submittedBy') ? 'hidden' : ''}`}>
                        <TableSortHeader label="Submitted By" column={'submittedBy'} sortBy={sortBy as any} sortOrder={sortOrder as any} onChange={(c: any) => onHeaderSort(c)} />
                      </th>
                      <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('status') ? 'hidden' : ''}`}>
                        <TableSortHeader label="Status" column={'status'} sortBy={sortBy as any} sortOrder={sortOrder as any} onChange={(c: any) => onHeaderSort(c)} />
                      </th>
                      <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('createdAt') ? 'hidden' : ''}`}>
                        <TableSortHeader label="Created" column={'createdAt'} sortBy={sortBy as any} sortOrder={sortOrder as any} onChange={(c: any) => onHeaderSort(c)} />
                      </th>
                      <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {pageItems.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-4" data-label="Select">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(expense.id)}
                            onChange={(e) => {
                              setSelectedIds(prev => e.target.checked ? [...prev, expense.id] : prev.filter(id => id !== expense.id));
                            }}
                          />
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('type') ? 'hidden' : ''}`} data-label="Type">
                          <div className="flex items-center gap-3">
                            <div className="text-xl">{getTypeIcon(expense.type)}</div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{expense.type.replace('_', ' ')}</div>
                              {expense.description && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{expense.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('amount') ? 'hidden' : ''}`} data-label="Amount">
                          <div className="flex items-center text-sm font-semibold text-green-600 dark:text-green-400">

                            {formatCurrency(expense.amount, expense.currency)}
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('expenseDate') ? 'hidden' : ''}`} data-label="Date">
                          <div className="text-sm text-gray-900 dark:text-white flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(expense.expenseDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('submittedBy') ? 'hidden' : ''}`} data-label="Submitted By">
                          <div className="text-sm text-gray-900 dark:text-white flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {expense.submittedByUser ? `${expense.submittedByUser.firstName} ${expense.submittedByUser.lastName}` : '-'}
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('status') ? 'hidden' : ''}`} data-label="Status">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                            {getStatusIcon(expense.status)}
                            {expense.status}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 ${!isColumnVisible('createdAt') ? 'hidden' : ''}`} data-label="Created">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(expense.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium" data-label="Actions">
                          <div className="flex items-center justify-end space-x-2">
                            {(hasPermission('expense.read') || hasRole('Admin')) && (
                              <button
                                onClick={() => openView(expense)}
                                className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                title="View Expense"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            {(hasPermission('expense.approve') || hasRole('Admin')) && expense.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={async () => {
                                    const remarks = prompt('Approval remarks');
                                    try {
                                      await expenseService.approve(expense.id, { status: 'APPROVED', reviewedBy: user!.id, approvalRemarks: remarks || undefined });
                                      toast.success('Expense approved');
                                      fetchExpenses();
                                    } catch (e: any) {
                                      toast.error(e?.response?.data?.message || 'Approval failed');
                                    }
                                  }}
                                  className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={async () => {
                                    const remarks = prompt('Rejection remarks');
                                    try {
                                      await expenseService.approve(expense.id, { status: 'REJECTED', reviewedBy: user!.id, approvalRemarks: remarks || undefined });
                                      toast.success('Expense rejected');
                                      fetchExpenses();
                                    } catch (e: any) {
                                      toast.error(e?.response?.data?.message || 'Rejection failed');
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                  title="Reject"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {(hasPermission('expense.update') || hasRole('Admin')) && expense.status === 'PENDING' && (
                              <button
                                onClick={() => {
                                  openView(expense);
                                  setEditing(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Edit Expense"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            {(hasPermission('expense.delete') || hasRole('Admin')) && (
                              <button
                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Delete Expense"
                                onClick={async () => {
                                  if (!confirm('Delete this expense?')) return;
                                  try {
                                    await expenseService.remove(expense.id);
                                    setExpenses(prev => prev.filter(e => e.id !== expense.id));
                                    toast.success('Expense deleted');
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
          title="No expenses found"
          description={searchValue ? 'No expenses match your search criteria.' : 'Get started by creating your first expense.'}
          icon={<DollarSign className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
          showClearButton={!!searchValue}
          onClear={() => setSearch('')}
        />
      )}

      {/* View/Edit Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Receipt className="text-emerald-500" size={24} />
                Expense #{selected.id}
              </h3>
              <div className="flex gap-2">
                {(hasPermission('expense.update') || hasRole('Admin')) && selected.status === 'PENDING' && (
                  <Button variant="OUTLINE" size="SM" onClick={() => setEditing((v) => !v)}>
                    <Edit size={16} className="mr-2" />
                    {editing ? 'Cancel' : 'Edit'}
                  </Button>
                )}
                {(hasPermission('expense.delete') || hasRole('Admin')) && (
                  <Button variant="OUTLINE" size="SM" onClick={deleteExpense}>
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </Button>
                )}
                <Button variant="OUTLINE" size="SM" onClick={() => setSelected(null)}>
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6">
              {!editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-4xl">{getTypeIcon(selected.type)}</div>
                      <div className="flex-1">
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {selected.type.replace('_', ' ')}
                        </h4>
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(selected.status)}`}>
                          {getStatusIcon(selected.status)}
                          {selected.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(selected.amount, selected.currency)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selected.currency}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Expense Date</p>
                    <p className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar size={18} className="text-emerald-500" />
                      {new Date(selected.expenseDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created At</p>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {new Date(selected.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created By</p>
                    <p className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                      <User size={18} className="text-emerald-500" />
                      {selected.submittedByUser
                        ? `${selected.submittedByUser.firstName} ${selected.submittedByUser.lastName}`
                        : selected.createdByUser
                          ? `${selected.createdByUser.firstName} ${selected.createdByUser.lastName}`
                          : '-'}
                    </p>
                  </div>

                  {selected.approvedByUser && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Approved By</p>
                      <p className="text-lg text-green-600 dark:text-green-400 flex items-center gap-2">
                        <CheckCircle size={18} />
                        {selected.approvedByUser.firstName} {selected.approvedByUser.lastName}
                      </p>
                    </div>
                  )}

                  {selected.approvedAt && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Approved At</p>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {new Date(selected.approvedAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {selected.rejectedByUser && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Rejected By</p>
                      <p className="text-lg text-red-600 dark:text-red-400 flex items-center gap-2">
                        <XCircle size={18} />
                        {selected.rejectedByUser.firstName} {selected.rejectedByUser.lastName}
                      </p>
                    </div>
                  )}

                  {selected.description && (
                    <div className="md:col-span-2 space-y-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Description</p>
                      <p className="text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                        {selected.description}
                      </p>
                    </div>
                  )}

                  {selected.remarks && (
                    <div className="md:col-span-2 space-y-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Remarks</p>
                      <p className="text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                        {selected.remarks}
                      </p>
                    </div>
                  )}

                  {selected.receiptUrl && (
                    <div className="md:col-span-2">
                      <Button variant="OUTLINE" onClick={() => window.open(selected.receiptUrl, '_blank')}>
                        <Download size={16} className="mr-2" />
                        View Receipt
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date</label>
                    <input
                      type="date"
                      value={editForm.expenseDate as string}
                      onChange={(e) => setEditForm({ ...editForm, expenseDate: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500 font-medium">
                        {currencySettings?.symbol || '$'}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editForm.amount ?? 0}
                        onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Type</label>
                    <select
                      value={editForm.type as string}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value as ExpenseType })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                    >
                      {expenseTypes.map((t) => (
                        <option key={t} value={t}>{getTypeIcon(t)} {t.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                    <select
                      value={editForm.currency || 'USD'}
                      onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Remarks</label>
                    <textarea
                      value={editForm.remarks || ''}
                      onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white"
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-3">
                    <Button variant="OUTLINE" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button onClick={saveEdit}>Save Changes</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
