import { Body, Controller, Get, Post, Query, UseGuards, Param } from '@nestjs/common'; // <-- Param import kiya
import { AuthGuard } from '@nestjs/passport';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly service: ActivitiesService) {}

  @Get('recent')
  getRecent(@Query('limit') limit?: string) {
    return this.service.getRecent(
      limit ? parseInt(limit) : 5,
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
  ) {
    return this.service.list({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      type,
    });
  }

  @Post()
  create(@Body() dto: CreateActivityDto) {
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
}
