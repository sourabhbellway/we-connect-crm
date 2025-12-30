import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { getAccessibleUserIds } from '../../common/utils/permission.util';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) { }

  private async getAuthorizedUserIds(userId: number | undefined, currentUser: any): Promise<number[] | null> {
    if (!currentUser || !currentUser.userId) return null;

    const accessibleUserIds = await getAccessibleUserIds(currentUser.userId, this.prisma);

    // If global access (null)
    if (accessibleUserIds === null) {
      if (userId) return [userId]; // Admin can see any specific user
      return null; // Admin seeing everything
    }

    // If restricted access
    if (userId) {
      // Check if requested userId is in accessible list
      if (accessibleUserIds.includes(userId)) return [userId];
      // Otherwise return empty list (no access to that specific user)
      return [];
    }

    // If no specific userId, return the whole accessible list
    return accessibleUserIds;
  }

  private async getCurrencyData() {
    const currencies = await this.prisma.currency.findMany({
      where: { isActive: true },
    });
    const defaultCurrency = currencies.find((c) => c.isDefault) || currencies[0] || { code: 'USD', exchangeRate: 1, symbol: '$' };
    return { currencies, defaultCurrency };
  }

  private convertToDefault(amount: number, recordCurrency: string | null, defaultCurrency: any, allCurrencies: any[]): number {
    const val = Number(amount) || 0;
    if (!recordCurrency || recordCurrency === defaultCurrency.code) return val;

    const currentCurrency = allCurrencies.find(c => c.code === recordCurrency);
    if (!currentCurrency) return val;

    // Convert to USD (base) then to Default
    // Rate is 1 USD = ? Currency
    const amountInUSD = val / Number(currentCurrency.exchangeRate);
    return amountInUSD * Number(defaultCurrency.exchangeRate);
  }

  private formatCurrency(amount: number, currency: any) {
    // We'll return raw number and currency info, and let the frontend handle formatting
    // But for "stats" where we return a string, we'll use this
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
    }).format(amount);
  }

  private buildDynamicFilters(filters: any) {
    if (!filters || typeof filters !== 'object') return {};

    const prismaFilters: any = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null || value === '') continue;

      if (Array.isArray(value)) {
        if (value.length > 0) {
          prismaFilters[key] = { in: value };
        }
      } else if (typeof value === 'object') {
        prismaFilters[key] = value;
      } else if (typeof value === 'string') {
        if (value.includes('*')) {
          prismaFilters[key] = { contains: value.replace(/\*/g, ''), mode: 'insensitive' };
        } else if (value === 'true' || value === 'false') {
          prismaFilters[key] = value === 'true';
        } else if (!isNaN(Number(value)) && key.toLowerCase().includes('id')) {
          prismaFilters[key] = Number(value);
        } else {
          prismaFilters[key] = value;
        }
      } else {
        prismaFilters[key] = value;
      }
    }

    return prismaFilters;
  }

  async kpis(startDate?: string, endDate?: string, userId?: number, includeTeamData: boolean = false, currentUser?: any) {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const createdAtFilter =
      Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    const authorizedUserIds = await this.getAuthorizedUserIds(userId, currentUser);
    const { currencies, defaultCurrency } = await this.getCurrencyData();

    const dealWhereBase: any = { ...createdAtFilter };
    const leadWhereBase: any = { deletedAt: null, ...createdAtFilter };
    const callWhereBase: any = { ...createdAtFilter };
    const taskWhereBase: any = { deletedAt: null, ...createdAtFilter };

    if (authorizedUserIds !== null) {
      dealWhereBase.assignedTo = { in: authorizedUserIds };
      leadWhereBase.assignedTo = { in: authorizedUserIds };
      callWhereBase.userId = { in: authorizedUserIds };
      taskWhereBase.assignedTo = { in: authorizedUserIds };
    }

    // Revenue metrics - Fetch all won deals to convert
    const wonDealsInRange = await this.prisma.deal.findMany({
      where: {
        status: 'WON',
        ...dealWhereBase,
      },
      select: { value: true, currency: true },
    });

    let totalRevenue = 0;
    wonDealsInRange.forEach(deal => {
      totalRevenue += this.convertToDefault(Number(deal.value || 0), deal.currency, defaultCurrency, currencies);
    });
    const avgDealSize = wonDealsInRange.length > 0 ? totalRevenue / wonDealsInRange.length : 0;

    // Counts
    const [wonDeals, lostDeals, activeDeals, totalLeads, convertedLeads] =
      await Promise.all([
        this.prisma.deal.count({
          where: {
            status: 'WON',
            ...dealWhereBase,
          },
        }),
        this.prisma.deal.count({
          where: {
            status: 'LOST',
            ...dealWhereBase,
          },
        }),
        this.prisma.deal.count({
          where: {
            status: { in: ['DRAFT', 'PROPOSAL', 'NEGOTIATION'] },
            ...dealWhereBase,
          },
        }),
        this.prisma.lead.count({
          where: {
            ...leadWhereBase,
          },
        }),
        this.prisma.lead.count({
          where: {
            ...leadWhereBase,
            status: 'CONVERTED',
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
        ...dealWhereBase,
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
          ...callWhereBase,
        },
      }),
      this.prisma.task.count({
        where: {
          ...taskWhereBase,
        },
      }),
      this.prisma.task.count({
        where: {
          ...taskWhereBase,
          status: 'COMPLETED',
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
            ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
            deals: { some: { status: 'WON' } },
            ...(authorizedUserIds !== null
              ? { assignedTo: { in: authorizedUserIds } }
              : {}
            ),
          },
          include: {
            deals: {
              where: {
                status: 'WON',
                ...dealWhereBase,
              },
              select: { value: true, currency: true, assignedTo: true },
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
              (ds: number, deal: any) => {
                const convertedValue = this.convertToDefault(Number(deal.value || 0), deal.currency, defaultCurrency, currencies);
                return ds + convertedValue;
              },
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
        ...leadWhereBase,
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
          total: totalRevenue,
          avgDealSize: avgDealSize,
          mrr: 0,
          currency: {
            code: defaultCurrency.code,
            symbol: defaultCurrency.symbol
          },
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

  async getLeadStatusDistribution(userId?: number, includeTeamData: boolean = false, currentUser?: any) {
    const authorizedUserIds = await this.getAuthorizedUserIds(userId, currentUser);

    const whereClause: any = { deletedAt: null };
    if (authorizedUserIds !== null) {
      whereClause.assignedTo = { in: authorizedUserIds };
    }

    const statusCounts = await this.prisma.lead.groupBy({
      by: ['status'],
      where: whereClause,
      _count: { status: true },
    });

    const statusMap: Record<string, string> = {
      'NEW': 'New',
      'CONTACTED': 'Contacted',
      'QUALIFIED': 'Qualified',
      'PROPOSAL': 'Proposal',
      'NEGOTIATION': 'Negotiation',
      'CLOSED': 'Closed',
      'LOST': 'Lost',
      'CONVERTED': 'Converted',
    };

    const data = statusCounts.map(item => ({
      name: statusMap[item.status] || item.status,
      value: item._count.status,
    }));

    return { success: true, data };
  }

  async getRevenueTrends(months: number = 12, userId?: number, includeTeamData: boolean = false, currentUser?: any) {
    const authorizedUserIds = await this.getAuthorizedUserIds(userId, currentUser);
    const { currencies, defaultCurrency } = await this.getCurrencyData();

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const whereClause: any = {
      status: 'WON',
      actualCloseDate: { gte: startDate, lte: endDate }
    };

    if (authorizedUserIds !== null) {
      whereClause.assignedTo = { in: authorizedUserIds };
    }

    const wonDeals = await this.prisma.deal.findMany({
      where: whereClause,
      select: { actualCloseDate: true, value: true, currency: true },
      orderBy: { actualCloseDate: 'asc' }
    });

    // Group by month and convert
    const monthlyData: Record<string, number> = {};
    wonDeals.forEach(deal => {
      const month = new Date(deal.actualCloseDate!).toISOString().slice(0, 7); // YYYY-MM
      const convertedValue = this.convertToDefault(Number(deal.value || 0), deal.currency, defaultCurrency, currencies);
      monthlyData[month] = (monthlyData[month] || 0) + convertedValue;
    });

    const data = Object.entries(monthlyData).map(([month, revenue]) => ({
      name: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: Math.round(revenue * 100) / 100,
    }));

    return { success: true, data };
  }

  async getActivityTrends(months: number = 12, userId?: number, includeTeamData: boolean = false, currentUser?: any) {
    const authorizedUserIds = await this.getAuthorizedUserIds(userId, currentUser);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const whereClause: any = { createdAt: { gte: startDate, lte: endDate } };
    if (authorizedUserIds !== null) {
      whereClause.userId = { in: authorizedUserIds };
    }

    const activityData = await this.prisma.activity.groupBy({
      by: ['createdAt'],
      where: whereClause,
      _count: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by month
    const monthlyData: Record<string, number> = {};
    activityData.forEach(item => {
      const month = new Date(item.createdAt).toISOString().slice(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + item._count.id;
    });

    const data = Object.entries(monthlyData).map(([month, count]) => ({
      name: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      activities: count,
    }));

    return { success: true, data };
  }

  async getUserGrowth(months: number = 12) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const userData = await this.prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        isActive: true
      },
      _count: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by month and calculate cumulative
    const monthlyData: Record<string, number> = {};
    let cumulative = 0;

    userData.forEach(item => {
      const month = new Date(item.createdAt).toISOString().slice(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + item._count.id;
    });

    const data = Object.entries(monthlyData).map(([month, count]) => {
      cumulative += count;
      return {
        name: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        users: cumulative,
      };
    });

    return { success: true, data };
  }

  async getLeadConversionFunnel(userId?: number, includeTeamData: boolean = false, currentUser?: any) {
    const authorizedUserIds = await this.getAuthorizedUserIds(userId, currentUser);

    // Build where clause based on scope
    const baseWhereClause: any = { deletedAt: null };
    if (authorizedUserIds !== null) {
      baseWhereClause.assignedTo = { in: authorizedUserIds };
    }

    try {
      const [totalLeads, contacted, qualified, proposal, negotiation, closed, won] = await Promise.all([
        this.prisma.lead.count({ where: baseWhereClause }),
        this.prisma.lead.count({ where: { ...baseWhereClause, status: 'CONTACTED' } }),
        this.prisma.lead.count({ where: { ...baseWhereClause, status: { in: ['QUALIFIED', 'PROPOSAL'] } } }),
        this.prisma.lead.count({ where: { ...baseWhereClause, status: 'PROPOSAL' } }),
        this.prisma.lead.count({ where: { ...baseWhereClause, status: 'NEGOTIATION' } }),
        this.prisma.lead.count({ where: { ...baseWhereClause, status: 'CLOSED' } }),
        this.prisma.lead.count({ where: { ...baseWhereClause, status: 'CONVERTED' } }),
      ]);

      const data = [
        { name: 'Total Leads', value: totalLeads },
        { name: 'Contacted', value: contacted },
        { name: 'Qualified', value: qualified },
        { name: 'Proposal', value: proposal },
        { name: 'Negotiation', value: negotiation },
        { name: 'Closed', value: closed },
        { name: 'Won', value: won },
      ];

      return { success: true, data };
    } catch (error) {
      console.error('Error in getLeadConversionFunnel:', error);
      // Return empty data structure on error instead of throwing
      return {
        success: false,
        data: [
          { name: 'Total Leads', value: 0 },
          { name: 'Contacted', value: 0 },
          { name: 'Qualified', value: 0 },
          { name: 'Proposal', value: 0 },
          { name: 'Negotiation', value: 0 },
          { name: 'Closed', value: 0 },
          { name: 'Won', value: 0 },
        ]
      };
    }
  }

  async getSalesPipelineFlow(months: number = 6, userId?: number, includeTeamData: boolean = false, currentUser?: any) {
    const authorizedUserIds = await this.getAuthorizedUserIds(userId, currentUser);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const whereClause: any = {
      deletedAt: null,
      createdAt: { gte: startDate, lte: endDate }
    };

    if (authorizedUserIds !== null) {
      whereClause.assignedTo = { in: authorizedUserIds };
    }

    // Get all leads created in the period
    const leads = await this.prisma.lead.findMany({
      where: whereClause,
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Group by month and status
    const monthlyData: Record<string, Record<string, number>> = {};

    leads.forEach(lead => {
      const month = new Date(lead.createdAt).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = {
          new: 0,
          contacted: 0,
          qualified: 0,
          proposal: 0,
          negotiation: 0,
          closed: 0
        };
      }

      // Map status to our pipeline stages
      const statusMap: Record<string, string> = {
        'NEW': 'new',
        'CONTACTED': 'contacted',
        'QUALIFIED': 'qualified',
        'PROPOSAL': 'proposal',
        'NEGOTIATION': 'negotiation',
        'CLOSED': 'closed',
        'LOST': 'closed',
        'CONVERTED': 'closed',
      };

      const pipelineStage = statusMap[lead.status] || 'new';
      monthlyData[month][pipelineStage]++;
    });

    // Convert to array format expected by the chart
    const data = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, counts]) => ({
        name: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        new: counts.new,
        contacted: counts.contacted,
        qualified: counts.qualified,
        proposal: counts.proposal,
        negotiation: counts.negotiation,
        closed: counts.closed
      }));

    return { success: true, data };
  }

  async getTopPerformers(limit: number = 5, userId?: number, includeTeamData: boolean = false, currentUser?: any) {
    const authorizedUserIds = await this.getAuthorizedUserIds(userId, currentUser);
    const { currencies, defaultCurrency } = await this.getCurrencyData();

    const whereClause: any = { status: 'WON' };
    if (authorizedUserIds !== null) {
      whereClause.assignedTo = { in: authorizedUserIds };
    }

    const topPerformers = await this.prisma.user.findMany({
      where: {
        isActive: true,
        deals: {
          some: whereClause
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        deals: {
          where: whereClause,
          select: {
            value: true,
            currency: true,
          }
        }
      }
    });

    const performersData = topPerformers
      .map(user => {
        const dealsCount = user.deals.length;
        const revenue = user.deals.reduce((sum, deal) => {
          const convertedValue = this.convertToDefault(Number(deal.value || 0), deal.currency, defaultCurrency, currencies);
          return sum + convertedValue;
        }, 0);
        return {
          name: `${user.firstName} ${user.lastName}`,
          deals: dealsCount,
          revenue: Math.round(revenue * 100) / 100
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    return { success: true, data: performersData };
  }

  async getDealVelocity(months: number = 6, userId?: number, includeTeamData: boolean = false, currentUser?: any) {
    const authorizedUserIds = await this.getAuthorizedUserIds(userId, currentUser);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const whereClause: any = {
      status: 'WON',
      actualCloseDate: { not: null, gte: startDate, lte: endDate },
      lead: { isNot: null }
    };

    if (authorizedUserIds !== null) {
      whereClause.assignedTo = { in: authorizedUserIds };
    }

    const closedDeals = await this.prisma.deal.findMany({
      where: whereClause,
      include: {
        lead: {
          select: { createdAt: true }
        }
      }
    });

    // Group by month
    const monthlyData: Record<string, { totalDays: number; count: number }> = {};

    closedDeals.forEach(deal => {
      if (deal.lead?.createdAt && deal.actualCloseDate) {
        const month = new Date(deal.actualCloseDate).toISOString().slice(0, 7); // YYYY-MM
        const days = Math.floor(
          (deal.actualCloseDate!.getTime() - deal.lead.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (!monthlyData[month]) {
          monthlyData[month] = { totalDays: 0, count: 0 };
        }

        monthlyData[month].totalDays += days;
        monthlyData[month].count++;
      }
    });

    // Convert to array format
    const data = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, stats]) => ({
        name: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        avgDays: stats.count > 0 ? Math.round(stats.totalDays / stats.count) : 0,
        deals: stats.count
      }));

    return { success: true, data };
  }

  async getLeadSourceDistribution(userId?: number, includeTeamData: boolean = false, currentUser?: any) {
    const authorizedUserIds = await this.getAuthorizedUserIds(userId, currentUser);

    const whereClause: any = { deletedAt: null };
    if (authorizedUserIds !== null) {
      whereClause.assignedTo = { in: authorizedUserIds };
    }

    const leadsBySource = await this.prisma.lead.groupBy({
      by: ['sourceId'],
      where: whereClause,
      _count: { id: true },
    });

    const sources = await this.prisma.leadSource.findMany({
      where: { isActive: true },
    });

    const sourceMap: Record<number, string> = {};
    sources.forEach(s => {
      sourceMap[s.id] = s.name;
    });

    const data = await Promise.all(leadsBySource.map(async (item) => {
      const sourceId = item.sourceId;
      const totalLeads = item._count.id;

      const convertedLeads = await this.prisma.lead.count({
        where: {
          ...whereClause,
          sourceId,
          status: 'CONVERTED',
        },
      });

      const sourceName = sourceId ? (sourceMap[sourceId] || 'Unknown') : 'No Source';
      const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

      return {
        name: sourceName,
        total: totalLeads,
        converted: convertedLeads,
        rate: `${conversionRate}%`,
      };
    }));

    // Sort by total leads descending
    data.sort((a, b) => b.total - a.total);

    return { success: true, data };
  }

  async getTaskReport(months: number = 6, userId?: number, scope: 'all' | 'me' = 'all', currentUser?: any, page: number = 1, limit: number = 10, filters?: any) {
    const authorizedUserIds = await this.getAuthorizedUserIds(userId, currentUser);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const taskWhereBase: any = {
      deletedAt: null,
      isActive: true,
      createdAt: { gte: startDate, lte: endDate }
    };

    if (authorizedUserIds !== null) {
      taskWhereBase.assignedTo = { in: authorizedUserIds };
    }

    if (filters) {
      const dynamicFilters = this.buildDynamicFilters(filters);
      Object.assign(taskWhereBase, dynamicFilters);
    }

    // 1. KPIs
    const [totalTasks, completedTasks, overdueTasks] = await Promise.all([
      this.prisma.task.count({ where: taskWhereBase }),
      this.prisma.task.count({
        where: { ...taskWhereBase, status: 'COMPLETED' }
      }),
      this.prisma.task.count({
        where: {
          ...taskWhereBase,
          status: { not: 'COMPLETED' },
          dueDate: { lt: new Date() }
        }
      })
    ]);

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // 2. Completion Trends (Monthly)
    const trendsRaw = await this.prisma.task.findMany({
      where: taskWhereBase,
      select: {
        createdAt: true,
        status: true,
        dueDate: true
      }
    });

    const monthlyTrends: Record<string, { completed: number; overdue: number; total: number }> = {};

    // Initialize months
    for (let i = 0; i < months; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7); // YYYY-MM
      monthlyTrends[key] = { completed: 0, overdue: 0, total: 0 };
    }

    trendsRaw.forEach(task => {
      const month = task.createdAt.toISOString().slice(0, 7);
      if (monthlyTrends[month]) {
        monthlyTrends[month].total++;
        if (task.status === 'COMPLETED') {
          monthlyTrends[month].completed++;
        } else if (task.dueDate && new Date(task.dueDate) < new Date()) {
          monthlyTrends[month].overdue++;
        }
      }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const completionTrendData = Object.entries(monthlyTrends)
      .map(([month, stats]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        monthKey: month,
        ...stats
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    // 3. Priority Distribution
    const priorityStats = await this.prisma.task.groupBy({
      by: ['priority'],
      where: taskWhereBase,
      _count: { id: true }
    });

    const priorityColors: Record<string, string> = {
      'HIGH': '#10b981',
      'URGENT': '#ef4444',
      'MEDIUM': '#f59e0b',
      'LOW': '#3b82f6'
    };

    const priorityDistributionData = priorityStats.map(stat => ({
      name: stat.priority.charAt(0) + stat.priority.slice(1).toLowerCase(),
      value: stat._count.id,
      color: priorityColors[stat.priority] || '#94a3b8'
    }));

    // 4. Team Performance
    const members = await this.prisma.user.findMany({
      where: { isActive: true },
      include: {
        assignedTasks: {
          where: taskWhereBase,
          select: { status: true, dueDate: true }
        }
      }
    });

    const teamPerformanceData = members.map(user => {
      const completed = user.assignedTasks.filter(t => t.status === 'COMPLETED').length;
      const overdue = user.assignedTasks.filter(t => t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < new Date()).length;
      return {
        name: `${user.firstName} ${user.lastName}`,
        completed,
        overdue
      };
    }).filter(p => p.completed > 0 || p.overdue > 0).slice(0, 10);

    // 5. Recent Overdue Tasks (Paginated)
    const overdueWhere = {
      ...taskWhereBase,
      status: { not: 'COMPLETED' },
      dueDate: { lt: new Date() }
    };
    const [recentOverdueTasks, totalRecentOverdueTasks] = await Promise.all([
      this.prisma.task.findMany({
        where: overdueWhere,
        orderBy: { dueDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          assignedUser: {
            select: { firstName: true, lastName: true }
          }
        }
      }),
      this.prisma.task.count({ where: overdueWhere })
    ]);

    return {
      success: true,
      data: {
        stats: {
          totalTasks,
          completedTasks,
          overdueTasks,
          completionRate: completionRate.toFixed(1) + '%'
        },
        completionTrendData,
        priorityDistributionData,
        teamPerformanceData,
        recentOverdueTasks: recentOverdueTasks.map(t => ({
          name: t.title,
          user: t.assignedUser ? `${t.assignedUser.firstName} ${t.assignedUser.lastName}` : 'Unassigned',
          date: t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Date',
          status: 'Overdue'
        })),
        pagination: {
          total: totalRecentOverdueTasks,
          page,
          limit,
          pages: Math.ceil(totalRecentOverdueTasks / limit)
        }
      }
    };
  }

  async getLeadReport(months: number = 6, userId?: number, scope: 'all' | 'me' = 'all', currentUser?: any, page: number = 1, limit: number = 10, filters?: any) {
    const authorizedUserIds = await this.getAuthorizedUserIds(userId, currentUser);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const prevEndDate = new Date(startDate);
    const prevStartDate = new Date(startDate);
    prevStartDate.setMonth(prevStartDate.getMonth() - months);

    const leadWhereBase: any = {
      deletedAt: null,
      isActive: true,
      createdAt: { gte: startDate, lte: endDate }
    };

    const prevLeadWhereBase: any = {
      deletedAt: null,
      isActive: true,
      createdAt: { gte: prevStartDate, lte: prevEndDate }
    };

    if (authorizedUserIds !== null) {
      leadWhereBase.assignedTo = { in: authorizedUserIds };
      prevLeadWhereBase.assignedTo = { in: authorizedUserIds };
    }

    if (filters) {
      const dynamicFilters = this.buildDynamicFilters(filters);
      Object.assign(leadWhereBase, dynamicFilters);
    }

    // 1. KPIs (Current vs Previous)
    const [
      totalLeads,
      convertedLeads,
      leadsWithResponse,
      prevTotalLeads,
      prevConvertedLeads,
      prevLeadsWithResponse
    ] = await Promise.all([
      this.prisma.lead.count({ where: leadWhereBase }),
      this.prisma.lead.count({ where: { ...leadWhereBase, status: 'CONVERTED' } }),
      this.prisma.lead.findMany({
        where: { ...leadWhereBase, lastContactedAt: { not: null } },
        select: { createdAt: true, lastContactedAt: true }
      }),
      this.prisma.lead.count({ where: prevLeadWhereBase }),
      this.prisma.lead.count({ where: { ...prevLeadWhereBase, status: 'CONVERTED' } }),
      this.prisma.lead.findMany({
        where: { ...prevLeadWhereBase, lastContactedAt: { not: null } },
        select: { createdAt: true, lastContactedAt: true }
      })
    ]);

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const prevConversionRate = prevTotalLeads > 0 ? (prevConvertedLeads / prevTotalLeads) * 100 : 0;

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    let avgResponseTimeHours = 0;
    if (leadsWithResponse.length > 0) {
      const totalHours = leadsWithResponse.reduce((sum, lead) => {
        return sum + (lead.lastContactedAt!.getTime() - lead.createdAt.getTime()) / (1000 * 60 * 60);
      }, 0);
      avgResponseTimeHours = totalHours / leadsWithResponse.length;
    }

    let prevAvgResponseTimeHours = 0;
    if (prevLeadsWithResponse.length > 0) {
      const totalHours = prevLeadsWithResponse.reduce((sum, lead) => {
        return sum + (lead.lastContactedAt!.getTime() - lead.createdAt.getTime()) / (1000 * 60 * 60);
      }, 0);
      prevAvgResponseTimeHours = totalHours / prevLeadsWithResponse.length;
    }

    // 2. Conversion Funnel (Dynamic)
    // We'll use the LeadStatus enum values as stages
    const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED', 'CONVERTED'];
    const funnelCounts = await Promise.all(stages.map(status =>
      this.prisma.lead.count({ where: { ...leadWhereBase, status: status as any } })
    ));

    const funnelData = stages.map((stage, idx) => ({
      name: stage.charAt(0) + stage.slice(1).toLowerCase(),
      value: funnelCounts[idx]
    }));

    // 3. Source Distribution (Paginated)
    const leadsBySourceAll = await this.prisma.lead.groupBy({
      by: ['sourceId'],
      where: leadWhereBase,
      _count: { id: true },
    });

    const totalSources = leadsBySourceAll.length;
    const sortedLeadsBySource = leadsBySourceAll.sort((a, b) => b._count.id - a._count.id);
    const paginatedLeadsBySource = sortedLeadsBySource.slice((page - 1) * limit, page * limit);

    const sources = await this.prisma.leadSource.findMany({
      where: { isActive: true },
    });

    const sourceMap: Record<number, string> = {};
    sources.forEach(s => sourceMap[s.id] = s.name);

    const sourceDistributionData = await Promise.all(paginatedLeadsBySource.map(async (item) => {
      const sourceId = item.sourceId;
      const total = item._count.id;
      const converted = await this.prisma.lead.count({
        where: { ...leadWhereBase, sourceId, status: 'CONVERTED' }
      });
      const name = sourceId ? (sourceMap[sourceId] || 'Unknown') : 'No Source';
      const rate = total > 0 ? Math.round((converted / total) * 100) : 0;

      return { name, total, converted, rate: `${rate}%` };
    }));

    // 4. Conversion Trends (Monthly)
    const monthlyData: Record<string, { leads: number; converted: number }> = {};
    for (let i = 0; i < months; i++) {
      const d = new Date(endDate);
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      monthlyData[key] = { leads: 0, converted: 0 };
    }

    const allLeadsInRange = await this.prisma.lead.findMany({
      where: leadWhereBase,
      select: { createdAt: true, status: true }
    });

    allLeadsInRange.forEach(lead => {
      const month = lead.createdAt.toISOString().slice(0, 7);
      if (monthlyData[month]) {
        monthlyData[month].leads++;
        if (lead.status === 'CONVERTED') {
          monthlyData[month].converted++;
        }
      }
    });

    const conversionTrendData = Object.entries(monthlyData)
      .map(([month, stats]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        monthKey: month,
        ...stats
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    return {
      success: true,
      data: {
        stats: {
          totalLeads,
          leadsChange: calculateChange(totalLeads, prevTotalLeads),
          convertedLeads,
          convertedChange: calculateChange(convertedLeads, prevConvertedLeads),
          conversionRate: conversionRate.toFixed(1) + '%',
          conversionChange: Math.round(conversionRate - prevConversionRate),
          avgResponseTimeHours: avgResponseTimeHours.toFixed(1),
          responseChange: calculateChange(avgResponseTimeHours, prevAvgResponseTimeHours)
        },
        funnelData,
        sourceDistributionData,
        conversionTrendData,
        pagination: {
          total: totalSources,
          page,
          limit,
          pages: Math.ceil(totalSources / limit)
        }
      }
    };
  }

  async getDealReport(months: number = 6, userId?: number, scope: 'all' | 'me' = 'all', currentUser?: any, page: number = 1, limit: number = 10, filters?: any) {
    const authorizedUserIds = await this.getAuthorizedUserIds(userId, currentUser);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const dealWhereBase: any = {
      deletedAt: null,
      isActive: true,
      createdAt: { gte: startDate, lte: endDate }
    };

    if (authorizedUserIds !== null) {
      dealWhereBase.assignedTo = { in: authorizedUserIds };
    }

    if (filters) {
      const dynamicFilters = this.buildDynamicFilters(filters);
      Object.assign(dealWhereBase, dynamicFilters);
    }

    // 1. KPIs
    const [totalDeals, wonDeals, lostDeals, allDealsInRange] = await Promise.all([
      this.prisma.deal.count({ where: dealWhereBase }),
      this.prisma.deal.count({ where: { ...dealWhereBase, status: 'WON' } }),
      this.prisma.deal.count({ where: { ...dealWhereBase, status: 'LOST' } }),
      this.prisma.deal.findMany({ where: dealWhereBase, include: { lead: { select: { createdAt: true } } } })
    ]);

    const { currencies, defaultCurrency } = await this.getCurrencyData();

    const activeDeals = allDealsInRange.filter(d => !['WON', 'LOST'].includes(d.status));
    const pipelineValue = activeDeals.reduce((sum, d) => {
      const converted = this.convertToDefault(Number(d.value || 0), d.currency, defaultCurrency, currencies);
      return sum + converted;
    }, 0);
    const closedDealsValue = allDealsInRange.filter(d => d.status === 'WON').reduce((sum, d) => {
      const converted = this.convertToDefault(Number(d.value || 0), d.currency, defaultCurrency, currencies);
      return sum + converted;
    }, 0);

    const totalClosed = wonDeals + lostDeals;
    const winRate = totalClosed > 0 ? (wonDeals / totalClosed) * 100 : 0;
    const avgDealSize = wonDeals > 0 ? closedDealsValue / wonDeals : 0;

    // 2. Monthly Sales Trend (Actual vs Forecast)
    const monthlyData: Record<string, { actual: number; forecast: number }> = {};
    for (let i = 0; i < months; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      monthlyData[key] = { actual: 0, forecast: 0 };
    }

    allDealsInRange.forEach(deal => {
      const createdMonth = deal.createdAt.toISOString().slice(0, 7);
      const convertedValue = this.convertToDefault(Number(deal.value || 0), deal.currency, defaultCurrency, currencies);
      if (monthlyData[createdMonth]) {
        monthlyData[createdMonth].forecast += convertedValue;
      }
      if (deal.status === 'WON' && deal.actualCloseDate) {
        const closedMonth = deal.actualCloseDate.toISOString().slice(0, 7);
        if (monthlyData[closedMonth]) {
          monthlyData[closedMonth].actual += convertedValue;
        }
      }
    });

    const salesTrendData = Object.entries(monthlyData)
      .map(([month, stats]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        monthKey: month,
        ...stats
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    // 3. Deal Velocity (Avg Days to Close)
    const wonDealsWithDates = allDealsInRange.filter(d => d.status === 'WON' && d.actualCloseDate && d.createdAt);
    const avgDaysToClose = wonDealsWithDates.length > 0
      ? wonDealsWithDates.reduce((sum, d) => sum + (d.actualCloseDate!.getTime() - d.createdAt.getTime()) / (1000 * 60 * 60 * 24), 0) / wonDealsWithDates.length
      : 0;

    // 4. Recent Closed Deals (Paginated)
    const [recentClosedDeals, totalRecentClosedDeals] = await Promise.all([
      this.prisma.deal.findMany({
        where: { ...dealWhereBase, status: 'WON' },
        orderBy: { actualCloseDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          assignedUser: { select: { firstName: true, lastName: true } }
        }
      }),
      this.prisma.deal.count({
        where: { ...dealWhereBase, status: 'WON' }
      })
    ]);

    return {
      success: true,
      data: {
        stats: {
          pipelineValue: this.formatCurrency(pipelineValue, defaultCurrency),
          closedDealsValue: this.formatCurrency(closedDealsValue, defaultCurrency),
          winRate: winRate.toFixed(1) + '%',
          avgDealSize: this.formatCurrency(avgDealSize, defaultCurrency),
          avgDaysToClose: Math.round(avgDaysToClose)
        },
        salesTrendData,
        recentClosedDeals: recentClosedDeals.map(d => ({
          name: d.title,
          owner: d.assignedUser ? `${d.assignedUser.firstName} ${d.assignedUser.lastName}` : 'Unassigned',
          value: this.formatCurrency(this.convertToDefault(Number(d.value || 0), d.currency, defaultCurrency, currencies), defaultCurrency),
          date: d.actualCloseDate ? new Date(d.actualCloseDate).toLocaleDateString() : 'N/A'
        })),
        pagination: {
          total: totalRecentClosedDeals,
          page,
          limit,
          pages: Math.ceil(totalRecentClosedDeals / limit)
        },
        currency: {
          code: defaultCurrency.code,
          symbol: defaultCurrency.symbol
        }
      }
    };
  }

  async getExpenseReport(months: number = 6, userId?: number, scope: 'all' | 'me' = 'all', currentUser?: any, page: number = 1, limit: number = 10, filters?: any) {
    const authorizedUserIds = await this.getAuthorizedUserIds(userId, currentUser);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const expenseWhereBase: any = {
      deletedAt: null,
      isActive: true,
      expenseDate: { gte: startDate, lte: endDate }
    };

    if (authorizedUserIds !== null) {
      expenseWhereBase.submittedBy = { in: authorizedUserIds };
    }

    if (filters) {
      const dynamicFilters = this.buildDynamicFilters(filters);
      Object.assign(expenseWhereBase, dynamicFilters);
    }

    const { currencies, defaultCurrency } = await this.getCurrencyData();

    // 1. KPIs - Fetch all relevant expenses to convert
    const allExpensesInRange = await this.prisma.expense.findMany({
      where: expenseWhereBase,
      select: { amount: true, currency: true, status: true, category: true, expenseDate: true, description: true, submittedByUser: { select: { firstName: true, lastName: true } } }
    });

    let totalAmount = 0;
    let approvedAmount = 0;
    let pendingAmount = 0;
    let rejectedAmount = 0;

    let totalCount = allExpensesInRange.length;
    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;

    allExpensesInRange.forEach(exp => {
      const converted = this.convertToDefault(Number(exp.amount), exp.currency, defaultCurrency, currencies);
      totalAmount += converted;

      if (exp.status === 'APPROVED') {
        approvedAmount += converted;
        approvedCount++;
      } else if (exp.status === 'PENDING') {
        pendingAmount += converted;
        pendingCount++;
      } else if (exp.status === 'REJECTED') {
        rejectedAmount += converted;
        rejectedCount++;
      }
    });

    // 2. Monthly Trend
    const trendsRaw = await this.prisma.expense.findMany({
      where: expenseWhereBase,
      select: { expenseDate: true, amount: true, status: true }
    });

    const monthlyTrends: Record<string, { amount: number; count: number }> = {};
    for (let i = 0; i < months; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      monthlyTrends[key] = { amount: 0, count: 0 };
    }

    allExpensesInRange.forEach(exp => {
      const month = exp.expenseDate.toISOString().slice(0, 7);
      if (monthlyTrends[month]) {
        monthlyTrends[month].amount += this.convertToDefault(Number(exp.amount), exp.currency, defaultCurrency, currencies);
        monthlyTrends[month].count++;
      }
    });

    const expenseTrendData = Object.entries(monthlyTrends)
      .map(([month, stats]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        monthKey: month,
        ...stats
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    // 3. Category Distribution
    const categoryMap: Record<string, { value: number; count: number }> = {};
    allExpensesInRange.forEach(exp => {
      if (!categoryMap[exp.category]) {
        categoryMap[exp.category] = { value: 0, count: 0 };
      }
      categoryMap[exp.category].value += this.convertToDefault(Number(exp.amount), exp.currency, defaultCurrency, currencies);
      categoryMap[exp.category].count++;
    });

    const categoryDistributionData = Object.entries(categoryMap).map(([name, stats]) => ({
      name,
      value: Math.round(stats.value * 100) / 100,
      count: stats.count
    })).sort((a, b) => b.value - a.value);

    // 4. Recent Expenses (Paginated)
    const [recentExpenses, totalRecentExpenses] = await Promise.all([
      this.prisma.expense.findMany({
        where: expenseWhereBase,
        orderBy: { expenseDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          submittedByUser: {
            select: { firstName: true, lastName: true }
          }
        }
      }),
      this.prisma.expense.count({ where: expenseWhereBase })
    ]);

    return {
      success: true,
      data: {
        stats: {
          totalAmount: this.formatCurrency(totalAmount, defaultCurrency),
          totalCount,
          approvedAmount: this.formatCurrency(approvedAmount, defaultCurrency),
          approvedCount,
          pendingAmount: this.formatCurrency(pendingAmount, defaultCurrency),
          pendingCount,
          rejectedAmount: this.formatCurrency(rejectedAmount, defaultCurrency),
          rejectedCount
        },
        expenseTrendData,
        categoryDistributionData,
        recentExpenses: allExpensesInRange
          .sort((a, b) => b.expenseDate.getTime() - a.expenseDate.getTime())
          .slice((page - 1) * limit, page * limit)
          .map(e => ({
            description: e.description || 'No description',
            category: e.category,
            amount: this.formatCurrency(this.convertToDefault(Number(e.amount), e.currency, defaultCurrency, currencies), defaultCurrency),
            date: new Date(e.expenseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: e.status,
            user: e.submittedByUser ? `${e.submittedByUser.firstName} ${e.submittedByUser.lastName}` : 'N/A'
          })),
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit)
        },
        currency: {
          code: defaultCurrency.code,
          symbol: defaultCurrency.symbol
        }
      }
    };
  }

  async getInvoiceReport(months: number = 6, userId?: number, scope: 'all' | 'me' = 'all', currentUser?: any, page: number = 1, limit: number = 10, filters?: any) {
    const authorizedUserIds = await this.getAuthorizedUserIds(userId, currentUser);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const invoiceWhereBase: any = {
      deletedAt: null,
      createdAt: { gte: startDate, lte: endDate }
    };

    if (authorizedUserIds !== null) {
      invoiceWhereBase.createdBy = { in: authorizedUserIds };
    }

    if (filters) {
      const dynamicFilters = this.buildDynamicFilters(filters);
      Object.assign(invoiceWhereBase, dynamicFilters);
    }

    const { currencies, defaultCurrency } = await this.getCurrencyData();

    // 1. KPIs - Fetch all invoices in range to convert
    const allInvoicesInRange = await this.prisma.invoice.findMany({
      where: invoiceWhereBase,
      select: { totalAmount: true, paidAmount: true, status: true, createdAt: true, dueDate: true, invoiceNumber: true, lead: { select: { firstName: true, lastName: true } }, currency: true }
    });

    let totalBilled = 0;
    let totalPaid = 0;
    let overdueAmount = 0;

    allInvoicesInRange.forEach(inv => {
      if (inv.status === 'CANCELLED') return;

      const convertedTotal = this.convertToDefault(Number(inv.totalAmount), inv.currency, defaultCurrency, currencies);
      const convertedPaid = this.convertToDefault(Number(inv.paidAmount), inv.currency, defaultCurrency, currencies);

      totalBilled += convertedTotal;
      totalPaid += convertedPaid;

      if (inv.status === 'OVERDUE') {
        overdueAmount += (convertedTotal - convertedPaid);
      }
    });

    const outstanding = totalBilled - totalPaid;

    // 2. Monthly Trend
    const invoicesRaw = await this.prisma.invoice.findMany({
      where: { ...invoiceWhereBase, status: { not: 'CANCELLED' } },
      select: { createdAt: true, totalAmount: true, paidAmount: true }
    });

    const monthlyData: Record<string, { billed: number; collected: number }> = {};
    for (let i = 0; i < months; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      monthlyData[key] = { billed: 0, collected: 0 };
    }

    allInvoicesInRange.forEach(inv => {
      if (inv.status === 'CANCELLED') return;
      const month = inv.createdAt.toISOString().slice(0, 7);
      if (monthlyData[month]) {
        monthlyData[month].billed += this.convertToDefault(Number(inv.totalAmount), inv.currency, defaultCurrency, currencies);
        monthlyData[month].collected += this.convertToDefault(Number(inv.paidAmount), inv.currency, defaultCurrency, currencies);
      }
    });

    const revenueTrendData = Object.entries(monthlyData)
      .map(([month, values]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        monthKey: month,
        ...values
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    // 3. Status Distribution
    const statusStats = await this.prisma.invoice.groupBy({
      by: ['status'],
      where: invoiceWhereBase,
      _count: { id: true }
    });

    const statusDistributionData = statusStats.map(stat => ({
      name: stat.status,
      value: stat._count.id
    }));

    // 4. Recent High-Value Invoices (Paginated)
    const [highValueInvoices, totalInvoices] = await Promise.all([
      this.prisma.invoice.findMany({
        where: invoiceWhereBase,
        orderBy: { totalAmount: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          lead: { select: { firstName: true, lastName: true } }
        }
      }),
      this.prisma.invoice.count({ where: invoiceWhereBase })
    ]);

    return {
      success: true,
      data: {
        stats: {
          totalBilled: this.formatCurrency(totalBilled, defaultCurrency),
          totalPaid: this.formatCurrency(totalPaid, defaultCurrency),
          outstanding: this.formatCurrency(outstanding, defaultCurrency),
          overdue: this.formatCurrency(overdueAmount, defaultCurrency)
        },
        revenueTrendData,
        statusDistributionData,
        highValueInvoices: allInvoicesInRange
          .sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount))
          .slice((page - 1) * limit, page * limit)
          .map(inv => ({
            id: inv.invoiceNumber,
            client: inv.lead ? `${inv.lead.firstName} ${inv.lead.lastName}` : 'N/A',
            amount: this.formatCurrency(this.convertToDefault(Number(inv.totalAmount), inv.currency, defaultCurrency, currencies), defaultCurrency),
            rawAmount: Number(inv.totalAmount),
            status: inv.status,
            date: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : new Date(inv.createdAt).toLocaleDateString()
          })),
        pagination: {
          total: allInvoicesInRange.length,
          page,
          limit,
          pages: Math.ceil(allInvoicesInRange.length / limit)
        },
        currency: {
          code: defaultCurrency.code,
          symbol: defaultCurrency.symbol
        }
      }
    };
  }

  async getQuotationReport(months: number = 6, userId?: number, scope: 'all' | 'me' = 'all', currentUser?: any, page: number = 1, limit: number = 10, filters?: any) {
    const authorizedUserIds = await this.getAuthorizedUserIds(userId, currentUser);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const quotationWhereBase: any = {
      deletedAt: null,
      createdAt: { gte: startDate, lte: endDate }
    };

    if (authorizedUserIds !== null) {
      quotationWhereBase.createdBy = { in: authorizedUserIds };
    }

    if (filters) {
      const dynamicFilters = this.buildDynamicFilters(filters);
      Object.assign(quotationWhereBase, dynamicFilters);
    }

    const { currencies, defaultCurrency } = await this.getCurrencyData();

    // 1. KPIs
    const [totalCount, acceptedCount, waitingCount, rejectedCount, allQuotationsInRange] = await Promise.all([
      this.prisma.quotation.count({ where: quotationWhereBase }),
      this.prisma.quotation.count({ where: { ...quotationWhereBase, status: 'ACCEPTED' } }),
      this.prisma.quotation.count({ where: { ...quotationWhereBase, status: { in: ['SENT', 'VIEWED'] } } }),
      this.prisma.quotation.count({ where: { ...quotationWhereBase, status: 'REJECTED' } }),
      this.prisma.quotation.findMany({
        where: quotationWhereBase,
        select: { totalAmount: true, currency: true, status: true, quotationNumber: true, title: true, validUntil: true, createdAt: true, lead: { select: { firstName: true, lastName: true } } }
      })
    ]);

    // Conversion percentage
    const conversionRate = totalCount > 0 ? (acceptedCount / totalCount) * 100 : 0;

    // 2. Trend Data (Monthly Acceptance Rate)
    const quotesRaw = await this.prisma.quotation.findMany({
      where: quotationWhereBase,
      select: { createdAt: true, status: true }
    });

    const monthlyData: Record<string, { total: number; accepted: number }> = {};
    for (let i = 0; i < months; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      monthlyData[key] = { total: 0, accepted: 0 };
    }

    quotesRaw.forEach(q => {
      const month = q.createdAt.toISOString().slice(0, 7);
      if (monthlyData[month]) {
        monthlyData[month].total++;
        if (q.status === 'ACCEPTED') {
          monthlyData[month].accepted++;
        }
      }
    });

    const trendData = Object.entries(monthlyData)
      .map(([month, values]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        monthKey: month,
        rate: values.total > 0 ? Number(((values.accepted / values.total) * 100).toFixed(1)) : 0,
        total: values.total,
        accepted: values.accepted
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    // 3. Status Distribution
    const statusStats = await this.prisma.quotation.groupBy({
      by: ['status'],
      where: quotationWhereBase,
      _count: { id: true }
    });

    const statusDistributionData = statusStats.map(stat => ({
      name: stat.status,
      value: stat._count.id
    }));

    // 4. Quotations Table (Paginated)
    const [quotations, totalQuotations] = await Promise.all([
      this.prisma.quotation.findMany({
        where: quotationWhereBase,
        orderBy: { totalAmount: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          lead: { select: { firstName: true, lastName: true } },
          createdByUser: { select: { firstName: true, lastName: true } }
        }
      }),
      this.prisma.quotation.count({ where: quotationWhereBase })
    ]);

    return {
      success: true,
      data: {
        stats: {
          total: totalCount,
          accepted: acceptedCount,
          waiting: waitingCount,
          rejected: rejectedCount,
          conversionRate: Number(conversionRate.toFixed(1))
        },
        trendData,
        statusDistributionData,
        quotations: allQuotationsInRange
          .sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount))
          .slice((page - 1) * limit, page * limit)
          .map(q => ({
            id: q.quotationNumber,
            subject: q.title,
            amount: this.formatCurrency(this.convertToDefault(Number(q.totalAmount), q.currency, defaultCurrency, currencies), defaultCurrency),
            rawAmount: Number(q.totalAmount),
            status: q.status,
            validUntil: q.validUntil ? new Date(q.validUntil).toLocaleDateString() : 'N/A',
            client: q.lead ? `${q.lead.firstName} ${q.lead.lastName}` : 'N/A'
          })),
        pagination: {
          total: allQuotationsInRange.length,
          page,
          limit,
          pages: Math.ceil(allQuotationsInRange.length / limit)
        },
        currency: {
          code: defaultCurrency.code,
          symbol: defaultCurrency.symbol
        }
      }
    };
  }
}
