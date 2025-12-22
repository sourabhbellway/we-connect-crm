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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ApproveExpenseDto } from './dto/approve-expense.dto';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { User } from '../../common/decorators/user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly service: ExpensesService) { }

  @Get()
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('submittedBy') submittedBy?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
    @Query('projectId') projectId?: string,
    @Query('dealId') dealId?: string,
    @Query('leadId') leadId?: string,
    @Query('currency') currency?: string,
    @User() user?: any,
  ) {
    return this.service.list({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      status,
      search,
      submittedBy: submittedBy ? parseInt(submittedBy) : undefined,
      startDate,
      endDate,
      type,
      projectId: projectId ? parseInt(projectId) : undefined,
      dealId: dealId ? parseInt(dealId) : undefined,
      leadId: leadId ? parseInt(leadId) : undefined,
      currency,
    }, user);
  }

  @Get('stats')
  getStats(@Query('userId') userId?: string) {
    return this.service.getStats(userId ? parseInt(userId) : undefined);
  }


  @Get(':id')
  get(@Param('id') id: string, @User() user?: any) {
    return this.service.getById(Number(id), user);
  }

  @Post()
  create(@Body() dto: CreateExpenseDto, @User() user?: any) {
    if (user?.userId) {
      dto.submittedBy = user.userId;
    }
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermission('expense.update')
  update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.service.update(Number(id), dto);
  }

  @Put(':id/approve')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermission('expense.approve')
  approve(@Param('id') id: string, @Body() dto: ApproveExpenseDto) {
    return this.service.approve(Number(id), dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermission('expense.delete')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
