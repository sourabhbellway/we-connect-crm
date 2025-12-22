import { PrismaService } from '../../database/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getAuthorizedUserIds;
    private getCurrencyData;
    private convertToDefault;
    private formatCurrency;
    kpis(startDate?: string, endDate?: string, userId?: number, includeTeamData?: boolean, currentUser?: any): Promise<{
        success: boolean;
        data: {
            revenue: {
                total: number;
                avgDealSize: number;
                mrr: number;
                currency: {
                    code: string;
                    symbol: string;
                };
                wonDeals: number;
                lostDeals: number;
                activeDeals: number;
                revenueBySource: {
                    source: any;
                    revenue: number;
                    leadCount: any;
                }[];
            };
            conversion: {
                conversionRate: number;
                winRate: number;
                totalLeads: number;
                convertedLeads: number;
                avgSalesCycleDays: number;
                avgResponseTimeHours: number;
            };
            activity: {
                totalCalls: number;
                totalTasks: number;
                completedTasks: number;
                taskCompletionRate: number;
            };
        };
    }>;
    getLeadStatusDistribution(userId?: number, includeTeamData?: boolean, currentUser?: any): Promise<{
        success: boolean;
        data: {
            name: string;
            value: number;
        }[];
    }>;
    getRevenueTrends(months?: number, userId?: number, includeTeamData?: boolean, currentUser?: any): Promise<{
        success: boolean;
        data: {
            name: string;
            revenue: number;
        }[];
    }>;
    getActivityTrends(months?: number, userId?: number, includeTeamData?: boolean, currentUser?: any): Promise<{
        success: boolean;
        data: {
            name: string;
            activities: number;
        }[];
    }>;
    getUserGrowth(months?: number): Promise<{
        success: boolean;
        data: {
            name: string;
            users: number;
        }[];
    }>;
    getLeadConversionFunnel(userId?: number, includeTeamData?: boolean, currentUser?: any): Promise<{
        success: boolean;
        data: {
            name: string;
            value: number;
        }[];
    }>;
    getSalesPipelineFlow(months?: number, userId?: number, includeTeamData?: boolean, currentUser?: any): Promise<{
        success: boolean;
        data: {
            name: string;
            new: number;
            contacted: number;
            qualified: number;
            proposal: number;
            negotiation: number;
            closed: number;
        }[];
    }>;
    getTopPerformers(limit?: number, userId?: number, includeTeamData?: boolean, currentUser?: any): Promise<{
        success: boolean;
        data: {
            name: string;
            deals: number;
            revenue: number;
        }[];
    }>;
    getDealVelocity(months?: number, userId?: number, includeTeamData?: boolean, currentUser?: any): Promise<{
        success: boolean;
        data: {
            name: string;
            avgDays: number;
            deals: number;
        }[];
    }>;
    getLeadSourceDistribution(userId?: number, includeTeamData?: boolean, currentUser?: any): Promise<{
        success: boolean;
        data: {
            name: string;
            total: number;
            converted: number;
            rate: string;
        }[];
    }>;
    getTaskReport(months?: number, userId?: number, scope?: 'all' | 'me', currentUser?: any, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            stats: {
                totalTasks: number;
                completedTasks: number;
                overdueTasks: number;
                completionRate: string;
            };
            completionTrendData: {
                completed: number;
                overdue: number;
                total: number;
                month: string;
                monthKey: string;
            }[];
            priorityDistributionData: {
                name: string;
                value: number;
                color: string;
            }[];
            teamPerformanceData: {
                name: string;
                completed: number;
                overdue: number;
            }[];
            recentOverdueTasks: {
                name: string;
                user: string;
                date: string;
                status: string;
            }[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                pages: number;
            };
        };
    }>;
    getLeadReport(months?: number, userId?: number, scope?: 'all' | 'me', currentUser?: any, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            stats: {
                totalLeads: number;
                leadsChange: number;
                convertedLeads: number;
                convertedChange: number;
                conversionRate: string;
                conversionChange: number;
                avgResponseTimeHours: string;
                responseChange: number;
            };
            funnelData: {
                name: string;
                value: number;
            }[];
            sourceDistributionData: {
                name: string;
                total: number;
                converted: number;
                rate: string;
            }[];
            conversionTrendData: {
                leads: number;
                converted: number;
                month: string;
                monthKey: string;
            }[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                pages: number;
            };
        };
    }>;
    getDealReport(months?: number, userId?: number, scope?: 'all' | 'me', currentUser?: any, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            stats: {
                pipelineValue: string;
                closedDealsValue: string;
                winRate: string;
                avgDealSize: string;
                avgDaysToClose: number;
            };
            salesTrendData: {
                actual: number;
                forecast: number;
                month: string;
                monthKey: string;
            }[];
            recentClosedDeals: {
                name: string;
                owner: string;
                value: string;
                date: string;
            }[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                pages: number;
            };
            currency: {
                code: string;
                symbol: string;
            };
        };
    }>;
    getExpenseReport(months?: number, userId?: number, scope?: 'all' | 'me', currentUser?: any, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            stats: {
                totalAmount: string;
                totalCount: number;
                approvedAmount: string;
                approvedCount: number;
                pendingAmount: string;
                pendingCount: number;
                rejectedAmount: string;
                rejectedCount: number;
            };
            expenseTrendData: {
                amount: number;
                count: number;
                month: string;
                monthKey: string;
            }[];
            categoryDistributionData: {
                name: string;
                value: number;
                count: number;
            }[];
            recentExpenses: {
                description: string;
                category: string;
                amount: string;
                date: string;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                user: string;
            }[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                pages: number;
            };
            currency: {
                code: string;
                symbol: string;
            };
        };
    }>;
    getInvoiceReport(months?: number, userId?: number, scope?: 'all' | 'me', currentUser?: any, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            stats: {
                totalBilled: string;
                totalPaid: string;
                outstanding: string;
                overdue: string;
            };
            revenueTrendData: {
                billed: number;
                collected: number;
                month: string;
                monthKey: string;
            }[];
            statusDistributionData: {
                name: import("@prisma/client").$Enums.InvoiceStatus;
                value: number;
            }[];
            highValueInvoices: {
                id: string;
                client: string;
                amount: string;
                rawAmount: number;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                date: string;
            }[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                pages: number;
            };
            currency: {
                code: string;
                symbol: string;
            };
        };
    }>;
    getQuotationReport(months?: number, userId?: number, scope?: 'all' | 'me', currentUser?: any, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            stats: {
                total: number;
                accepted: number;
                waiting: number;
                rejected: number;
                conversionRate: number;
            };
            trendData: {
                month: string;
                monthKey: string;
                rate: number;
                total: number;
                accepted: number;
            }[];
            statusDistributionData: {
                name: import("@prisma/client").$Enums.QuotationStatus;
                value: number;
            }[];
            quotations: {
                id: string;
                subject: string;
                amount: string;
                rawAmount: number;
                status: import("@prisma/client").$Enums.QuotationStatus;
                validUntil: string;
                client: string;
            }[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                pages: number;
            };
            currency: {
                code: string;
                symbol: string;
            };
        };
    }>;
}
