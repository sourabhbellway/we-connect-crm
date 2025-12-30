import React from 'react';
import {
    CheckCircle,
    Clock,
    AlertTriangle,
    ArrowLeft,
    Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button } from '../../components/ui';
import { Pagination } from '../../components/ui/Pagination';
import analyticsService from '../../services/analyticsService';
import HorizontalFilters, { FilterField } from '../../components/reports/HorizontalFilters';
import { userService } from '../../services/userService';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const TaskReportPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(10);
    const [loading, setLoading] = React.useState(true);
    const [reportData, setReportData] = React.useState<any>(null);
    const [filters, setFilters] = React.useState<any>({
        search: '',
        status: '',
        priority: '',
        assignedTo: ''
    });
    const [filterFields, setFilterFields] = React.useState<FilterField[]>([
        { key: 'search', label: 'Search', type: 'text', placeholder: 'Search tasks...' },
        {
            key: 'status', label: 'Status', type: 'select', options: [
                { label: 'Pending', value: 'PENDING' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Completed', value: 'COMPLETED' },
                { label: 'Cancelled', value: 'CANCELLED' }
            ]
        },
        {
            key: 'priority', label: 'Priority', type: 'select', options: [
                { label: 'Low', value: 'LOW' },
                { label: 'Medium', value: 'MEDIUM' },
                { label: 'High', value: 'HIGH' },
                { label: 'Urgent', value: 'URGENT' }
            ]
        },
        { key: 'assignedTo', label: 'Assigned To', type: 'select', options: [] },
    ]);

    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev: any) => ({ ...prev, [key]: value }));
    };

    React.useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const usersRes = await userService.getUsers();
                if (usersRes.success) {
                    const updatedFields = [...filterFields];
                    const userField = updatedFields.find(f => f.key === 'assignedTo');
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

    React.useEffect(() => {
        const fetchReportData = async () => {
            try {
                setLoading(true);
                const response = await analyticsService.getTaskReport(
                    6,
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
                console.error('Error fetching task report:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, [currentPage, itemsPerPage, filters]);

    const stats = [
        {
            label: 'Total Tasks',
            value: reportData?.stats?.totalTasks || '0',
            icon: CheckCircle,
            color: 'text-blue-500',
            bg: 'bg-blue-50'
        },
        {
            label: 'Completed',
            value: reportData?.stats?.completedTasks || '0',
            icon: Clock,
            color: 'text-green-500',
            bg: 'bg-green-50'
        },
        {
            label: 'Overdue',
            value: reportData?.stats?.overdueTasks || '0',
            icon: AlertTriangle,
            color: 'text-red-500',
            bg: 'bg-red-50'
        },
        {
            label: 'Completion Rate',
            value: reportData?.stats?.completionRate || '0%',
            icon: ArrowLeft,
            color: 'text-purple-500',
            bg: 'bg-purple-50'
        },
    ];

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Custom tooltip for the completion trend chart
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
                    <p className="font-medium text-gray-900 dark:text-white">{`${label}`}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {`${entry.name}: ${entry.value}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Custom label for the pie chart
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Performance Report</h1>
                        <p className="text-sm text-gray-400 font-medium">Detailed analytics on task completion and team efficiency.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="PRIMARY" className="flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export PDF
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
                    <CardHeader>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Task Completion Trend</h3>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={reportData?.completionTrendData || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="month" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="completed"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={{ fill: '#10b981' }}
                                    activeDot={{ r: 8 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="overdue"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    dot={{ fill: '#ef4444' }}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="dark:bg-slate-900 border-none shadow-sm">
                    <CardHeader>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Task Priority Distribution</h3>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={reportData?.priorityDistributionData || []}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {(reportData?.priorityDistributionData || []).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="dark:bg-slate-900 border-none shadow-sm">
                <CardHeader>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Team Performance</h3>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportData?.teamPerformanceData || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="completed" fill="#10b981" />
                            <Bar dataKey="overdue" fill="#ef4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="dark:bg-slate-900 border-none shadow-sm">
                <CardHeader>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Overdue Tasks</h3>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-slate-950 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Task Name</th>
                                    <th className="px-6 py-4">Assigned To</th>
                                    <th className="px-6 py-4">Due Date</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {(reportData?.recentOverdueTasks || []).map((task: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{task.name}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{task.user}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-red-500">{task.date}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-bold uppercase">
                                                {task.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
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

export default TaskReportPage;
