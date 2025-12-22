import React, { useEffect, useState } from 'react';
import {
    Users,
    Activity,
    ArrowLeft,
    Filter,
    Download,
    Target,
    PieChart as PieChartIcon,
    Loader2,
    TrendingUp,
    Calendar,
    BarChart3,
    TrendingDown,
    ArrowRight,
    Eye,
    MousePointer,
    Layers,
    Info,
    Zap,
    ChevronUp,
    ChevronDown,
    MoreHorizontal,
    Clock,
    UserCheck
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
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ComposedChart,
    ReferenceLine,
    Treemap,
    ScatterChart,
    Scatter,
    FunnelChart,
    Funnel,
    LabelList
} from 'recharts';

const LeadReportPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);
    const [dateRange, setDateRange] = useState('6months');
    const [chartType, setChartType] = useState('area');
    const [funnelView, setFunnelView] = useState('horizontal'); // New state for funnel view

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await analyticsService.getLeadReport(
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
                console.error('Error fetching lead report data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dateRange, currentPage, itemsPerPage]);

    const stats = [
        {
            label: 'Total Leads',
            value: reportData?.stats?.totalLeads?.toLocaleString() || '0',
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            change: reportData?.stats?.leadsChange || 0,
            isPositive: reportData?.stats?.leadsChange >= 0
        },
        {
            label: 'Conversion Rate',
            value: reportData?.stats?.conversionRate || '0%',
            icon: Target,
            color: 'text-green-500',
            bg: 'bg-green-50',
            change: reportData?.stats?.conversionChange || 0,
            isPositive: reportData?.stats?.conversionChange >= 0
        },
        {
            label: 'Converted Leads',
            value: reportData?.stats?.convertedLeads?.toLocaleString() || '0',
            icon: Activity,
            color: 'text-orange-500',
            bg: 'bg-orange-50',
            change: reportData?.stats?.convertedChange || 0,
            isPositive: reportData?.stats?.convertedChange >= 0
        },
        {
            label: 'Avg. Response',
            value: `${reportData?.stats?.avgResponseTimeHours || 0} hrs`,
            icon: Clock,
            color: 'text-purple-500',
            bg: 'bg-purple-50',
            change: reportData?.stats?.responseChange || 0,
            isPositive: reportData?.stats?.responseChange <= 0
        },
    ];

    // Colors for charts
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

    // Enhanced tooltip for charts with more detailed information
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
                    <p className="font-medium text-gray-900 dark:text-white mb-2">{`${label}`}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {`${entry.name}: ${entry.value.toLocaleString()}`}
                            </p>
                        </div>
                    ))}
                    {payload.length > 1 && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Total: {payload.reduce((sum: number, entry: any) => sum + entry.value, 0).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    // Custom label for pie chart with percentage
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

    // Custom tooltip for conversion rate
    const ConversionTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const leads = payload.find((entry: any) => entry.dataKey === 'leads')?.value || 0;
            const converted = payload.find((entry: any) => entry.dataKey === 'converted')?.value || 0;
            const rate = leads > 0 ? ((converted / leads) * 100).toFixed(1) : 0;

            return (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
                    <p className="font-medium text-gray-900 dark:text-white mb-2">{`${label}`}</p>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Total Leads: {leads.toLocaleString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Converted: {converted.toLocaleString()}
                            </p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Conversion Rate: {rate}%
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Custom tooltip for funnel stages
    const FunnelTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const conversionRate = data.conversionRate || 0;

            return (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
                    <p className="font-medium text-gray-900 dark:text-white mb-2">{data.name}</p>
                    <div className="space-y-1">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Leads: {data.value.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Conversion Rate: {conversionRate}%
                        </p>
                        {data.dropoff && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                Drop-off: {data.dropoff.toLocaleString()} ({data.dropoffRate}%)
                            </p>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Custom bar shape for funnel effect
    const FunnelBar = (props: any) => {
        const { fill, x, y, width, height, payload } = props;

        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={fill}
                    rx={4}
                    ry={4}
                />
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill="url(#colorGradient)"
                    rx={4}
                    ry={4}
                />
            </g>
        );
    };

    // Custom shape for treemap
    const CustomTreemapContent = (props: any) => {
        const { x, y, width, height, name, value } = props;

        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                        fill: props.color,
                        stroke: '#fff',
                        strokeWidth: 2,
                        strokeOpacity: 1,
                    }}
                />
                {width > 50 && height > 50 && (
                    <>
                        <text
                            x={x + width / 2}
                            y={y + height / 2 - 10}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={14}
                            fontWeight="bold"
                        >
                            {name}
                        </text>
                        <text
                            x={x + width / 2}
                            y={y + height / 2 + 10}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={12}
                        >
                            {value}
                        </text>
                    </>
                )}
            </g>
        );
    };

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

    // Process funnel data for modern visualization
    const processedFunnelData = reportData?.funnelData?.map((stage: any, index: number) => {
        const previousValue = index > 0 ? reportData.funnelData[index - 1].value : 0;
        const dropoff = previousValue > 0 ? previousValue - stage.value : 0;
        const dropoffRate = previousValue > 0 ? ((dropoff / previousValue) * 100).toFixed(1) : 0;
        const conversionRate = index > 0 ? ((stage.value / reportData.funnelData[0].value) * 100).toFixed(1) : 100;

        return {
            ...stage,
            dropoff,
            dropoffRate,
            conversionRate,
            fill: COLORS[index % COLORS.length]
        };
    }) || [];

    // Generate radar chart data for lead sources
    const radarData = reportData?.sourceDistributionData?.map((source: any) => ({
        source: source.name,
        leads: source.total,
        conversion: parseFloat(source.rate) * 10, // Scale for better visualization
        fullMark: 100
    })) || [];

    // Generate treemap data
    const treemapData = reportData?.sourceDistributionData?.map((source: any, index: number) => ({
        name: source.name,
        size: source.total,
        color: COLORS[index % COLORS.length]
    })) || [];

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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lead Analysis Report</h1>
                        <p className="text-sm text-gray-400 font-medium">Insights into lead funnel and conversion metrics.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-1">
                        <button
                            onClick={() => setDateRange('3months')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${dateRange === '3months'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            3M
                        </button>
                        <button
                            onClick={() => setDateRange('6months')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${dateRange === '6months'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            6M
                        </button>
                        <button
                            onClick={() => setDateRange('12months')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${dateRange === '12months'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            1Y
                        </button>
                    </div>
                    <Button variant="OUTLINE" className="flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </Button>
                    <Button variant="PRIMARY" className="flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export Excel
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm dark:bg-slate-900 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                    </div>
                                </div>
                                <div className={`flex flex-col items-center gap-1 text-xs font-medium ${stat.isPositive ? 'text-green-500' : 'text-red-500'
                                    }`}>
                                    {stat.isPositive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    {Math.abs(stat.change)}%
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Enhanced Lead Conversion Journey Section */}


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="dark:bg-slate-900 border-none shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lead Source Distribution</h3>
                            <div className="flex items-center gap-2">
                                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                                </button>
                                <PieChartIcon className="w-5 h-5 text-purple-500" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={reportData?.sourceDistributionData || []}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="total"
                                    animationBegin={0}
                                    animationDuration={800}
                                >
                                    {((reportData?.sourceDistributionData) || []).map((_entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="dark:bg-slate-900 border-none shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lead Conversion Trend</h3>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700 p-0.5">
                                    <button
                                        onClick={() => setChartType('area')}
                                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${chartType === 'area'
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-600 dark:text-gray-300'
                                            }`}
                                    >
                                        Area
                                    </button>
                                    <button
                                        onClick={() => setChartType('line')}
                                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${chartType === 'line'
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-600 dark:text-gray-300'
                                            }`}
                                    >
                                        Line
                                    </button>
                                    <button
                                        onClick={() => setChartType('bar')}
                                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${chartType === 'bar'
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-600 dark:text-gray-300'
                                            }`}
                                    >
                                        Bar
                                    </button>
                                </div>
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            {chartType === 'area' ? (
                                <AreaChart data={reportData?.conversionTrendData || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="month" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip content={<ConversionTooltip />} />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="leads"
                                        stackId="1"
                                        stroke="#3B82F6"
                                        fill="#3B82F6"
                                        fillOpacity={0.6}
                                        animationDuration={800}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="converted"
                                        stackId="1"
                                        stroke="#10B981"
                                        fill="#10B981"
                                        fillOpacity={0.6}
                                        animationDuration={800}
                                    />
                                </AreaChart>
                            ) : chartType === 'line' ? (
                                <LineChart data={reportData?.conversionTrendData || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="month" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip content={<ConversionTooltip />} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="leads"
                                        stroke="#3B82F6"
                                        strokeWidth={2}
                                        dot={{ fill: '#3B82F6' }}
                                        activeDot={{ r: 6 }}
                                        animationDuration={800}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="converted"
                                        stroke="#10B981"
                                        strokeWidth={2}
                                        dot={{ fill: '#10B981' }}
                                        activeDot={{ r: 6 }}
                                        animationDuration={800}
                                    />
                                </LineChart>
                            ) : (
                                <BarChart data={reportData?.conversionTrendData || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="month" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip content={<ConversionTooltip />} />
                                    <Legend />
                                    <Bar dataKey="leads" fill="#3B82F6" animationDuration={800} />
                                    <Bar dataKey="converted" fill="#10B981" animationDuration={800} />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="dark:bg-slate-900 border-none shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between w-full">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Source Performance</h3>
                        <Activity className="w-5 h-5 text-green-500" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-slate-950 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Source</th>
                                    <th className="px-6 py-4">Total Leads</th>
                                    <th className="px-6 py-4">Converted</th>
                                    <th className="px-6 py-4">Conv. Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {(reportData?.sourceDistributionData || []).map((source: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{source.name}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{source.total}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-slate-300 font-medium">{source.converted}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 rounded-full"
                                                        style={{ width: source.rate }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">{source.rate}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(reportData?.sourceDistributionData || []).length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-gray-400 font-medium italic">
                                            No lead source data available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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
        </div>
    );
};

export default LeadReportPage;