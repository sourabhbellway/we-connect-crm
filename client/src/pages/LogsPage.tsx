import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { activityService } from '../services/activityService';
import { callLogService, CallLog } from '../services/callLogService';
import { userService } from '../services/userService';
import { transformActivityData } from '../utils/activityUtils';
import { PERMISSIONS } from '../constants';
import {
    Clock,
    User as UserIcon,
    Phone,
    History,
    ArrowLeft,
    ArrowRight,
    PhoneCall,
    LogIn,
    FileText,
    FileCheck,
    CheckSquare,
    UserPlus,
    Calendar,
    Search,
    X,
    Zap,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Pagination from '../components/Pagination';

// Fix: remove extra spaces in label
const LOG_CATEGORIES = [
    { label: 'All Activities', value: 'ALL', icon: History },
    { label: 'Call Logs', value: 'CALL', icon: PhoneCall },
    { label: 'Login Logs', value: 'LOGIN', icon: LogIn },
    { label: 'Lead Logs', value: 'LEAD', icon: UserPlus },
    { label: 'Quotation Logs', value: 'QUOTATION', icon: FileText }, // ← Fixed spacing
    { label: 'Invoice Logs', value: 'INVOICE', icon: FileCheck },
    { label: 'Task Logs', value: 'TASK', icon: CheckSquare },
    { label: 'Automation Logs', value: 'AUTOMATION', icon: Zap },
];

const LogsPage: React.FC = () => {
    const { hasPermission, hasRole } = useAuth();
    const isAdmin = hasRole('admin') || hasRole('super_admin');

    const [selectedType, setSelectedType] = useState('ALL');
    const [activities, setActivities] = useState<any[]>([]);
    const [activityPage, setActivityPage] = useState(1);
    const [activityTotal, setActivityTotal] = useState(0);
    const [activityLoading, setActivityLoading] = useState(true);

    // Call Log State
    const [callLogs, setCallLogs] = useState<CallLog[]>([]);
    const [callPage, setCallPage] = useState(1);
    const [callTotal, setCallTotal] = useState(0);
    const [callLoading, setCallLoading] = useState(true);

    const [limit] = useState(10);

    // 🔍 Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState<string | null>(null);
    const [dateTo, setDateTo] = useState<string | null>(null);

    // Local filtered activities (for frontend search)
    const [filteredActivities, setFilteredActivities] = useState<any[]>([]);

    const fetchActivities = async () => {
        try {
            setActivityLoading(true);
            const filters: any = {};
            if (selectedType !== 'ALL') filters.type = selectedType;

            const response = await activityService.getActivities(activityPage, limit, filters);
            const items = response?.items || response?.data?.items || response?.data || [];
            const total = response?.total || response?.data?.total || items.length;

            const transformed = items.map(transformActivityData);
            setActivities(transformed);
            setActivityTotal(total);

            // Also apply local filters
            applyLocalFilters(transformed);
        } catch (err) {
            console.error('Error fetching activities:', err);
        } finally {
            setActivityLoading(false);
        }
    };

    const fetchCallLogs = async () => {
        try {
            setCallLoading(true);
            const params: any = {
                page: callPage,
                limit: limit,
                ...(dateFrom && { dateFrom }),
                ...(dateTo && { dateTo }),
            };

            const response = await callLogService.getCallLogs(params);

            const items = response?.items || response?.data?.items || response?.data || [];
            const total = response?.total || response?.data?.total || items.length;

            setCallLogs(items);
            setCallTotal(total);
        } catch (err) {
            console.error('Error fetching call logs:', err);
        } finally {
            setCallLoading(false);
        }
    };

    // Apply local search & date filters
    const applyLocalFilters = (data: any[]) => {
        let filtered = data;

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(item =>
                item.user?.firstName?.toLowerCase().includes(term) ||
                item.user?.lastName?.toLowerCase().includes(term) ||
                item.user?.email?.toLowerCase().includes(term) ||
                item.title?.toLowerCase().includes(term) ||
                item.description?.toLowerCase().includes(term)
            );
        }

        if (dateFrom) {
            const from = new Date(dateFrom);
            filtered = filtered.filter(item => new Date(item.createdAt) >= from);
        }

        if (dateTo) {
            const to = new Date(dateTo);
            filtered = filtered.filter(item => new Date(item.createdAt) <= to);
        }

        setFilteredActivities(filtered);
    };

    useEffect(() => {
        if (selectedType === 'CALL') {
            setCallPage(1);
            fetchCallLogs();
        } else {
            setActivityPage(1);
            fetchActivities();
        }
    }, [selectedType]);

    useEffect(() => {
        if (selectedType !== 'CALL') {
            applyLocalFilters(activities);
        }
    }, [searchTerm, dateFrom, dateTo, activities]);

    useEffect(() => {
        if (selectedType === 'CALL') {
            fetchCallLogs();
        } else {
            fetchActivities();
        }
    }, [activityPage, callPage]);

    if (!hasPermission(PERMISSIONS.ACTIVITY.READ)) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 max-w-md">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <History size={32} className="text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Access Denied</h1>
                    <p className="text-gray-600 dark:text-gray-400">You don't have permission to view system logs.</p>
                </div>
            </div>
        );
    }

    const getCallStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'ANSWERED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'FAILED': case 'NO_ANSWER': case 'BUSY': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'INITIATED': case 'RINGING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setDateFrom(null);
        setDateTo(null);
    };

    // Reset filters when switching tabs
    const handleTabChange = (value: string) => {
        setSelectedType(value);
        setActivityPage(1);
        setCallPage(1);
        if (value === 'CALL') {
            setSearchTerm('');
            setDateFrom(null);
            setDateTo(null);
        }
    };

    return (
        <div className="w-full px-0 space-y-6"> {/* ← REMOVED SIDE PADDING */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-weconnect-red/10 rounded-xl">
                            <History className="h-8 w-8 text-weconnect-red" />
                        </div>
                        System Logs
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Track activities and communications across the platform.
                    </p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                    {/* Search Input */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            Search by Email / User
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Enter email or user name..."
                                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-weconnect-red/30"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Date From */}
                    <div className="min-w-[140px]">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            From
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="date"
                                value={dateFrom || ''}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full pl-10 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-weconnect-red/30"
                            />
                        </div>
                    </div>

                    {/* Date To */}
                    <div className="min-w-[140px]">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            To
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="date"
                                value={dateTo || ''}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full pl-10 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-weconnect-red/30"
                            />
                        </div>
                    </div>

                    {/* Clear Button */}
                    {(searchTerm || dateFrom || dateTo) && (
                        <button
                            onClick={handleClearFilters}
                            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-medium text-gray-700 dark:text-gray-300 transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Dynamic Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100/50 dark:bg-slate-900/50 rounded-2xl w-full border border-gray-200/60 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar">
                {LOG_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = selectedType === cat.value;
                    return (
                        <button
                            key={cat.value}
                            onClick={() => handleTabChange(cat.value)}
                            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${isActive
                                ? 'bg-white dark:bg-slate-800 text-weconnect-red shadow-md scale-[1.02]'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
                                }`}
                        >
                            <Icon size={18} className={`${isActive ? 'text-weconnect-red' : 'text-gray-400'}`} />
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                {selectedType !== 'CALL' ? (
                    <div className="p-0">
                        {activityLoading ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-weconnect-red/20 border-t-weconnect-red"></div>
                                <p className="text-sm font-medium text-gray-500">Fetching activities...</p>
                            </div>
                        ) : filteredActivities.length === 0 ? (
                            <div className="text-center py-32">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <History size={40} className="text-gray-300" />
                                </div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">No activities found</p>
                                <p className="text-gray-500 mt-1">Try adjusting your filters or search criteria.</p>
                            </div>
                        ) : (
                            <>
                                <div className="divide-y divide-gray-50 dark:divide-slate-800">
                                    {filteredActivities.map((activity) => {
                                        const Icon = activity.icon;
                                        return (
                                            <div key={activity.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all group">
                                                <div className="flex items-start gap-5">
                                                    <div className={`p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-700 group-hover:scale-110 transition-transform ${activity.iconColor}`}>
                                                        <Icon size={24} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1.5 gap-4">
                                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">
                                                                {activity.title}
                                                            </h3>
                                                            <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap">
                                                                <Clock size={12} />
                                                                {activity.time}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                                                            {activity.description}
                                                        </p>

                                                        <div className="flex items-center gap-4">
                                                            {activity.user && (
                                                                <div className="flex items-center gap-2 group/user cursor-help">
                                                                    <div className="w-6 h-6 rounded-full bg-weconnect-red/10 flex items-center justify-center text-[10px] font-bold text-weconnect-red">
                                                                        {activity.user.firstName?.[0]}{activity.user.lastName?.[0]}
                                                                    </div>
                                                                    <span className="text-xs font-medium text-gray-500 group-hover/user:text-weconnect-red transition-colors">
                                                                        {activity.user.firstName} {activity.user.lastName}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-slate-700"></div>
                                                            <span className="text-xs font-medium text-gray-400 italic">
                                                                {format(new Date(activity.createdAt), 'MMM dd, yyyy · hh:mm a')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800">
                                    <Pagination
                                        currentPage={activityPage}
                                        totalPages={Math.ceil(filteredActivities.length / limit)} // Use filtered count
                                        totalItems={filteredActivities.length}
                                        onPageChange={setActivityPage}
                                        itemsPerPage={limit}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="p-0">
                        {callLoading ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-weconnect-red/20 border-t-weconnect-red"></div>
                                <p className="text-sm font-medium text-gray-500">Fetching call logs...</p>
                            </div>
                        ) : callLogs.length === 0 ? (
                            <div className="text-center py-32">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Phone size={40} className="text-gray-300" />
                                </div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">No call logs found</p>
                                <p className="text-gray-500 mt-1">Try adjusting your filters or search criteria.</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50 dark:bg-slate-800/50 text-[10px] uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100 dark:border-slate-800">
                                                <th className="px-8 py-5">Lead / Number</th>
                                                <th className="px-4 py-5 text-center">Type</th>
                                                <th className="px-8 py-5">Status</th>
                                                <th className="px-8 py-5">Performed By</th>
                                                <th className="px-8 py-5 text-right">Date & Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                                            {callLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all group">
                                                    <td className="px-8 py-5">
                                                        <div className="font-bold text-gray-900 dark:text-white group-hover:text-weconnect-red transition-colors">
                                                            {log.lead ? `${log.lead.firstName} ${log.lead.lastName}` : 'Direct Call'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                                                            <Phone size={10} />
                                                            {log.phoneNumber}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-5">
                                                        <div className="flex items-center justify-center">
                                                            {log.callType === 'INBOUND' ? (
                                                                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 cursor-help" title="Inbound Call">
                                                                    <ArrowLeft size={16} />
                                                                </div>
                                                            ) : (
                                                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 cursor-help" title="Outbound Call">
                                                                    <ArrowRight size={16} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getCallStatusColor(log.callStatus)}`}>
                                                            {log.callStatus}
                                                        </span>
                                                    </td>

                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700">
                                                                {log.user?.firstName?.[0]}{log.user?.lastName?.[0]}
                                                            </div>
                                                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                                {log.user?.firstName} {log.user?.lastName}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right whitespace-nowrap">
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                            {format(new Date(log.createdAt), 'MMM dd, yyyy')}
                                                        </div>
                                                        <div className="text-[10px] text-gray-500 font-medium">
                                                            {format(new Date(log.createdAt), 'hh:mm a')}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800">
                                    <Pagination
                                        currentPage={callPage}
                                        totalPages={Math.ceil(callTotal / limit)}
                                        totalItems={callTotal}
                                        onPageChange={setCallPage}
                                        itemsPerPage={limit}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogsPage;
