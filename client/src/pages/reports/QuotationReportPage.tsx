import React from 'react';
import {
    CheckCircle,
    Clock,
    XCircle,
    ArrowLeft,
    Download,
    TrendingUp,
    FileText,
    FileSearch
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button } from '../../components/ui';
import { Pagination } from '../../components/ui/Pagination';
import { analyticsService } from '../../services/analyticsService';
import { Loader2 } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const QuotationReportPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(10);
    const [loading, setLoading] = React.useState(true);
    const [reportData, setReportData] = React.useState<any>(null);
    const [dateRange, setDateRange] = React.useState('6months');

    React.useEffect(() => {
        const fetchReportData = async () => {
            try {
                setLoading(true);
                const response = await analyticsService.getQuotationReport(
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
                console.error('Error fetching quotation report:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, [dateRange, currentPage, itemsPerPage]);

    const stats = [
        { label: 'Total Quotes', value: reportData?.stats?.total.toString() || '0', icon: FileSearch, color: 'text-purple-500', bg: 'bg-purple-50' },
        { label: 'Accepted', value: reportData?.stats?.accepted.toString() || '0', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Waiting', value: reportData?.stats?.waiting.toString() || '0', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Rejected', value: reportData?.stats?.rejected.toString() || '0', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
    ];

    const exportToCSV = () => {
        if (!reportData?.quotations?.length) return;

        const headers = ['Quote #', 'Subject', 'Client', 'Amount', 'Status', 'Valid Until'];
        const rows = reportData.quotations.map((q: any) => [
            q.id,
            q.subject,
            q.client,
            q.amount,
            q.status,
            q.validUntil
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map((e: any) => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `quotation_report_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
            <div className="flex items-center justify-between">
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quotation Performance</h1>
                        <p className="text-sm text-gray-400 font-medium">Tracking proposal success rates and conversion pipeline.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                        <option value="3months">Last 3 Months</option>
                        <option value="6months">Last 6 Months</option>
                        <option value="12months">Last 12 Months</option>
                    </select>
                    <Button variant="PRIMARY" className="flex items-center gap-2" onClick={exportToCSV}>
                        <Download className="w-4 h-4" /> Export Report
                    </Button>
                </div>
            </div>

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 dark:bg-slate-900 border-none shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Acceptance Rate Trend (%)</h3>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={reportData?.trendData || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="month" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" tickFormatter={(value) => `${value}%`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    formatter={(value: number) => [`${value}%`, 'Acceptance Rate']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="rate"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10B981', r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="min-h-[350px] flex items-center justify-center border-none dark:bg-slate-900 bg-blue-600 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-32 h-32 text-white" />
                    </div>
                    <div className="relative z-10 p-6 text-white h-full flex flex-col justify-center">
                        <p className="text-blue-100 text-sm font-bold uppercase tracking-widest mb-2">Overall Conversion</p>
                        <h2 className="text-6xl font-black mb-4">{reportData?.stats?.conversionRate}%</h2>
                        <div className="flex items-center gap-2 text-blue-100 font-medium">
                            <TrendingUp className="w-4 h-4" />
                            <span>Average across period</span>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="dark:bg-slate-900 border-none shadow-sm">
                <CardHeader>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">High-Value Quotations</h3>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-slate-950 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Quote #</th>
                                    <th className="px-6 py-4">Subject</th>
                                    <th className="px-6 py-4">Client</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Valid Until</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {(reportData?.quotations || []).map((quote: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            {quote.id}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-slate-300 font-medium">{quote.subject}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{quote.client}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{quote.amount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${quote.status === 'ACCEPTED' ? 'bg-green-100 text-green-600' :
                                                quote.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                                                    quote.status === 'EXPIRED' ? 'bg-gray-100 text-gray-600' :
                                                        'bg-orange-100 text-orange-600'
                                                }`}>
                                                {quote.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-orange-500 uppercase tracking-widest">{quote.validUntil}</td>
                                    </tr>
                                ))}
                                {(reportData?.quotations || []).length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">
                                            No quotations found for this period.
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

export default QuotationReportPage;
