import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Receipt, Plus, Eye, Download, Filter, Search, Edit, Trash2, Send, DollarSign, FileDown, FileText, LayoutList, LayoutGrid, MoreVertical } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import ListToolbar from '../../components/list/ListToolbar';
import MetaBar from '../../components/list/MetaBar';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import { toast } from 'react-toastify';
import { exportToCsv, exportTableToPrintPdf } from '../../utils/exportUtils';
import { Pagination } from '../../components/ui/Pagination';

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

const InvoiceActionMenu = ({
    invoice,
    onView,
    onEdit,
    onDelete,
    onDownload,
    onSend
}: {
    invoice: Invoice;
    onView: (invoice: Invoice) => void;
    onEdit: (invoice: Invoice) => void;
    onDelete: (invoice: Invoice) => void;
    onDownload: (invoice: Invoice) => void;
    onSend: (invoice: Invoice) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                const target = event.target as Element;
                if (!target.closest('.action-menu-dropdown')) {
                    setIsOpen(false);
                }
            }
        };

        if (isOpen) {
            window.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', () => setIsOpen(false), true);
            window.addEventListener('resize', () => setIsOpen(false));
        }
        return () => {
            window.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', () => setIsOpen(false), true);
            window.removeEventListener('resize', () => setIsOpen(false));
        };
    }, [isOpen]);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const menuWidth = 160;
            let left = rect.right - menuWidth;
            let top = rect.bottom + 4;

            if (left < 0) left = rect.left;
            if (top + 220 > window.innerHeight) {
                top = rect.top - 220;
            }

            setMenuStyle({
                position: 'fixed',
                top: `${top}px`,
                left: `${left}px`,
                zIndex: 9999,
                width: `${menuWidth}px`
            });
        }
        setIsOpen(!isOpen);
    };

    return (
        <>
            <button
                ref={buttonRef}
                onClick={handleToggle}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors focus:outline-none"
            >
                <MoreVertical className="h-4 w-4" />
            </button>

            {isOpen && ReactDOM.createPortal(
                <div
                    className="bg-white dark:bg-gray-800 rounded-md shadow-xl border border-gray-200 dark:border-gray-700 py-1 action-menu-dropdown"
                    style={menuStyle}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => { onView(invoice); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                        <Eye className="h-4 w-4 text-gray-400" />
                        View
                    </button>

                    <button
                        onClick={() => { onEdit(invoice); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                        <Edit className="h-4 w-4 text-blue-500" />
                        Edit
                    </button>

                    <button
                        onClick={() => { onDownload(invoice); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                        <Download className="h-4 w-4 text-green-500" />
                        Download
                    </button>

                    {invoice.status === 'DRAFT' && (
                        <button
                            onClick={() => { onSend(invoice); setIsOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                            <Send className="h-4 w-4 text-purple-500" />
                            Send
                        </button>
                    )}

                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                    <button
                        onClick={() => { onDelete(invoice); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                        <Trash2 className="h-4 w-4 text-red-500" />
                        Delete
                    </button>
                </div>,
                document.body
            )}
        </>
    );
};

const InvoicesPage: React.FC = () => {
    const { hasPermission } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [visibleColumns, setVisibleColumns] = useState<string[]>([
        'invoiceNumber',
        'customer',
        'email',
        'related',
        'totalAmount',
        'paidAmount',
        'status',
        'dueDate',
        'createdAt',
    ]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Load column visibility preferences
    useEffect(() => {
        try {
            const stored = localStorage.getItem('invoices_visible_columns');
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
            localStorage.setItem('invoices_visible_columns', JSON.stringify(visibleColumns));
        } catch {
            // ignore
        }
    }, [visibleColumns]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    useEffect(() => {
        fetchInvoices();
    }, [searchQuery, statusFilter, currentPage, itemsPerPage]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/invoices', {
                params: {
                    search: searchQuery || undefined,
                    status: statusFilter !== 'ALL' ? statusFilter : undefined,
                    page: currentPage,
                    limit: itemsPerPage,
                }
            });
            if (response.data.success) {
                const data = response.data.data || {};
                const items = Array.isArray(data) ? data : (data.items || []);
                setTotalItems(data.total || (Array.isArray(data) ? data.length : 0));
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
                <div>
                    <ListToolbar
                        title="Invoices"
                        subtitle="Track payments and manage all your invoices"
                        addLabel="Create Invoice"
                        onAdd={hasPermission('deal.create')
                            ? () => {
                                const entityType = searchParams.get('entityType');
                                const entityId = searchParams.get('entityId');
                                if (entityType && entityId) {
                                    navigate(`/invoices/new?entityType=${entityType}&entityId=${entityId}`);
                                } else {
                                    navigate('/invoices/new');
                                }
                            }
                            : undefined}
                        bulkActions={[
                            {
                                label: 'Export Invoices (Excel)',
                                icon: <FileDown className="w-4 h-4" />,
                                onClick: () => {
                                    const headers = [
                                        'Invoice #',
                                        'Title',
                                        'Customer',
                                        'Email',
                                        'Related',
                                        'Total Amount',
                                        'Paid Amount',
                                        'Status',
                                        'Created',
                                        'Due Date',
                                    ];
                                    const rows = invoices.map((inv) => [
                                        inv.invoiceNumber,
                                        inv.title,
                                        inv.customerName || '',
                                        inv.customerEmail || '',
                                        inv.relatedTo || '',
                                        `${inv.currency} ${Number(inv.totalAmount).toLocaleString()}`,
                                        `${inv.currency} ${(Number(inv.paidAmount) || 0).toLocaleString()}`,
                                        inv.status,
                                        new Date(inv.createdAt).toLocaleDateString(),
                                        inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '',
                                    ]);
                                    exportToCsv('invoices_export.csv', headers, rows);
                                },
                            },
                            {
                                label: 'Export Invoices (PDF)',
                                icon: <FileText className="w-4 h-4" />,
                                onClick: () => {
                                    const headers = [
                                        'Invoice #',
                                        'Title',
                                        'Customer',
                                        'Email',
                                        'Related',
                                        'Total Amount',
                                        'Paid Amount',
                                        'Status',
                                        'Created',
                                        'Due Date',
                                    ];
                                    const rows = invoices.map((inv) => [
                                        inv.invoiceNumber,
                                        inv.title,
                                        inv.customerName || '',
                                        inv.customerEmail || '',
                                        inv.relatedTo || '',
                                        `${inv.currency} ${Number(inv.totalAmount).toLocaleString()}`,
                                        `${inv.currency} ${(Number(inv.paidAmount) || 0).toLocaleString()}`,
                                        inv.status,
                                        new Date(inv.createdAt).toLocaleDateString(),
                                        inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '',
                                    ]);
                                    exportTableToPrintPdf('Invoices', headers, rows);
                                },
                            },
                        ]}
                    />
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
                                className={`flex items-center justify-center p-2 rounded-md transition-colors ${viewMode === 'card' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                                onClick={() => setViewMode('card')}
                                title="Card view"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800">
                        <div className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Total Invoices</div>
                        <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">{totalItems}</div>
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
                            {invoices.reduce((sum, inv) => sum + (Number(inv.paidAmount) || 0), 0).toLocaleString()}
                        </div>
                    </Card>
                </div>

                {/* Invoices List/Card View */}
                {viewMode === 'card' ? (
                    <div className="space-y-4">
                        {invoices.length === 0 ? (
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
                            invoices.map((invoice) => (
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
                                                            <span>{(Number(invoice.paidAmount) || 0).toLocaleString()} / ${Number(invoice.totalAmount).toLocaleString()}</span>
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
                                                {invoice.currency}{Number(invoice.totalAmount).toLocaleString()}
                                            </div>
                                            {invoice.status === 'PARTIALLY_PAID' && (
                                                <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-3 font-medium">
                                                    {(Number(invoice.paidAmount) || 0).toLocaleString()} paid
                                                </div>
                                            )}
                                            {invoice.status === 'PAID' && (
                                                <div className="text-sm text-green-600 dark:text-green-400 mb-3 font-medium flex items-center justify-end gap-1">
                                                    <DollarSign size={14} />
                                                    Fully Paid
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 mt-3">
                                                <InvoiceActionMenu
                                                    invoice={invoice}
                                                    onView={async (inv) => {
                                                        try {
                                                            const res = await apiClient.get(`/invoices/${inv.id}/pdf/preview`, { responseType: 'blob' });
                                                            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                                                            window.open(url, '_blank');
                                                        } catch (error: any) {
                                                            toast.error(error?.response?.data?.message || 'Failed to preview invoice');
                                                        }
                                                    }}
                                                    onEdit={(inv) => navigate(`/invoices/edit/${inv.id}`)}
                                                    onDownload={async (inv) => {
                                                        try {
                                                            const res = await apiClient.get(`/invoices/${inv.id}/pdf/download`, { responseType: 'blob' });
                                                            const url = URL.createObjectURL(new Blob([res.data]));
                                                            const a = document.createElement('a');
                                                            a.href = url;
                                                            a.download = `${inv.invoiceNumber || 'invoice'}.pdf`;
                                                            a.click();
                                                            toast.success('Invoice downloaded successfully');
                                                        } catch (error: any) {
                                                            toast.error(error?.response?.data?.message || 'Failed to download invoice');
                                                        }
                                                    }}
                                                    onSend={async (inv) => {
                                                        try {
                                                            await apiClient.put(`/invoices/${inv.id}/send`);
                                                            toast.success('Invoice sent successfully');
                                                            fetchInvoices();
                                                        } catch (error: any) {
                                                            toast.error(error?.response?.data?.message || 'Failed to send invoice');
                                                        }
                                                    }}
                                                    onDelete={async (inv) => {
                                                        if (!window.confirm('Are you sure you want to delete this invoice?')) {
                                                            return;
                                                        }
                                                        try {
                                                            await apiClient.delete(`/invoices/${inv.id}`);
                                                            toast.success('Invoice deleted successfully');
                                                            fetchInvoices();
                                                        } catch (error: any) {
                                                            toast.error(error?.response?.data?.message || 'Failed to delete invoice');
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}

                        {/* Pagination */}
                        {totalItems > itemsPerPage && (
                            <Card className="p-4 mt-4">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={Math.ceil(totalItems / itemsPerPage)}
                                    totalItems={totalItems}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                    onItemsPerPageChange={(val) => {
                                        setItemsPerPage(val);
                                        setCurrentPage(1);
                                    }}
                                />
                            </Card>
                        )}
                    </div>
                ) : (
                    <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                        <MetaBar
                            currentPage={currentPage}
                            itemsPerPage={itemsPerPage}
                            totalItems={totalItems}
                            onItemsPerPageChange={(n) => {
                                setItemsPerPage(n);
                                setCurrentPage(1);
                            }}
                            columnConfig={{
                                columns: [
                                    { id: 'invoiceNumber', label: 'Invoice #' },
                                    { id: 'customer', label: 'Customer' },
                                    { id: 'email', label: 'Email' },
                                    { id: 'related', label: 'Related' },
                                    { id: 'totalAmount', label: 'Total Amount' },
                                    { id: 'paidAmount', label: 'Paid Amount' },
                                    { id: 'status', label: 'Status' },
                                    { id: 'dueDate', label: 'Due Date' },
                                    { id: 'createdAt', label: 'Created' },
                                ],
                                visibleColumns,
                                onChange: setVisibleColumns,
                                minVisible: 1,
                            }}
                        />
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr>
                                        {visibleColumns.includes('invoiceNumber') && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoice #</th>}
                                        {visibleColumns.includes('customer') && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>}
                                        {visibleColumns.includes('email') && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>}
                                        {visibleColumns.includes('related') && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Related</th>}
                                        {visibleColumns.includes('totalAmount') && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>}
                                        {visibleColumns.includes('paidAmount') && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paid</th>}
                                        {visibleColumns.includes('status') && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>}
                                        {visibleColumns.includes('dueDate') && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>}
                                        {visibleColumns.includes('createdAt') && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>}
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {invoices.length === 0 ? (
                                        <tr>
                                            <td colSpan={visibleColumns.length + 1} className="px-6 py-12 text-center">
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
                                            </td>
                                        </tr>
                                    ) : (
                                        invoices.map((invoice) => (
                                            <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                {visibleColumns.includes('invoiceNumber') && (
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{invoice.title}</div>
                                                    </td>
                                                )}
                                                {visibleColumns.includes('customer') && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{invoice.customerName || '-'}</td>
                                                )}
                                                {visibleColumns.includes('email') && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{invoice.customerEmail || '-'}</td>
                                                )}
                                                {visibleColumns.includes('related') && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{invoice.relatedTo || '-'}</td>
                                                )}
                                                {visibleColumns.includes('totalAmount') && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                        {invoice.currency} ${Number(invoice.totalAmount).toLocaleString()}
                                                    </td>
                                                )}
                                                {visibleColumns.includes('paidAmount') && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {invoice.currency} ${(Number(invoice.paidAmount) || 0).toLocaleString()}
                                                    </td>
                                                )}
                                                {visibleColumns.includes('status') && (
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                                                            {invoice.status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleColumns.includes('dueDate') && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                                                    </td>
                                                )}
                                                {visibleColumns.includes('createdAt') && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(invoice.createdAt).toLocaleDateString()}
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <InvoiceActionMenu
                                                            invoice={invoice}
                                                            onView={async (inv) => {
                                                                try {
                                                                    const res = await apiClient.get(`/invoices/${inv.id}/pdf/preview`, { responseType: 'blob' });
                                                                    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                                                                    window.open(url, '_blank');
                                                                } catch (error: any) {
                                                                    toast.error(error?.response?.data?.message || 'Failed to preview invoice');
                                                                }
                                                            }}
                                                            onEdit={(inv) => navigate(`/invoices/edit/${inv.id}`)}
                                                            onDownload={async (inv) => {
                                                                try {
                                                                    const res = await apiClient.get(`/invoices/${inv.id}/pdf/download`, { responseType: 'blob' });
                                                                    const url = URL.createObjectURL(new Blob([res.data]));
                                                                    const a = document.createElement('a');
                                                                    a.href = url;
                                                                    a.download = `${inv.invoiceNumber || 'invoice'}.pdf`;
                                                                    a.click();
                                                                    toast.success('Invoice downloaded successfully');
                                                                } catch (error: any) {
                                                                    toast.error(error?.response?.data?.message || 'Failed to download invoice');
                                                                }
                                                            }}
                                                            onSend={async (inv) => {
                                                                try {
                                                                    await apiClient.put(`/invoices/${inv.id}/send`);
                                                                    toast.success('Invoice sent successfully');
                                                                    fetchInvoices();
                                                                } catch (error: any) {
                                                                    toast.error(error?.response?.data?.message || 'Failed to send invoice');
                                                                }
                                                            }}
                                                            onDelete={async (inv) => {
                                                                if (!window.confirm('Are you sure you want to delete this invoice?')) {
                                                                    return;
                                                                }
                                                                try {
                                                                    await apiClient.delete(`/invoices/${inv.id}`);
                                                                    toast.success('Invoice deleted successfully');
                                                                    fetchInvoices();
                                                                } catch (error: any) {
                                                                    toast.error(error?.response?.data?.message || 'Failed to delete invoice');
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination for List View */}
                        {totalItems > itemsPerPage && (
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={Math.ceil(totalItems / itemsPerPage)}
                                    totalItems={totalItems}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                    onItemsPerPageChange={(val) => {
                                        setItemsPerPage(val);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
};

export default InvoicesPage;
