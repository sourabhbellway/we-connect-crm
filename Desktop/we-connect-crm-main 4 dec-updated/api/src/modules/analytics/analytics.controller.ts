import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';

@UseGuards(AuthGuard('jwt'))
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('dashboard/kpis')
  kpis(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
    @Query('scope') scope?: string,
  ) {
    const parsedUserId =
      userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
    const includeTeamData = scope === 'all';
    return this.service.kpis(startDate, endDate, parsedUserId, includeTeamData);
  }
}
