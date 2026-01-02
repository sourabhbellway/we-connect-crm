import React, { useState, useEffect } from 'react';
import {
    Trash2,
    RefreshCcw,
    Search,
    User,
    FileText,
    Receipt,
    Package,
    Clock,
    AlertTriangle,
    RotateCcw,
    Users,
    ChevronRight
} from 'lucide-react';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';
import { format } from 'date-fns';

interface TrashStats {
    user: number;
    quotation: number;
    invoice: number;
    product: number;
    lead: number;
}

const TrashPage: React.FC = () => {
    const [items, setItems] = useState<any[]>([]);
    const [stats, setStats] = useState<TrashStats>({ user: 0, quotation: 0, invoice: 0, product: 0, lead: 0 });
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });

    const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: number } | null>(null);
    const [confirmEmpty, setConfirmEmpty] = useState<string | null>(null);

    const fetchTrash = async () => {
        try {
            setLoading(true);
            const [trashResp, statsResp] = await Promise.all([
                apiClient.get('/trash', {
                    params: {
                        page,
                        type: typeFilter,
                        search: searchQuery,
                    },
                }),
                apiClient.get('/trash/stats')
            ]);

            if (trashResp.data.success) {
                setItems(trashResp.data.data.items);
                setPagination(trashResp.data.data.pagination);
            }
            if (statsResp.data.success) {
                setStats(statsResp.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch trash data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, [page, typeFilter, searchQuery]);

    const handleRestore = async (type: string, id: number) => {
        try {
            const resp = await apiClient.post(`/trash/${type}/${id}/restore`);
            if (resp.data.success) {
                toast.success(`${type} restored successfully`);
                fetchTrash();
            }
        } catch (error) {
            toast.error('Failed to restore item');
        }
    };

    const handlePermanentDelete = async () => {
        if (!confirmDelete) return;
        try {
            const resp = await apiClient.delete(`/trash/${confirmDelete.type}/${confirmDelete.id}`);
            if (resp.data.success) {
                toast.success(`Item permanently deleted`);
                setConfirmDelete(null);
                fetchTrash();
            }
        } catch (error) {
            toast.error('Failed to delete item permanently');
        }
    };

    const handleEmptyTrash = async () => {
        if (!confirmEmpty) return;
        try {
            const resp = await apiClient.delete(`/trash/empty/${confirmEmpty}`);
            if (resp.data.success) {
                toast.success(`Trash emptied successfully`);
                setConfirmEmpty(null);
                fetchTrash();
            }
        } catch (error) {
            toast.error('Failed to empty trash');
        }
    };

    const getEntityIcon = (type: string) => {
        switch (type) {
            case 'user': return <Users className="text-blue-500" size={18} />;
            case 'quotation': return <FileText className="text-indigo-500" size={18} />;
            case 'invoice': return <Receipt className="text-emerald-500" size={18} />;
            case 'product': return <Package className="text-orange-500" size={18} />;
            case 'lead': return <User className="text-rose-500" size={18} />;
            default: return <Trash2 className="text-gray-500" size={18} />;
        }
    };

    const categories = [
        { id: 'user', name: 'Deleted Users', desc: 'Manage soft-deleted user accounts', icon: Users, color: 'blue', count: stats.user, label: 'users' },
        { id: 'lead', name: 'Deleted Leads', desc: 'Review removed lead records', icon: User, color: 'green', count: stats.lead, label: 'leads' },
        { id: 'quotation', name: 'Deleted Quotations', desc: 'Manage soft-deleted quotations', icon: FileText, color: 'indigo', count: stats.quotation, label: 'quotations' },
        { id: 'invoice', name: 'Deleted Invoices', desc: 'Manage soft-deleted invoices', icon: Receipt, color: 'emerald', count: stats.invoice, label: 'invoices' },
        { id: 'product', name: 'Deleted Products', desc: 'Manage soft-deleted products', icon: Package, color: 'orange', count: stats.product, label: 'products' },
    ];

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen bg-transparent">
            {/* New Design Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trash Management</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    View soft-deleted records. Items are permanently deleted after 30 days.
                </p>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setTypeFilter(cat.id)}
                        className={`group relative flex flex-col p-6 rounded-2xl border transition-all duration-300 text-left
                            ${typeFilter === cat.id
                                ? `border-${cat.color}-500 bg-${cat.color}-50/50 dark:bg-${cat.color}-900/10 shadow-lg shadow-${cat.color}-500/10`
                                : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-700'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-${cat.color}-100 dark:bg-${cat.color}-900/30 text-${cat.color}-600 dark:text-${cat.color}-400`}>
                                <cat.icon size={24} />
                            </div>
                            <ChevronRight className={`text-gray-400 group-hover:translate-x-1 transition-transform ${typeFilter === cat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                            {cat.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-6">
                            {cat.desc}
                        </p>
                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <Clock size={14} />
                                30 days
                            </div>
                            <div className="font-mono text-xs font-bold text-gray-600 dark:text-gray-400">
                                {cat.count} {cat.label}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Toolbar & List */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center gap-1">
                            <button
                                onClick={() => setTypeFilter('all')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${typeFilter === 'all' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                            >
                                All Records
                            </button>
                        </div>
                        {typeFilter !== 'all' && (
                            <button
                                onClick={() => setTypeFilter('all')}
                                className="text-xs text-red-500 hover:underline px-2"
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-red-500/20 dark:text-white text-sm outline-none"
                            />
                        </div>
                        <button
                            onClick={fetchTrash}
                            className="p-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <RefreshCcw size={18} />
                        </button>
                    </div>
                </div>

                {/* List Container */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-10 h-10 border-4 border-red-500/10 border-t-red-500 rounded-full animate-spin"></div>
                            <p className="text-sm font-medium text-gray-500">Retrieving records...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 text-gray-300">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Clean Trash</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                                No records found in the recycle bin matching your criteria.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/30">
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Record Details</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Module</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Identifier</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                    {items.map((item) => (
                                        <tr key={`${item.type}-${item.id}`} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        {getEntityIcon(item.type)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 dark:text-white">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                            <Clock size={10} /> Deleted {format(new Date(item.deletedAt), 'MMM dd, h:mm a')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 uppercase tracking-wider">
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 font-mono">
                                                    {item.identifier || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleRestore(item.type, item.id)}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        title="Restore Record"
                                                    >
                                                        <RotateCcw size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDelete({ type: item.type, id: item.id })}
                                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Delete Permanently"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="p-4 bg-gray-50/50 dark:bg-slate-800/20 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                            <p className="text-xs text-gray-400">
                                showing <span className="text-gray-900 dark:text-white font-bold">{items.length}</span> of <span className="text-gray-900 dark:text-white font-bold">{pagination.totalItems}</span> records
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all"
                                >
                                    <ChevronRight className="rotate-180" size={16} />
                                </button>
                                <div className="px-4 text-xs font-bold text-gray-600 dark:text-gray-400">
                                    {page} / {pagination.totalPages}
                                </div>
                                <button
                                    disabled={page === pagination.totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Warning */}
            <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-red-500/5 border border-red-500/10 rounded-2xl gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-red-900 dark:text-red-400">Need to wipe everything?</h4>
                        <p className="text-xs text-red-700 dark:text-red-500/60">Cleaning the trash will permanently remove all items from our database forever.</p>
                    </div>
                </div>
                {/* <button
                    onClick={() => setConfirmEmpty('all')}
                    className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                    Empty Recycle Bin
                </button> */}
            </div>

            {/* Modals */}
            <ConfirmModal
                open={!!confirmDelete}
                title="Permanent Removal"
                description={`This will erase this ${confirmDelete?.type} from the database permanently. There's no coming back from this.`}
                confirmText="Yes, Erase Permanently"
                onConfirm={handlePermanentDelete}
                onClose={() => setConfirmDelete(null)}
            />

            <ConfirmModal
                open={!!confirmEmpty}
                title="Wipe Entire Trash"
                description="Are you sure you want to permanently delete ALL records in the recycle bin? Every team member and every piece of data will be lost forever."
                confirmText="Yes, Wipe Everything"
                onConfirm={handleEmptyTrash}
                onClose={() => setConfirmEmpty(null)}
            />
        </div>
    );
};

export default TrashPage;
