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

  /**
   * Retrieves a paginated list of leads.
   * Can filter by status, search term, and whether the lead is deleted (in trash).
   * @param page - Page number for pagination.
   * @param limit - Number of items per page.
   * @param status - Filter by lead status.
   * @param search - Search term to filter leads.
   * @param isDeleted - 'true' to fetch deleted leads, 'false' or undefined for active leads.
   */
  @Get()
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('isDeleted') isDeleted?: string, // Query parameter to filter by deletion status
  ) {
    // Convert string to boolean - handle 'true', 'True', 'TRUE', etc.
    const isDeletedBool = isDeleted !== undefined && String(isDeleted).toLowerCase().trim() === 'true';
    
    return this.leads.list({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      status,
      search,
      isDeleted: isDeletedBool,
    });
  }

  /**
   * Retrieves a single lead by its ID.
   * @param id - The ID of the lead to retrieve.
   */
  @Get(':id')
  get(@Param('id') id: string) {
    return this.leads.getById(Number(id));
  }

  /**
   * Creates a new lead.
   * @param dto - The data for the new lead.
   */
  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leads.create(dto);
  }

  /**
   * Updates an existing lead.
   * @param id - The ID of the lead to update.
   * @param dto - The data to update the lead with.
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leads.update(Number(id), dto);
  }

  /**
   * Soft-deletes a lead, moving it to the trash.
   * @param id - The ID of the lead to delete.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leads.remove(Number(id));
  }

  /**
   * Transfers a lead to another user.
   * @param id - The ID of the lead to transfer.
   * @param dto - The transfer details.
   */
  @Put(':id/transfer')
  transfer(@Param('id') id: string, @Body() dto: TransferLeadDto) {
    return this.leads.transfer(Number(id), dto);
  }

  /**
   * Assigns multiple leads to a user at once.
   * @param dto - The bulk assignment details.
   */
  @Put('bulk/assign')
  bulkAssign(@Body() dto: BulkAssignDto) {
    return this.leads.bulkAssign(dto);
  }

  /**
   * Converts a lead into a deal and/or company.
   * @param id - The ID of the lead to convert.
   * @param dto - The conversion details.
   */
  @Post(':id/convert')
  convert(@Param('id') id: string, @Body() dto: ConvertLeadDto) {
    return this.leads.convert(Number(id), dto);
  }

  /**
   * Reverts a lead conversion, restoring its previous status.
   * @param id - The ID of the lead to revert.
   */
  @Post(':id/undo-conversion')
  async undoConversion(@Param('id') id: string) {
    return this.leads.undoLeadConversion(Number(id));
  }

  /**
   * Restores a soft-deleted lead from the trash.
   * @param id - The ID of the lead to restore.
   */
  @Put(':id/restore')
  restore(@Param('id') id: string) {
    return this.leads.restore(Number(id));
  }
}