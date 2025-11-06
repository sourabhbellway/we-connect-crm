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

@UseGuards(AuthGuard('jwt'))
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly service: ExpensesService) {}

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
    });
  }

  @Get('stats')
  getStats(@Query('userId') userId?: string) {
    return this.service.getStats(userId ? parseInt(userId) : undefined);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getById(Number(id));
  }

  @Post()
  create(@Body() dto: CreateExpenseDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.service.update(Number(id), dto);
  }

  @Put(':id/approve')
  approve(@Param('id') id: string, @Body() dto: ApproveExpenseDto) {
    return this.service.approve(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
