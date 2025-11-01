import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async kpis(startDate?: string, endDate?: string) {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Revenue metrics
    const totalRevenueAgg = await this.prisma.deal.aggregate({
      where: {
        status: 'WON',
        ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
      },
      _sum: { value: true },
    });
    const avgDealSizeAgg = await this.prisma.deal.aggregate({
      where: {
        status: 'WON',
        ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
      },
      _avg: { value: true },
    });

    // Counts
    const [wonDeals, lostDeals, activeDeals, totalLeads, convertedLeads] =
      await Promise.all([
        this.prisma.deal.count({
          where: {
            status: 'WON',
            ...(Object.keys(dateFilter).length
              ? { createdAt: dateFilter }
              : {}),
          },
        }),
        this.prisma.deal.count({
          where: {
            status: 'LOST',
            ...(Object.keys(dateFilter).length
              ? { createdAt: dateFilter }
              : {}),
          },
        }),
        this.prisma.deal.count({
          where: {
            status: { in: ['DRAFT', 'PROPOSAL', 'NEGOTIATION'] },
            ...(Object.keys(dateFilter).length
              ? { createdAt: dateFilter }
              : {}),
          },
        }),
        this.prisma.lead.count({
          where: {
            ...(Object.keys(dateFilter).length
              ? { createdAt: dateFilter }
              : {}),
          },
        }),
        this.prisma.lead.count({
          where: {
            status: 'CLOSED',
            ...(Object.keys(dateFilter).length
              ? { createdAt: dateFilter }
              : {}),
          },
        }),
      ]);

    // Win rate and conversion rate
    const totalClosedDeals = wonDeals + lostDeals;
    const winRate =
      totalClosedDeals > 0
        ? Math.round((wonDeals / totalClosedDeals) * 100)
        : 0;
    const conversionRate = totalLeads
      ? Math.round((convertedLeads / totalLeads) * 100)
      : 0;

    // Average sales cycle (lead createdAt to deal actualCloseDate)
    const closedDealsWithLeads = await this.prisma.deal.findMany({
      where: {
        status: 'WON',
        leadId: { not: null },
        actualCloseDate: { not: null },
        ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
      },
      include: { lead: { select: { createdAt: true } } },
    });
    let avgSalesCycleDays = 0;
    if (closedDealsWithLeads.length > 0) {
      const totalDays = closedDealsWithLeads.reduce((sum, d: any) => {
        if (d.lead?.createdAt && d.actualCloseDate) {
          const days = Math.floor(
            (d.actualCloseDate.getTime() - d.lead.createdAt.getTime()) /
              (1000 * 60 * 60 * 24),
          );
          return sum + days;
        }
        return sum;
      }, 0);
      avgSalesCycleDays = Math.round(totalDays / closedDealsWithLeads.length);
    }

    // Activity metrics
    const [totalCalls, totalTasks, completedTasks] = await Promise.all([
      this.prisma.callLog.count({
        where: {
          ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
        },
      }),
      this.prisma.task.count({
        where: {
          ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
        },
      }),
      this.prisma.task.count({
        where: {
          status: 'COMPLETED',
          ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
        },
      }),
    ]);
    const taskCompletionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Revenue by source (top 5)
    const revenueBySourceRaw = await this.prisma.leadSource.findMany({
      include: {
        leads: {
          where: {
            isActive: true,
            deletedAt: null,
            deals: { some: { status: 'WON' } },
          },
          include: {
            deals: {
              where: {
                status: 'WON',
                ...(Object.keys(dateFilter).length
                  ? { createdAt: dateFilter }
                  : {}),
              },
              select: { value: true },
            },
          },
        },
      },
    });
    const revenueBySource = revenueBySourceRaw
      .map((src: any) => {
        const total = src.leads.reduce(
          (sum: number, lead: any) =>
            sum +
            lead.deals.reduce(
              (ds: number, deal: any) =>
                ds + (deal.value ? Number(deal.value) : 0),
              0,
            ),
          0,
        );
        return {
          source: src.name,
          revenue: Math.round(total * 100) / 100,
          leadCount: src.leads.length,
        };
      })
      .filter((r: any) => r.revenue > 0)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5);

    // Response time metrics
    const leadsWithContacted = await this.prisma.lead.findMany({
      where: {
        ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
        lastContactedAt: { not: null },
      },
      select: { createdAt: true, lastContactedAt: true },
    });
    let avgResponseTimeHours = 0;
    if (leadsWithContacted.length > 0) {
      const totalHours = leadsWithContacted.reduce(
        (sum: number, lead: any) =>
          sum +
          (lead.lastContactedAt!.getTime() - lead.createdAt.getTime()) /
            (1000 * 60 * 60),
        0,
      );
      avgResponseTimeHours =
        Math.round((totalHours / leadsWithContacted.length) * 10) / 10;
    }

    return {
      success: true,
      data: {
        revenue: {
          total: totalRevenueAgg._sum.value
            ? Number(totalRevenueAgg._sum.value)
            : 0,
          avgDealSize: avgDealSizeAgg._avg.value
            ? Number(avgDealSizeAgg._avg.value)
            : 0,
          mrr: 0,
          wonDeals,
          lostDeals,
          activeDeals,
          revenueBySource,
        },
        conversion: {
          conversionRate,
          winRate,
          totalLeads,
          convertedLeads,
          avgSalesCycleDays,
          avgResponseTimeHours,
        },
        activity: {
          totalCalls,
          totalTasks,
          completedTasks,
          taskCompletionRate,
        },
      },
    };
  }
}
