import React, { useEffect, useState } from 'react';
import {
    Users,
    ArrowLeft,
    Download,
    Target,
    Loader2,
    Phone,
    Calendar,
    Filter,
    TrendingUp,
    UserCheck,
    UserX,
    PhoneCall,
    PhoneOff,
    ChevronDown,
    ChevronRight,
    UserCircle,
    Building,
    Mail,
    Phone as PhoneIcon,
    Globe,
    MessageSquare as NoteIcon,
    Clock,
    Calendar as CalendarIcon
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button } from '../../components/ui';
import { Pagination } from '../../components/ui/Pagination';
import { analyticsService } from '../../services/analyticsService';
import HorizontalFilters, { FilterField } from '../../components/reports/HorizontalFilters';
import { leadSourceService } from '../../services/leadSourceService';
import { userService } from '../../services/userService';

const LeadReportPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);
    const [dateRange, setDateRange] = useState('6months');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [useCustomRange, setUseCustomRange] = useState(false);
    const [activeTab, setActiveTab] = useState<'call-analytics' | 'lead-sources' | 'conversion'>('call-analytics');
    const [filters, setFilters] = useState<any>({
        search: '',
        email: '',
        status: '',
        assignedTo: ''
    });
    const [filterFields, setFilterFields] = useState<FilterField[]>([
        { key: 'search', label: 'Search', type: 'text', placeholder: 'Search leads...' },
        { key: 'email', label: 'Email Search', type: 'text', placeholder: 'Search by email...' },
        {
            key: 'status', label: 'Status', type: 'select', options: [
                { label: 'New', value: 'NEW' },
                { label: 'Contacted', value: 'CONTACTED' },
                { label: 'Qualified', value: 'QUALIFIED' },
                { label: 'Proposal', value: 'PROPOSAL' },
                { label: 'Negotiation', value: 'NEGOTIATION' },
                { label: 'Closed', value: 'CLOSED' },
                { label: 'Lost', value: 'LOST' },
                { label: 'Converted', value: 'CONVERTED' }
            ]
        },
        { key: 'assignedTo', label: 'Assigned To', type: 'select', options: [] },
        { key: 'sourceId', label: 'Source', type: 'select', options: [] },
    ]);

    // State for expandable rows
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [metricLeads, setMetricLeads] = useState<any[]>([]);
    const [loadingLeads, setLoadingLeads] = useState<boolean>(false);

    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev: any) => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [sourcesRes, usersRes] = await Promise.all([
                    leadSourceService.getLeadSources(),
                    userService.getUsers()
                ]);

                const updatedFields = [...filterFields];

                if (Array.isArray(sourcesRes)) {
                    const sourceField = updatedFields.find(f => f.key === 'sourceId');
                    if (sourceField) {
                        sourceField.options = sourcesRes.map((s: any) => ({ label: s.name, value: s.id }));
                    }
                }

                if (Array.isArray(usersRes)) {
                    const userField = updatedFields.find(f => f.key === 'assignedTo');
                    if (userField) {
                        userField.options = usersRes.map((u: any) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }));
                    }
                }

                setFilterFields(updatedFields);
            } catch (error) {
                console.error('Error fetching metadata for filters:', error);
            }
        };
        fetchMetadata();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                let startDate: string | undefined;
                let endDate: string | undefined;
                let months: number;

                if (useCustomRange && customStartDate && customEndDate) {
                    startDate = customStartDate;
                    endDate = customEndDate;
                    months = 6;
                } else {
                    months = dateRange === '3months' ? 3 : dateRange === '6months' ? 6 : 12;
                }

                const response = await analyticsService.getLeadReport(
                    months,
                    undefined,
                    'all',
                    currentPage,
                    itemsPerPage,
                    filters,
                    startDate,
                    endDate
                );
                if (response.success) {
                    setReportData(response.data);
                }
            } catch (error) {
                console.error('Error fetching lead report data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dateRange, currentPage, itemsPerPage, filters, customStartDate, customEndDate, useCustomRange]);

    // Calculate totals for call analytics
    const callTotals = reportData?.callAnalytics?.userWise?.reduce((acc: any, user: any) => ({
        attempted: acc.attempted + user.attempted,
        connected: acc.connected + user.connected,
        notConnected: acc.notConnected + user.notConnected,
        interested: acc.interested + user.interested,
        notInterested: acc.notInterested + user.notInterested
    }), { attempted: 0, connected: 0, notConnected: 0, interested: 0, notInterested: 0 }) || {};

    const getConnectionRate = () => {
        if (callTotals.attempted === 0) return '0%';
        return ((callTotals.connected / callTotals.attempted) * 100).toFixed(1) + '%';
    };

    const getInterestRate = () => {
        if (callTotals.connected === 0) return '0%';
        return ((callTotals.interested / callTotals.connected) * 100).toFixed(1) + '%';
    };

    const handleMetricClick = async (metricType: string, metricValue: string, rowKey: string, userId?: number) => {
        if (expandedRow === rowKey) {
            setExpandedRow(null);
            return;
        }

        setExpandedRow(rowKey);
        setLoadingLeads(true);
        setMetricLeads([]); // Clear previous leads

        try {
            let startDate: string | undefined;
            let endDate: string | undefined;

            if (useCustomRange && customStartDate && customEndDate) {
                startDate = customStartDate;
                endDate = customEndDate;
            } else if (dateRange !== 'all') { // If all time, leave undefined
                const d = new Date();
                endDate = d.toISOString();
                if (dateRange === '3months') d.setMonth(d.getMonth() - 3);
                else if (dateRange === '6months') d.setMonth(d.getMonth() - 6);
                else if (dateRange === '12months') d.setMonth(d.getMonth() - 12);
                startDate = d.toISOString();
            }

            const res = await analyticsService.getLeadMetricDetails({
                metricType,
                metricValue,
                startDate,
                endDate,
                userId: userId || (filters.assignedTo ? Number(filters.assignedTo) : undefined)
            });

            if (res.success) {
                setMetricLeads(res.data);
            }
        } catch (error) {
            console.error('Error fetching metric leads:', error);
        } finally {
            setLoadingLeads(false);
        }
    };

    const LeadDetailsRow = ({ colSpan }: { colSpan: number }) => (
        <tr>
            <td colSpan={colSpan} className="p-0 border-b border-gray-100 dark:border-slate-800">
                <div className="bg-gray-50/50 dark:bg-slate-800/20 p-6 shadow-inner">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            <h4 className="text-base font-bold text-gray-900 dark:text-white">Lead Intelligence & History</h4>
                        </div>
                        <span className="text-xs text-gray-500 font-semibold bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">Showing latest history</span>
                    </div>

                    {loadingLeads ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <span className="ml-3 text-sm font-medium text-gray-500">Processing lead intelligence...</span>
                        </div>
                    ) : metricLeads.length > 0 ? (
                        <div className="space-y-6">
                            {metricLeads.map((lead: any) => (
                                <div key={lead.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    {/* Header Section */}
                                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/30">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                                {lead.firstName?.[0] || 'L'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Link to={`/leads/${lead.id}`} className="text-base font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                        {lead.firstName} {lead.lastName}
                                                    </Link>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${lead.status === 'NEW' ? 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/20' : 'bg-green-50 border-green-100 text-green-700 dark:bg-green-900/20'}`}>
                                                        {lead.status}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                        <Building className="w-3.5 h-3.5 text-gray-400" /> {lead.company || 'Private Individual'}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {lead.email || 'N/A'}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                                                        <PhoneIcon className="w-3.5 h-3.5 text-gray-400" /> {lead.phone || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Source</p>
                                                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-end gap-1">
                                                    <Globe className="w-3 h-3" /> {lead.source?.name || 'Manual Entry'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Assign To</p>
                                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    {lead.assignedUser ? `${lead.assignedUser.firstName} ${lead.assignedUser.lastName}` : 'Unassigned'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Sections */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-50 dark:divide-slate-800">
                                        {/* Left Side: Call History */}
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                    <PhoneIcon className="w-3.5 h-3.5" /> Call Attempts
                                                </p>
                                                <span className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold">Latest {(lead.callLogs?.length || 0)}</span>
                                            </div>
                                            <div className="space-y-2">
                                                {lead.callLogs && lead.callLogs.length > 0 ? (
                                                    <div className="overflow-hidden rounded-lg border border-gray-50 dark:border-slate-800">
                                                        <table className="w-full text-[11px]">
                                                            <thead className="bg-gray-50/50 dark:bg-slate-800/50 text-gray-400">
                                                                <tr>
                                                                    <th className="text-left px-3 py-1.5 font-semibold">Time</th>
                                                                    <th className="text-left px-3 py-1.5 font-semibold">Status</th>
                                                                    <th className="text-left px-3 py-1.5 font-semibold">Outcome</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                                                {lead.callLogs.map((call: any) => (
                                                                    <tr key={call.id}>
                                                                        <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                                                                            {new Date(call.createdAt).toLocaleString('en-US', {
                                                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                                            })}
                                                                        </td>
                                                                        <td className="px-3 py-2">
                                                                            <span className={`flex items-center gap-1 font-semibold ${call.isAnswered ? 'text-green-600' : 'text-red-500'}`}>
                                                                                {call.isAnswered ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                                                                                {call.callStatus}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-3 py-2 text-gray-400 dark:text-gray-500 truncate max-w-[120px]" title={call.outcome}>
                                                                            {call.outcome || '-'}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="py-8 bg-gray-50/30 dark:bg-slate-800/30 rounded-lg border border-dashed border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center">
                                                        <PhoneOff className="w-6 h-6 text-gray-300 mb-1" />
                                                        <p className="text-[10px] text-gray-400 italic">No calls in current filters</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Side: Notes & Follow-ups */}
                                        <div className="p-4 bg-gray-50/10 dark:bg-slate-800/10">
                                            <div className="space-y-6">
                                                {/* Recent Notes */}
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                        <NoteIcon className="w-3.5 h-3.5" /> Recent Intelligence
                                                    </p>
                                                    <div className="space-y-2">
                                                        {lead.leadNotes && lead.leadNotes.length > 0 ? (
                                                            lead.leadNotes.map((note: any) => (
                                                                <div key={note.id} className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm relative">
                                                                    <p className="text-xs text-gray-700 dark:text-gray-200 line-clamp-2 italic pr-12">"{note.content}"</p>
                                                                    <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400 font-medium">
                                                                        <span>{note.user?.firstName} {note.user?.lastName}</span>
                                                                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="p-4 text-center border-none">
                                                                <p className="text-[10px] text-gray-400 italic">No notes available for this lead</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Upcoming Follow-ups */}
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5" /> Upcoming Engagement
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {lead.followUps && lead.followUps.length > 0 ? (
                                                            lead.followUps.map((fu: any) => (
                                                                <div key={fu.id} className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg border border-orange-100 dark:border-orange-900/30 text-xs font-bold">
                                                                    <CalendarIcon className="w-3.5 h-3.5" />
                                                                    <div className="flex flex-col">
                                                                        <span className="leading-tight">{fu.subject}</span>
                                                                        <span className="text-[9px] opacity-75 font-medium">{new Date(fu.scheduledAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="flex-1 p-2 bg-gray-50/50 dark:bg-slate-900 rounded-lg border border-dashed border-gray-200 dark:border-slate-800 text-center">
                                                                <p className="text-[10px] text-gray-400 font-medium">No pending follow-ups</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
                            <Users className="w-12 h-12 text-gray-200 mb-4" />
                            <h5 className="text-sm font-bold text-gray-900 dark:text-white">No Lead Intelligence Found</h5>
                            <p className="text-xs text-gray-500 max-w-[200px] mt-1">We couldn't find any leads matching the current metric and filters.</p>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading lead report data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="GHOST"
                        size="SM"
                        onClick={() => navigate('/reports')}
                        className="p-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads Report</h1>
                        <p className="text-sm text-gray-400 font-medium">Comprehensive lead analytics and performance metrics</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Date Range Buttons */}
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-1">
                        <button
                            onClick={() => {
                                setDateRange('3months');
                                setUseCustomRange(false);
                            }}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${dateRange === '3months' && !useCustomRange
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            3M
                        </button>
                        <button
                            onClick={() => {
                                setDateRange('6months');
                                setUseCustomRange(false);
                            }}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${dateRange === '6months' && !useCustomRange
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            6M
                        </button>
                        <button
                            onClick={() => {
                                setDateRange('12months');
                                setUseCustomRange(false);
                            }}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${dateRange === '12months' && !useCustomRange
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            1Y
                        </button>
                    </div>

                    {/* Custom Date Range Picker */}
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-1 ${useCustomRange ? 'border-blue-500' : ''}`}>
                            <Calendar className="w-4 h-4 text-gray-500 ml-2" />
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => {
                                    setCustomStartDate(e.target.value);
                                    setUseCustomRange(true);
                                }}
                                className="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 bg-transparent border-none outline-none w-28"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => {
                                    setCustomEndDate(e.target.value);
                                    setUseCustomRange(true);
                                }}
                                className="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 bg-transparent border-none outline-none w-28"
                            />
                        </div>
                        {useCustomRange && (
                            <button
                                onClick={() => {
                                    setUseCustomRange(false);
                                    setCustomStartDate('');
                                    setCustomEndDate('');
                                }}
                                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <Button variant="PRIMARY" className="flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <HorizontalFilters
                fields={filterFields}
                values={filters}
                onChange={handleFilterChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
            />

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Card className="border-none shadow-sm dark:bg-slate-900">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                <Users className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400">Total Leads</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{reportData?.stats?.totalLeads?.toLocaleString() || '0'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm dark:bg-slate-900">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                                <Target className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400">Converted</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{reportData?.stats?.convertedLeads?.toLocaleString() || '0'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm dark:bg-slate-900">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                <TrendingUp className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400">Conv. Rate</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{reportData?.stats?.conversionRate || '0%'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm dark:bg-slate-900">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                                <PhoneCall className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400">Calls Made</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{callTotals.attempted.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm dark:bg-slate-900">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                                <UserCheck className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400">Connected</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{callTotals.connected.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm dark:bg-slate-900">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20">
                                <Phone className="w-5 h-5 text-cyan-500" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400">Conn. Rate</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{getConnectionRate()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('call-analytics')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'call-analytics'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        <Phone className="w-4 h-4" />
                        Call Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('lead-sources')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'lead-sources'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        Lead Sources
                    </button>
                    <button
                        onClick={() => setActiveTab('conversion')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'conversion'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        <Target className="w-4 h-4" />
                        Conversion Funnel
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'call-analytics' && (
                <Card className="dark:bg-slate-900 border-none shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">User-wise Call Analytics</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Detailed breakdown of call performance by user</p>
                            </div>
                            <Users className="w-5 h-5 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-slate-950 text-gray-500 uppercase text-xs font-semibold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4 text-center">Attempted</th>
                                        <th className="px-6 py-4 text-center">Connected</th>
                                        <th className="px-6 py-4 text-center">Not Connected</th>
                                        <th className="px-6 py-4 text-center">Interested</th>
                                        <th className="px-6 py-4 text-center">Not Interested</th>
                                        <th className="px-6 py-4 text-center">Conn. Rate</th>
                                        <th className="px-6 py-4 text-center">Interest Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                    {(reportData?.callAnalytics?.userWise || []).map((user: any, i: number) => {
                                        const connRate = user.attempted > 0 ? ((user.connected / user.attempted) * 100).toFixed(1) : '0.0';
                                        const interestRate = user.connected > 0 ? ((user.interested / user.connected) * 100).toFixed(1) : '0.0';

                                        return (
                                            <React.Fragment key={i}>
                                                <tr className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                                                    {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                                                </span>
                                                            </div>
                                                            <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-medium">
                                                        <button
                                                            onClick={() => handleMetricClick('call-analytics', 'attempted', `call-${user.id}-attempted`, user.id)}
                                                            className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 underline transition-colors focus:outline-none"
                                                        >
                                                            {user.attempted}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => handleMetricClick('call-analytics', 'connected', `call-${user.id}-connected`, user.id)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 text-sm font-medium transition-colors focus:outline-none"
                                                        >
                                                            <UserCheck className="w-3 h-3" />
                                                            {user.connected}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => handleMetricClick('call-analytics', 'notConnected', `call-${user.id}-notConnected`, user.id)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 text-sm font-medium transition-colors focus:outline-none"
                                                        >
                                                            <UserX className="w-3 h-3" />
                                                            {user.notConnected}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => handleMetricClick('call-analytics', 'interested', `call-${user.id}-interested`, user.id)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-sm font-medium transition-colors focus:outline-none"
                                                        >
                                                            {user.interested}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => handleMetricClick('call-analytics', 'notInterested', `call-${user.id}-notInterested`, user.id)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium transition-colors focus:outline-none"
                                                        >
                                                            {user.notInterested}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="w-16 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-green-500 rounded-full"
                                                                    style={{ width: `${connRate}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{connRate}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="w-16 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-orange-500 rounded-full"
                                                                    style={{ width: `${interestRate}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{interestRate}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expandedRow === `call-${user.id}-attempted` && <LeadDetailsRow colSpan={8} />}
                                                {expandedRow === `call-${user.id}-connected` && <LeadDetailsRow colSpan={8} />}
                                                {expandedRow === `call-${user.id}-notConnected` && <LeadDetailsRow colSpan={8} />}
                                                {expandedRow === `call-${user.id}-interested` && <LeadDetailsRow colSpan={8} />}
                                                {expandedRow === `call-${user.id}-notInterested` && <LeadDetailsRow colSpan={8} />}
                                            </React.Fragment>
                                        );
                                    })}
                                    {(reportData?.callAnalytics?.userWise || []).length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                                                <PhoneOff className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                                <p className="font-medium">No call analytics data available</p>
                                                <p className="text-sm mt-1">Calls made during this period will appear here</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )
            }

            {
                activeTab === 'lead-sources' && (
                    <Card className="dark:bg-slate-900 border-none shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lead Source Performance</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Lead conversion by source</p>
                                </div>
                                <Filter className="w-5 h-5 text-purple-500" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-slate-950 text-gray-500 uppercase text-xs font-semibold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Source</th>
                                            <th className="px-6 py-4 text-center">Total Leads</th>
                                            <th className="px-6 py-4 text-center">Converted</th>
                                            <th className="px-6 py-4 text-center">Conversion Rate</th>
                                            <th className="px-6 py-4">Performance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                        {(reportData?.sourceDistributionData || []).map((source: any, i: number) => (
                                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][i % 6] }}
                                                        />
                                                        <span className="font-medium text-gray-900 dark:text-white">{source.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium">
                                                    <button
                                                        onClick={() => handleMetricClick('lead-sources', source.sourceId || source.id, `source-${source.id}-total`)}
                                                        className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 underline transition-colors focus:outline-none"
                                                    >
                                                        {source.total}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleMetricClick('conversion-funnel', 'WON', `source-${source.id}-converted`)} // Reuse funnel metric for conversion
                                                        className="text-green-600 dark:text-green-400 font-bold hover:underline focus:outline-none"
                                                    >
                                                        {source.converted}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                                                        {source.rate}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                                                style={{ width: source.rate }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {(reportData?.sourceDistributionData || []).length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                                    <Filter className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                                    <p className="font-medium">No lead source data available</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {expandedRow?.startsWith('source-') && <div className="border-t border-gray-100 dark:border-slate-800"><LeadDetailsRow colSpan={5} /></div>}
                            {(reportData?.sourceDistributionData || []).length > 0 && (
                                <div className="p-4 border-t border-gray-100 dark:border-slate-800">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={reportData?.pagination?.pages || 1}
                                        totalItems={reportData?.pagination?.total || 0}
                                        itemsPerPage={itemsPerPage}
                                        onPageChange={setCurrentPage}
                                        onItemsPerPageChange={setItemsPerPage}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            }

            {
                activeTab === 'conversion' && (
                    <Card className="dark:bg-slate-900 border-none shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lead Conversion Funnel</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Stage-by-stage lead progression</p>
                                </div>
                                <Target className="w-5 h-5 text-green-500" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-slate-950 text-gray-500 uppercase text-xs font-semibold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Stage</th>
                                            <th className="px-6 py-4 text-center">Leads</th>
                                            <th className="px-6 py-4 text-center">% of Total</th>
                                            <th className="px-6 py-4">Funnel Visualization</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                        {(reportData?.funnelData || []).map((stage: any, i: number) => {
                                            const totalLeads = reportData?.funnelData?.[0]?.value || 1;
                                            const percentage = ((stage.value / totalLeads) * 100).toFixed(1);

                                            return (
                                                <React.Fragment key={i}>
                                                    <tr className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                                                    style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'][i % 8] }}
                                                                >
                                                                    {i + 1}
                                                                </div>
                                                                <span className="font-medium text-gray-900 dark:text-white">{stage.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <button
                                                                onClick={() => handleMetricClick('conversion-funnel', stage.name, `funnel-${i}`)}
                                                                className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 underline transition-colors focus:outline-none"
                                                            >
                                                                {stage.value}
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-gray-500 dark:text-gray-400">{percentage}%</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex-1 h-6 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full rounded-full transition-all duration-500"
                                                                        style={{
                                                                            width: `${percentage}%`,
                                                                            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'][i % 8]
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {expandedRow === `funnel-${i}` && <LeadDetailsRow colSpan={4} />}
                                                </React.Fragment>
                                            );
                                        })}
                                        {(reportData?.funnelData || []).length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                                    <Target className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                                    <p className="font-medium">No funnel data available</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card >
                )
            }
        </div >
    );
};

export default LeadReportPage;
