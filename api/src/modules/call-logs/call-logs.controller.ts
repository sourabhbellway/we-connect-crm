import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CallLogsService } from './call-logs.service';
import { CreateCallLogDto } from './dto/create-call-log.dto';
import { UpdateCallLogDto } from './dto/update-call-log.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('call-logs')
export class CallLogsController {
  constructor(private readonly service: CallLogsService) {}

  @Get()
  list(@Query('leadId') leadId?: string, @Query('userId') userId?: string) {
    return this.service.list({ leadId: leadId ? parseInt(leadId) : undefined, userId: userId ? parseInt(userId) : undefined });
  }

  @Get(':id')
  get(@Param('id') id: string) { return this.service.getById(Number(id)); }

  @Post()
  create(@Body() dto: CreateCallLogDto) { return this.service.create(dto); }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCallLogDto) { return this.service.update(Number(id), dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(Number(id)); }
}