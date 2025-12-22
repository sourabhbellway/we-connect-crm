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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { TransferLeadDto } from './dto/transfer-lead.dto';
import { BulkAssignDto } from './dto/bulk-assign.dto';
import { User } from '../../common/decorators/user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) { }

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
    @Query('assignedTo') assignedTo?: string,
    @User() user?: any,
  ) {
    // Convert string to boolean - handle 'true', 'True', 'TRUE', etc.
    const isDeletedBool = isDeleted !== undefined && String(isDeleted).toLowerCase().trim() === 'true';

    return this.leads.list({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      status,
      search,
      isDeleted: isDeletedBool,
      assignedTo: assignedTo ? parseInt(assignedTo) : undefined,
    }, user);
  }

  /**
   * Retrieves a single lead by its ID.
   * @param id - The ID of the lead to retrieve.
   */
  @Get(':id')
  get(@Param('id') id: string, @User() user?: any) {
    return this.leads.getById(Number(id), user);
  }

  /**
   * Creates a new lead.
   * @param dto - The data for the new lead.
   */
  @Post()
  create(@Body() dto: CreateLeadDto, @User() user?: any) {
    return this.leads.create(dto, user?.userId);
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

  @Delete(':id/permanent')
  deletePermanently(@Param('id') id: string) {
    return this.leads.deletePermanently(Number(id));
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

  /**
   * Bulk import leads from a CSV file.
   * @param file - The CSV file to import.
   */
  @Post('bulk/import')
  @UseInterceptors(FileInterceptor('csvFile', {
    fileFilter: (req, file, cb) => {
      if (!file.originalname.endsWith('.csv')) {
        return cb(new BadRequestException('Only CSV files are allowed'), false);
      }
      cb(null, true);
    },
  }))
  async bulkImportLeads(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }
    return this.leads.bulkImportFromCsv(file);
  }

  /**
   * Export leads as CSV for Excel consumption
   */
  @Get('bulk/export')
  async bulkExport(
    @Res() res: Response,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const csv = await this.leads.bulkExport({ status, search });
    const filename = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
    // Prepend UTF-8 BOM so Excel recognizes UTF-8 encoding
    const bom = '\uFEFF';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(bom + csv, 'utf8'));
  }

  /**
   * Sync all integrations to import leads from third-party services
   */
  @Post('integrations/sync-all')
  syncAllIntegrations() {
    return this.leads.syncAllIntegrations();
  }
}