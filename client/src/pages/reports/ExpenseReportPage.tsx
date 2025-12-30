import React, { useEffect, useState } from 'react';
import {
    PieChart as PieChartIcon,
    Briefcase,
    AlertTriangle,
    ArrowLeft,
    Download,
    TrendingUp,
    BarChart3,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button } from '../../components/ui';
import { Pagination } from '../../components/ui/Pagination';
import { analyticsService } from '../../services/analyticsService';
import HorizontalFilters, { FilterField } from '../../components/reports/HorizontalFilters';
import { userService } from '../../services/userService';
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
import { useBusinessSettings } from '../../contexts/BusinessSettingsContext';

const ExpenseReportPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);
    const [dateRange, setDateRange] = useState('6months');
    const [filters, setFilters] = useState<any>({
        search: '',
        category: '',
        type: '',
        status: '',
        submittedBy: ''
    });
    const [filterFields, setFilterFields] = useState<FilterField[]>([
        { key: 'search', label: 'Search', type: 'text', placeholder: 'Search expenses...' },
        {
            key: 'status', label: 'Status', type: 'select', options: [
                { label: 'Pending', value: 'PENDING' },
                { label: 'Approved', value: 'APPROVED' },
                { label: 'Rejected', value: 'REJECTED' },
                { label: 'Reimbursed', value: 'REIMBURSED' }
            ]
        },
        {
            key: 'type', label: 'Type', type: 'select', options: [
                { label: 'Travel', value: 'TRAVEL' },
                { label: 'Meals', value: 'MEALS' },
                { label: 'Accommodation', value: 'ACCOMMODATION' },
                { label: 'Office Supplies', value: 'OFFICE_SUPPLIES' },
                { label: 'Utilities', value: 'UTILITIES' },
                { label: 'Marketing', value: 'MARKETING' },
                { label: 'Entertainment', value: 'ENTERTAINMENT' },
                { label: 'Training', value: 'TRAINING' },
                { label: 'Equipment', value: 'EQUIPMENT' },
                { label: 'Software', value: 'SOFTWARE' },
                { label: 'Consulting', value: 'CONSULTING' },
                { label: 'Miscellaneous', value: 'MISCELLANEOUS' },
                { label: 'Other', value: 'OTHER' }
            ]
        },
        { key: 'category', label: 'Category', type: 'text', placeholder: 'Category...' },
        { key: 'submittedBy', label: 'Submitted By', type: 'select', options: [] },
    ]);

    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev: any) => ({ ...prev, [key]: value }));
    };

    const { formatCurrency } = useBusinessSettings();

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const usersRes = await userService.getUsers();
                if (usersRes.success) {
                    const updatedFields = [...filterFields];
                    const userField = updatedFields.find(f => f.key === 'submittedBy');
                    if (userField) {
                        userField.options = usersRes.data.map((u: any) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }));
                        setFilterFields(updatedFields);
                    }
                }
            } catch (error) {
                console.error('Error fetching users for filters:', error);
            }
        };
        fetchMetadata();
    }, []);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                setLoading(true);
                const response = await analyticsService.getExpenseReport(
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
                console.error('Error fetching expense report:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, [dateRange, currentPage, itemsPerPage, filters]);

    const stats = [
        {
            label: 'Total Expenses',
            value: reportData?.stats?.totalAmount || '0',
            icon: PieChartIcon,
            color: 'text-red-500',
            bg: 'bg-red-50'
        },
        {
            label: 'Approved',
            value: reportData?.stats?.approvedAmount || '0',
            icon: PieChartIcon,
            color: 'text-green-500',
            bg: 'bg-green-50'
        },
        {
            label: 'Pending',
            value: reportData?.stats?.pendingAmount || '0',
            icon: Briefcase,
            color: 'text-blue-500',
            bg: 'bg-blue-50'
        },
        {
            label: 'Rejected',
            value: reportData?.stats?.rejectedAmount || '0',
            icon: AlertTriangle,
            color: 'text-orange-500',
            bg: 'bg-orange-50'
        },
    ];

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
            </div>
        );
    }

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

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-sm font-medium"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Analysis Report</h1>
                        <p className="text-sm text-gray-400 font-medium">Detailed breakdown of company spending and overheads.</p>
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
                    <Button variant="PRIMARY" className="flex items-center gap-2">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm dark:bg-slate-900">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="dark:bg-slate-900 border-none shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Expense Trend</h3>
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={reportData?.expenseTrendData || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="month" stroke="#9CA3AF" />
                                <YAxis
                                    stroke="#9CA3AF"
                                    tickFormatter={(value) => `${reportData?.currency?.symbol || ''}${value >= 1000 ? (value / 1000).toFixed(0) + 'K' : value}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="amount" name="Total Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="dark:bg-slate-900 border-none shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Expense Category Breakdown</h3>
                            <BarChart3 className="w-5 h-5 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPieChart>
                                <Pie
                                    data={reportData?.categoryDistributionData || []}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {(reportData?.categoryDistributionData || []).map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="dark:bg-slate-900 border-none shadow-sm">
                <CardHeader>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Large Expenses</h3>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-slate-950 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Expense Description</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Submitted By</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {(reportData?.recentExpenses || []).map((exp: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{exp.description}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{exp.category}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{exp.user}</td>
                                        <td className="px-6 py-4 font-bold text-red-600">{exp.amount}</td>
                                        <td className="px-6 py-4 text-xs font-medium text-gray-400">{exp.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${exp.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                                                exp.status === 'PENDING' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-red-100 text-red-600'
                                                }`}>
                                                {exp.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(reportData?.recentExpenses || []).length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-400 font-medium italic">
                                            No expense data available for this range.
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

export default ExpenseReportPage;
