import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
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
    // Direct filters
    @Query('leadId') leadId?: string,
    @Query('dealId') dealId?: string,
    @Query('contactId') contactId?: string,
    // Back-compat params used by client
    @Query('entityType') entityType?: 'lead' | 'deal' | 'contact' | 'company',
    @Query('entityId') entityId?: string,
    @Query('assignedTo') assignedTo?: string,
  ) {
    // Map entityType/entityId to specific relation IDs
    let lead = leadId ? parseInt(leadId) : undefined;
    let deal = dealId ? parseInt(dealId) : undefined;
    let contact = contactId ? parseInt(contactId) : undefined;
    if (!lead && !deal && !contact && entityType && entityId) {
      const idNum = parseInt(entityId);
      if (entityType === 'lead') lead = idNum;
      if (entityType === 'deal') deal = idNum;
      if (entityType === 'contact') contact = idNum;
    }

    return this.service.list({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      status,
      search,
      leadId: lead,
      dealId: deal,
      contactId: contact,
      assignedTo: assignedTo ? parseInt(assignedTo) : undefined,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getById(Number(id));
  }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    // Back-compat: allow { entityType, entityId } in body and map to specific IDs
    const mapped: any = { ...dto } as any;
    const et = (mapped.entityType as string | undefined)?.toLowerCase();
    if (mapped.entityId && et) {
      const idNum = Number(mapped.entityId);
      if (et === 'lead') mapped.leadId = idNum;
      if (et === 'deal') mapped.dealId = idNum;
      if (et === 'contact') mapped.contactId = idNum;
      delete mapped.entityType;
      delete mapped.entityId;
    }
    return this.service.create(mapped);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.service.update(Number(id), dto);
  }

  @Put(':id/complete')
  complete(@Param('id') id: string) {
    return this.service.complete(Number(id));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
