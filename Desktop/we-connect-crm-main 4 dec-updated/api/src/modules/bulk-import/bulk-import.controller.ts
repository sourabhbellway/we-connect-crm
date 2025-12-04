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

@UseGuards(AuthGuard('jwt'))
@Controller('bulk-import')
export class BulkImportController {
  constructor(private readonly service: BulkImportService) {}

  @Post('leads')
  createBatch(@Body() dto: CreateLeadImportBatchDto) {
    return this.service.createLeadBatch(dto);
  }

  @Get('leads/batches')
  listBatches(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.listBatches({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Get('leads/batches/:id/records')
  listRecords(@Param('id') id: string) {
    return this.service.listRecords(Number(id));
  }
}
