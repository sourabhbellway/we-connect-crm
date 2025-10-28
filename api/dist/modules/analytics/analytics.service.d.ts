import { PrismaService } from '../../database/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    kpis(startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: {
            revenue: {
                total: number;
                avgDealSize: number;
                mrr: number;
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
}
