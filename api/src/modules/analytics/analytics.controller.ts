import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';
import { User } from '../../common/decorators/user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) { }

  @Get('dashboard/kpis')
  kpis(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
    @Query('scope') scope?: string,
    @User() user?: any,
  ) {
    const parsedUserId =
      userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
    const includeTeamData = scope === 'all';
    return this.service.kpis(startDate, endDate, parsedUserId, includeTeamData, user);
  }

  @Get('charts/lead-status-distribution')
  getLeadStatusDistribution(
    @Query('userId') userId?: string,
    @Query('scope') scope?: string,
    @User() user?: any,
  ) {
    const parsedUserId =
      userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
    const includeTeamData = scope === 'all';
    return this.service.getLeadStatusDistribution(parsedUserId, includeTeamData, user);
  }

  @Get('charts/revenue-trends')
  getRevenueTrends(
    @Query('months') months?: string,
    @Query('userId') userId?: string,
    @Query('scope') scope?: string,
    @User() user?: any,
  ) {
    const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 12;
    const parsedUserId =
      userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
    const includeTeamData = scope === 'all';
    return this.service.getRevenueTrends(parsedMonths, parsedUserId, includeTeamData, user);
  }

  @Get('charts/activity-trends')
  getActivityTrends(
    @Query('months') months?: string,
    @Query('userId') userId?: string,
    @Query('scope') scope?: string,
    @User() user?: any,
  ) {
    const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 12;
    const parsedUserId =
      userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
    const includeTeamData = scope === 'all';
    return this.service.getActivityTrends(parsedMonths, parsedUserId, includeTeamData, user);
  }

  @Get('charts/user-growth')
  getUserGrowth(@Query('months') months?: string) {
    const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 12;
    return this.service.getUserGrowth(parsedMonths);
  }

  @Get('charts/lead-conversion-funnel')
  getLeadConversionFunnel(
    @Query('userId') userId?: string,
    @Query('scope') scope?: string,
    @User() user?: any,
  ) {
    const parsedUserId =
      userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
    const includeTeamData = scope === 'all';
    return this.service.getLeadConversionFunnel(parsedUserId, includeTeamData, user);
  }

  @Get('charts/sales-pipeline-flow')
  getSalesPipelineFlow(
    @Query('months') months?: string,
    @Query('userId') userId?: string,
    @Query('scope') scope?: string,
    @User() user?: any,
  ) {
    const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 6;
    const parsedUserId =
      userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
    const includeTeamData = scope === 'all';
    return this.service.getSalesPipelineFlow(parsedMonths, parsedUserId, includeTeamData, user);
  }

  @Get('charts/top-performers')
  getTopPerformers(
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('scope') scope?: string,
    @User() user?: any,
  ) {
    const parsedLimit = limit && !isNaN(Number(limit)) ? Number(limit) : 5;
    const parsedUserId =
      userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
    const includeTeamData = scope === 'all';
    return this.service.getTopPerformers(parsedLimit, parsedUserId, includeTeamData, user);
  }

  @Get('charts/lead-velocity')
  getDealVelocity(
    @Query('months') months?: string,
    @Query('userId') userId?: string,
    @Query('scope') scope?: string,
    @User() user?: any,
  ) {
    const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 6;
    const parsedUserId =
      userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
    const includeTeamData = scope === 'all';
    return this.service.getDealVelocity(parsedMonths, parsedUserId, includeTeamData, user);
  }

  @Get('charts/lead-source-distribution')
  getLeadSourceDistribution(
    @Query('userId') userId?: string,
    @Query('scope') scope?: string,
    @User() user?: any,
  ) {
    const parsedUserId =
      userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
    const includeTeamData = scope === 'all';
    return this.service.getLeadSourceDistribution(parsedUserId, includeTeamData, user);
  }

  @Get('reports/task')
  getTaskReport(
    @Query('months') months?: string,
    @Query('userId') userId?: string,
    @Query('scope') scope?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('filters') filters?: string,
    @User() user?: any,
  ) {
    const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 6;
    const parsedUserId =
      userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
    const parsedPage = page && !isNaN(Number(page)) ? Number(page) : 1;
    const parsedLimit = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
    const parsedFilters = filters ? JSON.parse(filters) : undefined;
    return this.service.getTaskReport(parsedMonths, parsedUserId, scope as any, user, parsedPage, parsedLimit, parsedFilters);
  }

  @Get('reports/lead')
  getLeadReport(
    @Query('months') months?: string,
    @Query('userId') userId?: string,
    @Query('scope') scope?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('filters') filters?: string,
    @User() user?: any,
  ) {
    const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 6;
    const parsedUserId =
      userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
    const parsedPage = page && !isNaN(Number(page)) ? Number(page) : 1;
    const parsedLimit = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
    const parsedFilters = filters ? JSON.parse(filters) : undefined;
    return this.service.getLeadReport(parsedMonths, parsedUserId, scope as any, user, parsedPage, parsedLimit, parsedFilters);
  }

  @Get('reports/deal')
  getDealReport(
    @Query('months') months?: string,
    @Query('userId') userId?: string,
    @Query('scope') scope?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('filters') filters?: string,
    @User() user?: any,
  ) {
    const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 6;
    const parsedUserId =
      userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
    const parsedPage = page && !isNaN(Number(page)) ? Number(page) : 1;
    const parsedLimit = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
    const parsedFilters = filters ? JSON.parse(filters) : undefined;
    return this.service.getDealReport(parsedMonths, parsedUserId, scope as any, user, parsedPage, parsedLimit, parsedFilters);
  }

  @Get('reports/expense')
  getExpenseReport(
    @Query('months') months?: string,
    @Query('userId') userId?: string,
    @Query('scope') scope?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('filters') filters?: string,
    @User() user?: any,
  ) {
    const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 6;
    const parsedUserId =
      userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
    const parsedPage = page && !isNaN(Number(page)) ? Number(page) : 1;
    const parsedLimit = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
    const parsedFilters = filters ? JSON.parse(filters) : undefined;
    return this.service.getExpenseReport(parsedMonths, parsedUserId, scope as any, user, parsedPage, parsedLimit, parsedFilters);
  }

  @Get('reports/invoice')
  getInvoiceReport(
    @Query('months') months?: string,
    @Query('userId') userId?: string,
    @Query('scope') scope?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('filters') filters?: string,
    @User() user?: any,
  ) {
    const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 6;
    const parsedUserId =
      userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
    const parsedPage = page && !isNaN(Number(page)) ? Number(page) : 1;
    const parsedLimit = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
    const parsedFilters = filters ? JSON.parse(filters) : undefined;
    return this.service.getInvoiceReport(parsedMonths, parsedUserId, scope as any, user, parsedPage, parsedLimit, parsedFilters);
  }

  @Get('reports/quotation')
  getQuotationReport(
    @Query('months') months?: string,
    @Query('userId') userId?: string,
    @Query('scope') scope?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('filters') filters?: string,
    @User() user?: any,
  ) {
    const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 6;
    const parsedUserId =
      userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
    const parsedPage = page && !isNaN(Number(page)) ? Number(page) : 1;
    const parsedLimit = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
    const parsedFilters = filters ? JSON.parse(filters) : undefined;
    return this.service.getQuotationReport(parsedMonths, parsedUserId, scope as any, user, parsedPage, parsedLimit, parsedFilters);
  }
}
