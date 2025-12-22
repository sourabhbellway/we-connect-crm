import React, { useEffect, useState } from 'react';
import {
    Briefcase,
    TrendingUp,
    Percent,
    DollarSign,
    ArrowLeft,
    Filter,
    Download,
    Loader2,
    Activity,
    Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button } from '../../components/ui';
import { Pagination } from '../../components/ui/Pagination';
import { analyticsService } from '../../services/analyticsService';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
    LineChart,
    Line
} from 'recharts';
import { useBusinessSettings } from '../../contexts/BusinessSettingsContext';

const DealReportPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);
    const [dateRange, setDateRange] = useState('6months');
    const [chartType, setChartType] = useState('area');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await analyticsService.getDealReport(
                    dateRange === '3months' ? 3 : dateRange === '6months' ? 6 : 12,
                    undefined,
                    'all',
                    currentPage,
                    itemsPerPage
                );
                if (response.success) {
                    setReportData(response.data);
                }
            } catch (error) {
                console.error('Error fetching deal report data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dateRange, currentPage, itemsPerPage]);

    const stats = [
        {
            label: 'Pipeline Value',
            value: reportData?.stats?.pipelineValue || '0',
            icon: Briefcase,
            color: 'text-blue-500',
            bg: 'bg-blue-50'
        },
        {
            label: 'Closed Deals',
            value: reportData?.stats?.closedDealsValue || '0',
            icon: TrendingUp,
            color: 'text-green-500',
            bg: 'bg-green-50'
        },
        {
            label: 'Win Rate',
            value: reportData?.stats?.winRate || '0%',
            icon: Percent,
            color: 'text-orange-500',
            bg: 'bg-orange-50'
        },
        {
            label: 'Avg. Deal Size',
            value: reportData?.stats?.avgDealSize || '0',
            icon: DollarSign,
            color: 'text-purple-500',
            bg: 'bg-purple-50'
        },
    ];

    const { formatCurrency } = useBusinessSettings();

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
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
            <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales & Deal Report</h1>
                        <p className="text-sm text-gray-400 font-medium">Comprehensive overview of sales pipeline and closure rates.</p>
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
                    <Button variant="OUTLINE" className="flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </Button>
                    <Button variant="PRIMARY" className="flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sales Forecast vs Actual</h3>
                            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700 p-0.5">
                                {['area', 'line', 'bar'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setChartType(type)}
                                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${chartType === type
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-600 dark:text-gray-300'
                                            }`}
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            {chartType === 'area' ? (
                                <AreaChart data={reportData?.salesTrendData || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="month" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" tickFormatter={(value) => `${reportData?.currency?.symbol || '$'}${value >= 1000 ? (value / 1000).toFixed(0) + 'K' : value}`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Area type="monotone" dataKey="forecast" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} name="Forecasted Revenue" />
                                    <Area type="monotone" dataKey="actual" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Actual Revenue" />
                                </AreaChart>
                            ) : chartType === 'line' ? (
                                <LineChart data={reportData?.salesTrendData || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="month" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" tickFormatter={(value) => `${reportData?.currency?.symbol || '$'}${value >= 1000 ? (value / 1000).toFixed(0) + 'K' : value}`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line type="monotone" dataKey="forecast" stroke="#3B82F6" strokeWidth={2} name="Forecasted" />
                                    <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} name="Actual" />
                                </LineChart>
                            ) : (
                                <BarChart data={reportData?.salesTrendData || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="month" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="forecast" fill="#3B82F6" name="Forecasted" />
                                    <Bar dataKey="actual" fill="#10B981" name="Actual" />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="dark:bg-slate-900 border-none shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Deal Performance Metrics</h3>
                            <Activity className="w-5 h-5 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 h-[300px]">
                            <div className="flex flex-col items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                                <Clock className="w-10 h-10 text-blue-500 mb-4" />
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{reportData?.stats?.avgDaysToClose || 0}</p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Days to Close</p>
                            </div>
                            <div className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                                <TrendingUp className="w-10 h-10 text-green-500 mb-4" />
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{reportData?.stats?.winRate || '0%'}</p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Winning Chance</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="dark:bg-slate-900 border-none shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Closed Deals</h3>
                        <Briefcase className="w-5 h-5 text-blue-500" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-slate-950 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Deal Name</th>
                                    <th className="px-6 py-4">Owner</th>
                                    <th className="px-6 py-4">Value</th>
                                    <th className="px-6 py-4">Closed On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {(reportData?.recentClosedDeals || []).map((deal: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{deal.name}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{deal.owner}</td>
                                        <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">{deal.value}</td>
                                        <td className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{deal.date}</td>
                                    </tr>
                                ))}
                                {(reportData?.recentClosedDeals || []).length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-gray-400 font-medium italic">
                                            No closed deals found in this period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {(reportData?.recentClosedDeals || []).length > 0 && (
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
        </div>
    );
};

export default DealReportPage;
