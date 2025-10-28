import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('leadId') leadId?: string,
    @Query('dealId') dealId?: string,
    @Query('contactId') contactId?: string,
  ) {
    return this.service.list({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      status,
      search,
      leadId: leadId ? parseInt(leadId) : undefined,
      dealId: dealId ? parseInt(dealId) : undefined,
      contactId: contactId ? parseInt(contactId) : undefined,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) { return this.service.getById(Number(id)); }

  @Post()
  create(@Body() dto: CreateTaskDto) { return this.service.create(dto); }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) { return this.service.update(Number(id), dto); }

  @Put(':id/complete')
  complete(@Param('id') id: string) { return this.service.complete(Number(id)); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(Number(id)); }
}