import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3,
    Users,
    TrendingUp,
    DollarSign,
    ChevronRight,
    ClipboardList
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui';

const ReportsPage: React.FC = () => {
    const navigate = useNavigate();

    const reportCategories = [
        {
            id: 'task-reports',
            name: 'Task Reports',
            description: 'Analyze task completion rates, team productivity and efficiency.',
            icon: ClipboardList,
            color: 'bg-blue-500',
            href: '/reports/tasks',
            count: '12 available'
        },
        {
            id: 'lead-reports',
            name: 'Lead Reports',
            description: 'Track lead generation, conversion rates and source performance.',
            icon: Users,
            color: 'bg-green-500',
            href: '/reports/leads',
            count: '8 available'
        },
        {
            id: 'deal-reports',
            name: 'Deal Reports',
            description: 'Monitor sales pipeline, deal velocity and revenue forecasts.',
            icon: TrendingUp,
            color: 'bg-purple-500',
            href: '/reports/deals',
            count: '15 available'
        },
        {
            id: 'expense-reports',
            name: 'Expense Reports',
            description: 'Review spending patterns, budget adherence and financial health.',
            icon: DollarSign,
            color: 'bg-orange-500',
            href: '/reports/expenses',
            count: '6 available'
        },
        {
            id: 'invoice-reports',
            name: 'Invoice Reports',
            description: 'Track billing cycles, payments, and outstanding balances.',
            icon: BarChart3,
            color: 'bg-red-500',
            href: '/reports/invoices',
            count: '10 available'
        },
        {
            id: 'quotation-reports',
            name: 'Quotation Reports',
            description: 'Analyze acceptance rates and proposal effectiveness.',
            icon: TrendingUp,
            color: 'bg-indigo-500',
            href: '/reports/quotations',
            count: '9 available'
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-8 h-8 text-weconnect-red" />
                    Analytics & Reports
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Get deep insights into your business performance and team productivity.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {reportCategories.map((report) => (
                    <Card
                        key={report.id}
                        className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-gray-100 dark:border-slate-800 overflow-hidden"
                        onClick={() => navigate(report.href)}
                    >
                        <div className={`h-1.5 w-full ${report.color}`} />
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className={`p-3 rounded-xl ${report.color} bg-opacity-10 text-white`}>
                                        <report.icon className={`w-8 h-8 ${report.color.replace('bg-', 'text-')}`} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-weconnect-red transition-colors">
                                            {report.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                                            {report.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-2 rounded-full bg-gray-50 dark:bg-slate-900 group-hover:bg-weconnect-red/10 group-hover:text-weconnect-red transition-all">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between border-t border-gray-50 dark:border-slate-800 pt-4">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    {report.count}
                                </span>
                                <span className="text-sm font-medium text-weconnect-red opacity-0 group-hover:opacity-100 transition-opacity">
                                    View Reports &rarr;
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Summary Section / Extra Content */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none overflow-hidden">
                <CardContent className="p-8 relative">
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-2xl font-bold mb-2">Build Custom Reports</h2>
                        <p className="text-slate-300 mb-6">
                            Need a more specific view of your data? Use our powerful custom report builder to visualize any dataset exactly how you want it.
                        </p>
                        <button className="px-6 py-2.5 bg-weconnect-red hover:bg-red-700 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-red-900/20">
                            Launch Report Builder
                        </button>
                    </div>
                    <BarChart3 className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white opacity-5 transform -rotate-12" />
                </CardContent>
            </Card>
        </div>
    );
};

export default ReportsPage;
