import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BulkImportService } from './bulk-import.service';
import { CreateLeadImportBatchDto } from './dto/create-lead-import-batch.dto';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('bulk-import')
export class BulkImportController {
  constructor(private readonly service: BulkImportService) { }

  @Post('leads')
  @RequirePermission('lead.import')
  createBatch(@Body() dto: CreateLeadImportBatchDto) {
    return this.service.createLeadBatch(dto);
  }

  @Get('leads/batches')
  @RequirePermission('lead.read')
  listBatches(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.listBatches({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Get('leads/batches/:id/records')
  @RequirePermission('lead.read')
  listRecords(@Param('id') id: string) {
    return this.service.listRecords(Number(id));
  }
}
