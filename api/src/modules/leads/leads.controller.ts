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
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { TransferLeadDto } from './dto/transfer-lead.dto';
import { BulkAssignDto } from './dto/bulk-assign.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Get('stats')
  getStats() {
    return this.leads.getStats();
  }

  @Get()
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.leads.list({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      status,
      search,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.leads.getById(Number(id));
  }

  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leads.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leads.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leads.remove(Number(id));
  }

  @Put(':id/transfer')
  transfer(@Param('id') id: string, @Body() dto: TransferLeadDto) {
    return this.leads.transfer(Number(id), dto);
  }

  @Put('bulk/assign')
  bulkAssign(@Body() dto: BulkAssignDto) {
    return this.leads.bulkAssign(dto);
  }

  @Post(':id/convert')
  convert(@Param('id') id: string, @Body() dto: ConvertLeadDto) {
    return this.leads.convert(Number(id), dto);
  }
}
