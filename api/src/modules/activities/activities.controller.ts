import { Body, Controller, Get, Post, Query, UseGuards, Param } from '@nestjs/common'; // <-- Param import kiya
import { AuthGuard } from '@nestjs/passport';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { User } from '../../common/decorators/user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly service: ActivitiesService) { }

  @Get('recent')
  getRecent(
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @User() user?: any
  ) {
    return this.service.getRecent(
      limit ? parseInt(limit) : 5,
      user,
      userId ? parseInt(userId) : undefined
    );
  }

  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  @Get('deleted-data')
  getDeletedData(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getDeletedData({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Get()
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('userId') userId?: string,
    @User() user?: any,
  ) {
    return this.service.list({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      type,
      userId: userId ? parseInt(userId) : undefined,
    }, user);
  }

  @Post()
  create(@Body() dto: CreateActivityDto, @User() user?: any) {
    if (user?.userId) {
      dto.userId = user.userId;
    }
    return this.service.create(dto);
  }

  // --- NAYA CODE YAHAN SE START HAI ---

  /**
   * Fetches all activities associated with a specific lead.
   * URL: GET /activities/lead/:leadId
   */
  @Get('lead/:leadId')
  getActivitiesByLeadId(
    @Param('leadId') leadId: string, // URL se leadId nikalta hai
    @Query('page') page?: string, // Pagination ke liye optional query param
    @Query('limit') limit?: string, // Pagination ke liye optional query param
  ) {
    // Service ke naye method ko call kar raha hai
    // parseInt se string ko number mein convert kar raha hai
    return this.service.getActivitiesByLeadId(parseInt(leadId), {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  /**
   * Fetches activities within a date range for calendar display.
   * URL: GET /activities/calendar?startDate=2025-01-01&endDate=2025-01-31
   */
  @Get('calendar')
  getActivitiesForCalendar(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @User() user?: any,
  ) {
    return this.service.getActivitiesForCalendar({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    }, user);
  }
}
