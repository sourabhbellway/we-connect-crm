import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Get comprehensive dashboard KPIs including revenue, conversion rates, and activity metrics
 */
export const getDashboardKPIs = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate as string);
    }

    const whereClause: any = { 
      isActive: true, 
      deletedAt: null,
      ...dateFilter
    };

    // Revenue Metrics
    const totalRevenue = await prisma.deal.aggregate({
      where: {
        status: "WON",
        isActive: true,
        deletedAt: null,
        ...dateFilter
      },
      _sum: {
        value: true
      }
    });

    const avgDealSize = await prisma.deal.aggregate({
      where: {
        status: "WON",
        isActive: true,
        deletedAt: null,
        ...dateFilter
      },
      _avg: {
        value: true
      }
    });

    // Deal counts by status
    const [wonDeals, lostDeals, activeDeals, totalLeads, convertedLeads] = await Promise.all([
      prisma.deal.count({ where: { status: "WON", isActive: true, deletedAt: null, ...dateFilter } }),
      prisma.deal.count({ where: { status: "LOST", isActive: true, deletedAt: null, ...dateFilter } }),
      prisma.deal.count({ where: { status: { in: ["DRAFT", "IN_PROGRESS", "NEGOTIATION"] }, isActive: true, deletedAt: null, ...dateFilter } }),
      prisma.lead.count({ where: whereClause }),
      prisma.lead.count({ where: { ...whereClause, status: "CLOSED" } })
    ]);

    // Win Rate
    const totalClosedDeals = wonDeals + lostDeals;
    const winRate = totalClosedDeals > 0 ? (wonDeals / totalClosedDeals) * 100 : 0;

    // Conversion Rate (Leads to Closed)
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Average Sales Cycle - calculate time from lead creation to deal closed
    const closedDealsWithLeads = await prisma.deal.findMany({
      where: {
        status: "WON",
        isActive: true,
        deletedAt: null,
        leadId: { not: null },
        actualCloseDate: { not: null },
        ...dateFilter
      },
      include: {
        lead: {
          select: {
            createdAt: true
          }
        }
      }
    });

    let avgSalesCycleDays = 0;
    if (closedDealsWithLeads.length > 0) {
      const totalDays = closedDealsWithLeads.reduce((sum, deal) => {
        if (deal.lead && deal.actualCloseDate) {
          const days = Math.floor((deal.actualCloseDate.getTime() - deal.lead.createdAt.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }
        return sum;
      }, 0);
      avgSalesCycleDays = Math.round(totalDays / closedDealsWithLeads.length);
    }

    // Activity Metrics
    const [totalCallLogs, totalTasks, completedTasks] = await Promise.all([
      prisma.callLog.count({ where: { createdAt: dateFilter.createdAt || {} } }),
      prisma.task.count({ where: { createdAt: dateFilter.createdAt || {} } }),
      prisma.task.count({ where: { status: "COMPLETED", createdAt: dateFilter.createdAt || {} } })
    ]);

    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Revenue by Source
    const revenueBySource = await prisma.leadSource.findMany({
      include: {
        leads: {
          where: {
            isActive: true,
            deletedAt: null,
            deals: {
              some: {
                status: "WON",
                isActive: true,
                deletedAt: null
              }
            }
          },
          include: {
            deals: {
              where: {
                status: "WON",
                isActive: true,
                deletedAt: null,
                ...dateFilter
              },
              select: {
                value: true
              }
            }
          }
        }
      }
    });

    const sourceRevenueData = revenueBySource.map(source => {
      const totalRevenue = source.leads.reduce((sum, lead) => {
        const leadRevenue = lead.deals.reduce((dealSum, deal) => {
          return dealSum + (deal.value ? parseFloat(deal.value.toString()) : 0);
        }, 0);
        return sum + leadRevenue;
      }, 0);

      return {
        source: source.name,
        revenue: Math.round(totalRevenue * 100) / 100,
        leadCount: source.leads.length
      };
    }).filter(item => item.revenue > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Monthly Recurring Revenue (MRR) - placeholder for future subscription deals
    const mrr = 0;

    // Response time metrics - average time to first contact
    const leadsWithContacted = await prisma.lead.findMany({
      where: {
        ...whereClause,
        lastContactedAt: { not: null }
      },
      select: {
        createdAt: true,
        lastContactedAt: true
      }
    });

    let avgResponseTimeHours = 0;
    if (leadsWithContacted.length > 0) {
      const totalHours = leadsWithContacted.reduce((sum, lead) => {
        if (lead.lastContactedAt) {
          const hours = (lead.lastContactedAt.getTime() - lead.createdAt.getTime()) / (1000 * 60 * 60);
          return sum + hours;
        }
        return sum;
      }, 0);
      avgResponseTimeHours = Math.round((totalHours / leadsWithContacted.length) * 10) / 10;
    }

    res.json({
      success: true,
      data: {
        revenue: {
          total: totalRevenue._sum.value ? parseFloat(totalRevenue._sum.value.toString()) : 0,
          avgDealSize: avgDealSize._avg.value ? parseFloat(avgDealSize._avg.value.toString()) : 0,
          mrr: mrr,
          wonDeals: wonDeals,
          lostDeals: lostDeals,
          activeDeals: activeDeals,
          revenueBySource: sourceRevenueData
        },
        conversion: {
          conversionRate: Math.round(conversionRate * 100) / 100,
          winRate: Math.round(winRate * 100) / 100,
          totalLeads: totalLeads,
          convertedLeads: convertedLeads,
          avgSalesCycleDays: avgSalesCycleDays,
          avgResponseTimeHours: avgResponseTimeHours
        },
        activity: {
          totalCalls: totalCallLogs,
          totalTasks: totalTasks,
          completedTasks: completedTasks,
          taskCompletionRate: Math.round(taskCompletionRate * 100) / 100
        }
      }
    });
  } catch (error) {
    console.error("Get dashboard KPIs error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getLeadPipelineAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, assignedTo, sourceId } = req.query;
    
    let dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate as string);
    }

    const whereClause: any = { 
      isActive: true, 
      deletedAt: null,
      ...dateFilter
    };

    if (assignedTo) {
      whereClause.assignedTo = parseInt(assignedTo as string);
    }
    if (sourceId) {
      whereClause.sourceId = parseInt(sourceId as string);
    }

    // Pipeline stage analysis
    const pipelineData = await Promise.all([
      prisma.lead.count({ where: { ...whereClause, status: "NEW" } }),
      prisma.lead.count({ where: { ...whereClause, status: "CONTACTED" } }),
      prisma.lead.count({ where: { ...whereClause, status: "QUALIFIED" } }),
      prisma.lead.count({ where: { ...whereClause, status: "PROPOSAL" } }),
      prisma.lead.count({ where: { ...whereClause, status: "NEGOTIATION" } }),
      prisma.lead.count({ where: { ...whereClause, status: "CLOSED" } }),
      prisma.lead.count({ where: { ...whereClause, status: "LOST" } }),
    ]);

    const stages = [
      { name: "New", count: pipelineData[0], status: "NEW" },
      { name: "Contacted", count: pipelineData[1], status: "CONTACTED" },
      { name: "Qualified", count: pipelineData[2], status: "QUALIFIED" },
      { name: "Proposal", count: pipelineData[3], status: "PROPOSAL" },
      { name: "Negotiation", count: pipelineData[4], status: "NEGOTIATION" },
      { name: "Closed", count: pipelineData[5], status: "CLOSED" },
      { name: "Lost", count: pipelineData[6], status: "LOST" },
    ];

    // Calculate conversion rates between stages
    const totalLeads = pipelineData.reduce((sum, count) => sum + count, 0);
    const qualifiedRate = totalLeads > 0 ? (pipelineData[2] / totalLeads) * 100 : 0;
    const closedRate = totalLeads > 0 ? (pipelineData[5] / totalLeads) * 100 : 0;

    res.json({
      success: true,
      data: {
        stages,
        metrics: {
          totalLeads,
          qualificationRate: Math.round(qualifiedRate * 100) / 100,
          closedWinRate: Math.round(closedRate * 100) / 100,
        },
      },
    });
  } catch (error) {
    console.error("Get lead pipeline analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getLeadSourceAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, assignedTo } = req.query;
    
    let dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate as string);
    }

    const whereClause: any = { 
      isActive: true, 
      deletedAt: null,
      ...dateFilter
    };

    if (assignedTo) {
      whereClause.assignedTo = parseInt(assignedTo as string);
    }

    const sourceAnalytics = await prisma.leadSource.findMany({
      include: {
        _count: {
          select: {
            leads: {
              where: whereClause
            }
          }
        },
        leads: {
          where: {
            ...whereClause,
            status: "CLOSED"
          },
          select: { id: true }
        }
      },
      orderBy: {
        leads: {
          _count: 'desc'
        }
      }
    });

    // Also get leads without source
    const leadsWithoutSource = await prisma.lead.count({
      where: {
        ...whereClause,
        sourceId: null
      }
    });

    const closedLeadsWithoutSource = await prisma.lead.count({
      where: {
        ...whereClause,
        sourceId: null,
        status: "CLOSED"
      }
    });

    const sourceData = sourceAnalytics.map(source => ({
      id: source.id,
      name: source.name,
      totalLeads: source._count.leads,
      closedLeads: source.leads.length,
      conversionRate: source._count.leads > 0 
        ? Math.round((source.leads.length / source._count.leads) * 100 * 100) / 100
        : 0,
    }));

    // Add "No Source" data
    if (leadsWithoutSource > 0) {
      sourceData.push({
        id: 0,
        name: "No Source",
        totalLeads: leadsWithoutSource,
        closedLeads: closedLeadsWithoutSource,
        conversionRate: Math.round((closedLeadsWithoutSource / leadsWithoutSource) * 100 * 100) / 100,
      });
    }

    res.json({
      success: true,
      data: { sources: sourceData },
    });
  } catch (error) {
    console.error("Get lead source analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAgentPerformanceAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, sourceId } = req.query;
    
    let dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate as string);
    }

    const whereClause: any = { 
      isActive: true, 
      deletedAt: null,
      assignedTo: { not: null },
      ...dateFilter
    };

    if (sourceId) {
      whereClause.sourceId = parseInt(sourceId as string);
    }

    const agentPerformance = await prisma.user.findMany({
      where: {
        assignedLeads: {
          some: whereClause
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        _count: {
          select: {
            assignedLeads: {
              where: whereClause
            }
          }
        }
      }
    });

    // Get detailed performance data for each agent
    const detailedPerformance = await Promise.all(
      agentPerformance.map(async (agent) => {
        const [
          totalLeads,
          contactedLeads,
          qualifiedLeads,
          closedLeads,
          avgResponseTime,
          followUps,
          communications
        ] = await Promise.all([
          prisma.lead.count({
            where: { ...whereClause, assignedTo: agent.id }
          }),
          prisma.lead.count({
            where: { 
              ...whereClause, 
              assignedTo: agent.id, 
              status: { not: "NEW" }
            }
          }),
          prisma.lead.count({
            where: { 
              ...whereClause, 
              assignedTo: agent.id, 
              status: "QUALIFIED"
            }
          }),
          prisma.lead.count({
            where: { 
              ...whereClause, 
              assignedTo: agent.id, 
              status: "CLOSED"
            }
          }),
          // Calculate average response time (simplified)
          prisma.lead.aggregate({
            where: { 
              ...whereClause, 
              assignedTo: agent.id,
              lastContactedAt: { not: null }
            },
            _avg: {
              // This would need a computed field in practice
              // For now, return null
            }
          }),
          prisma.leadFollowUp.count({
            where: { 
              userId: agent.id,
              isCompleted: true,
              ...(startDate || endDate ? {
                completedAt: {
                  ...(startDate ? { gte: new Date(startDate as string) } : {}),
                  ...(endDate ? { lte: new Date(endDate as string) } : {})
                }
              } : {})
            }
          }),
          prisma.leadCommunication.count({
            where: { 
              userId: agent.id,
              ...(startDate || endDate ? {
                createdAt: {
                  ...(startDate ? { gte: new Date(startDate as string) } : {}),
                  ...(endDate ? { lte: new Date(endDate as string) } : {})
                }
              } : {})
            }
          })
        ]);

        const contactRate = totalLeads > 0 ? (contactedLeads / totalLeads) * 100 : 0;
        const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
        const closureRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

        return {
          agent: {
            id: agent.id,
            name: `${agent.firstName} ${agent.lastName}`,
            email: agent.email,
          },
          metrics: {
            totalLeads,
            contactedLeads,
            qualifiedLeads,
            closedLeads,
            contactRate: Math.round(contactRate * 100) / 100,
            qualificationRate: Math.round(qualificationRate * 100) / 100,
            closureRate: Math.round(closureRate * 100) / 100,
            followUpsCompleted: followUps,
            communicationsLogged: communications,
          },
        };
      })
    );

    // Sort by closure rate descending
    detailedPerformance.sort((a, b) => b.metrics.closureRate - a.metrics.closureRate);

    res.json({
      success: true,
      data: { agents: detailedPerformance },
    });
  } catch (error) {
    console.error("Get agent performance analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getLeadTrendAnalytics = async (req: Request, res: Response) => {
  try {
    const { period = "month", assignedTo, sourceId } = req.query;
    
    const now = new Date();
    let startDate: Date;
    let groupBy: string;

    switch (period) {
      case "week":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7 * 12);
        groupBy = "week";
        break;
      case "year":
        startDate = new Date(now.getFullYear() - 2, 0, 1);
        groupBy = "month";
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
        groupBy = "month";
    }

    const whereClause: any = { 
      isActive: true, 
      deletedAt: null,
      createdAt: { gte: startDate }
    };

    if (assignedTo) {
      whereClause.assignedTo = parseInt(assignedTo as string);
    }
    if (sourceId) {
      whereClause.sourceId = parseInt(sourceId as string);
    }

    // Get leads grouped by time period
    const leads = await prisma.lead.findMany({
      where: whereClause,
      select: {
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: "asc" }
    });

    // Group leads by period
    const trendsMap = new Map<string, { created: number; closed: number; lost: number }>();
    
    leads.forEach(lead => {
      const date = lead.createdAt;
      let key: string;
      
      if (period === "week") {
        const week = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        key = `Week ${week + 1}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!trendsMap.has(key)) {
        trendsMap.set(key, { created: 0, closed: 0, lost: 0 });
      }

      const data = trendsMap.get(key)!;
      data.created++;
      if (lead.status === "CLOSED") data.closed++;
      if (lead.status === "LOST") data.lost++;
    });

    const trends = Array.from(trendsMap.entries()).map(([period, data]) => ({
      period,
      created: data.created,
      closed: data.closed,
      lost: data.lost,
      conversionRate: data.created > 0 ? Math.round((data.closed / data.created) * 100 * 100) / 100 : 0,
    }));

    res.json({
      success: true,
      data: { trends },
    });
  } catch (error) {
    console.error("Get lead trend analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getLeadConversionFunnel = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, sourceId } = req.query;
    
    let dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate as string);
    }

    const whereClause: any = { 
      isActive: true, 
      deletedAt: null,
      ...dateFilter
    };

    if (sourceId) {
      whereClause.sourceId = parseInt(sourceId as string);
    }

    // Get funnel data - stages in order
    const funnelStages = [
      { name: "Total Leads", status: null },
      { name: "Contacted", status: ["CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CLOSED"] },
      { name: "Qualified", status: ["QUALIFIED", "PROPOSAL", "NEGOTIATION", "CLOSED"] },
      { name: "Proposal", status: ["PROPOSAL", "NEGOTIATION", "CLOSED"] },
      { name: "Negotiation", status: ["NEGOTIATION", "CLOSED"] },
      { name: "Closed Won", status: ["CLOSED"] },
    ];

    const funnelData = await Promise.all(
      funnelStages.map(async (stage) => {
        const count = await prisma.lead.count({
          where: {
            ...whereClause,
            ...(stage.status ? { status: { in: stage.status } } : {}),
          },
        });

        return {
          stage: stage.name,
          count,
          status: stage.status,
        };
      })
    );

    // Calculate conversion rates
    const totalLeads = funnelData[0].count;
    const funnelWithRates = funnelData.map((stage, index) => ({
      ...stage,
      conversionRate: totalLeads > 0 ? Math.round((stage.count / totalLeads) * 100 * 100) / 100 : 0,
      dropOffRate: index > 0 && funnelData[index - 1].count > 0 
        ? Math.round(((funnelData[index - 1].count - stage.count) / funnelData[index - 1].count) * 100 * 100) / 100
        : 0,
    }));

    res.json({
      success: true,
      data: { funnel: funnelWithRates },
    });
  } catch (error) {
    console.error("Get lead conversion funnel error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getLeadActivityReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, assignedTo, leadId } = req.query;
    
    let dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate as string);
    }

    const whereClause: any = dateFilter;

    if (assignedTo) {
      whereClause.userId = parseInt(assignedTo as string);
    }
    if (leadId) {
      whereClause.leadId = parseInt(leadId as string);
    }

    // Get follow-ups
    const followUps = await prisma.leadFollowUp.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get communications
    const communications = await prisma.leadCommunication.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Activity summary
    const activitySummary = {
      totalFollowUps: followUps.length,
      completedFollowUps: followUps.filter(f => f.isCompleted).length,
      totalCommunications: communications.length,
      callsCount: communications.filter(c => c.type === "CALL").length,
      emailsCount: communications.filter(c => c.type === "EMAIL").length,
      meetingsCount: communications.filter(c => c.type === "MEETING").length,
    };

    res.json({
      success: true,
      data: {
        summary: activitySummary,
        followUps: followUps.slice(0, 50), // Limit to recent 50
        communications: communications.slice(0, 50), // Limit to recent 50
      },
    });
  } catch (error) {
    console.error("Get lead activity report error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};