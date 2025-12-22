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
import { User } from '../../common/decorators/user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TasksController {
  constructor(private readonly service: TasksService) { }

  @Get()
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    // Direct filters
    @Query('leadId') leadId?: string,
    @Query('dealId') dealId?: string,

    // Back-compat params used by client
    @Query('entityType') entityType?: 'lead' | 'deal' | 'company',
    @Query('entityId') entityId?: string,
    @Query('assignedTo') assignedTo?: string,
    @User() user?: any,
  ) {
    // Map entityType/entityId to specific relation IDs
    let lead = leadId ? parseInt(leadId) : undefined;
    let deal = dealId ? parseInt(dealId) : undefined;

    if (!lead && !deal && entityType && entityId) {
      const idNum = parseInt(entityId);
      if (entityType === 'lead') lead = idNum;
      if (entityType === 'deal') deal = idNum;

    }

    return this.service.list({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      status,
      search,
      leadId: lead,
      dealId: deal,

      assignedTo: assignedTo ? parseInt(assignedTo) : undefined,
    }, user);
  }

  @Get(':id')
  get(@Param('id') id: string, @User() user?: any) {
    return this.service.getById(Number(id), user);
  }

  @Post()
  create(@Body() dto: CreateTaskDto, @User() user?: any) {
    // Back-compat: allow { entityType, entityId } in body and map to specific IDs
    const mapped: any = { ...dto } as any;
    const et = (mapped.entityType as string | undefined)?.toLowerCase();
    if (mapped.entityId && et) {
      const idNum = Number(mapped.entityId);
      if (et === 'lead') mapped.leadId = idNum;
      if (et === 'deal') mapped.dealId = idNum;

      delete mapped.entityType;
      delete mapped.entityId;
    }

    // Ensure createdBy is set from authenticated user
    if (user?.userId) {
      mapped.createdBy = user.userId;
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
