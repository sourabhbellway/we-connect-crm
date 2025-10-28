import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly service: ActivitiesService) {}

  @Get()
  list(@Query('page') page?: string, @Query('limit') limit?: string, @Query('type') type?: string) {
    return this.service.list({ page: page ? parseInt(page) : 1, limit: limit ? parseInt(limit) : 10, type });
  }

  @Post()
  create(@Body() dto: CreateActivityDto) { return this.service.create(dto); }
}