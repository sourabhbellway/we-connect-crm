import React, { useEffect, useState } from 'react';
import {
    DollarSign,
    CheckCircle,
    Clock,
    AlertCircle,
    ArrowLeft,
    Download,
    TrendingUp,
    PieChart,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button } from '../../components/ui';
import { Pagination } from '../../components/ui/Pagination';
import { analyticsService } from '../../services/analyticsService';
import HorizontalFilters, { FilterField } from '../../components/reports/HorizontalFilters';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell
} from 'recharts';

const InvoiceReportPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);
    const [dateRange, setDateRange] = useState('6months');
    const [filters, setFilters] = useState<any>({
        search: '',
        status: ''
    });
    const [filterFields] = useState<FilterField[]>([
        { key: 'search', label: 'Search', type: 'text', placeholder: 'Search invoices...' },
        {
            key: 'status', label: 'Status', type: 'select', options: [
                { label: 'Paid', value: 'PAID' },
                { label: 'Pending', value: 'PENDING' },
                { label: 'Overdue', value: 'OVERDUE' },
                { label: 'Partial', value: 'PARTIAL' },
                { label: 'Draft', value: 'DRAFT' },
                { label: 'Cancelled', value: 'CANCELLED' }
            ]
        }
    ]);

    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev: any) => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                setLoading(true);
                const response = await analyticsService.getInvoiceReport(
                    dateRange === '3months' ? 3 : dateRange === '6months' ? 6 : 12,
                    undefined,
                    'all',
                    currentPage,
                    itemsPerPage,
                    filters
                );
                if (response.success) {
                    setReportData(response.data);
                }
            } catch (error) {
                console.error('Error fetching invoice report:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, [dateRange, currentPage, itemsPerPage, filters]);

    const stats = [
        { label: 'Total Invoiced', value: reportData?.stats?.totalBilled || '0', icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Amount Paid', value: reportData?.stats?.totalPaid || '0', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Outstanding', value: reportData?.stats?.outstanding || '0', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Overdue', value: reportData?.stats?.overdue || '0', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    ];

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

    const exportToCSV = () => {
        if (!reportData?.highValueInvoices?.length) return;

        const headers = ['Invoice #', 'Client', 'Amount', 'Status', 'Due Date'];
        const rows = reportData.highValueInvoices.map((inv: any) => [
            inv.id,
            inv.client,
            inv.amount,
            inv.status,
            inv.date
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map((e: any) => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `high_value_invoices_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: reportData?.currency?.code || 'USD',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
                    <p className="font-medium text-gray-900 dark:text-white mb-2">{`${label}`}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {`${entry.name}: ${formatCurrency(entry.value)}`}
                            </p>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Analysis Report</h1>
                        <p className="text-sm text-gray-400 font-medium">Financial insights, collection trends, and receivables.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-1">
                        {['3months', '6months', '12months'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${dateRange === range
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {range === '3months' ? '3M' : range === '6months' ? '6M' : '1Y'}
                            </button>
                        ))}
                    </div>
                    <Button variant="PRIMARY" className="flex items-center gap-2" onClick={exportToCSV}>
                        <Download className="w-4 h-4" /> Export
                    </Button>
                </div>
            </div>

            <HorizontalFilters
                fields={filterFields}
                values={filters}
                onChange={handleFilterChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm dark:bg-slate-900">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="dark:bg-slate-900 border-none shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Analysis</h3>
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={reportData?.revenueTrendData || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="month" stroke="#9CA3AF" />
                                <YAxis
                                    stroke="#9CA3AF"
                                    tickFormatter={(value) => value >= 1000 ? `${reportData?.currency?.symbol || '$'}${(value / 1000).toFixed(0)}K` : `${reportData?.currency?.symbol || '$'}${value}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="billed" name="Billed" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="collected" name="Collected" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="dark:bg-slate-900 border-none shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Invoice Status Distribution</h3>
                            <PieChart className="w-5 h-5 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPieChart>
                                <Pie
                                    data={reportData?.statusDistributionData || []}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                >
                                    {(reportData?.statusDistributionData || []).map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="dark:bg-slate-900 border-none shadow-sm">
                <CardHeader>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent High-Value Invoices</h3>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-medium">
                            <thead className="bg-gray-50 dark:bg-slate-950 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-4 text-center">Invoice #</th>
                                    <th className="px-6 py-4">Client</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Due Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {(reportData?.highValueInvoices || []).map((inv: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-center font-bold text-blue-600 dark:text-blue-400">{inv.id}</td>
                                        <td className="px-6 py-4 text-gray-900 dark:text-white">{inv.client}</td>
                                        <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-bold">{inv.amount}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${inv.status === 'PAID' ? 'bg-green-100 text-green-600' :
                                                inv.status === 'OVERDUE' ? 'bg-red-100 text-red-600' :
                                                    'bg-orange-100 text-orange-600'
                                                }`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-xs text-gray-400">{inv.date}</td>
                                    </tr>
                                ))}
                                {(reportData?.highValueInvoices || []).length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic font-medium">
                                            No invoice data found for this period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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
                </CardContent>
            </Card>
        </div>
    );
};

export default InvoiceReportPage;
