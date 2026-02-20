import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { UpsertInvoiceItemDto } from './dto/upsert-invoice-item.dto';
import { CreateInvoiceItemDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { User } from '../../common/decorators/user.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly service: InvoicesService) { }

  @Get()
  @RequirePermission('invoices.read')
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @User() user?: any,
  ) {
    return this.service.list(
      {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        search,
        status,
        entityType,
        entityId,
      },
      user,
    );
  }

  @Get('next-number')
  @RequirePermission('invoices.read')
  getNextNumber() {
    return this.service.getNextNumber();
  }

  @Get(':id/pdf/preview')
  @RequirePermission('invoices.read')
  async previewPdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename } = await this.service.buildPdf(Number(id));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.send(buffer);
  }

  @Get(':id/pdf/download')
  @RequirePermission('invoices.read')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename } = await this.service.buildPdf(Number(id));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get(':id')
  @RequirePermission('invoices.read')
  get(@Param('id') id: string, @User() user?: any) {
    return this.service.getById(Number(id), user);
  }

  @Post()
  @RequirePermission('invoices.create')
  create(@Body() dto: CreateInvoiceDto, @User() user?: any) {
    if (user?.userId) {
      dto.createdBy = user.userId;
    }
    return this.service.create(dto);
  }

  @Put(':id')
  @RequirePermission('invoices.update')
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @RequirePermission('invoices.delete')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }

  @Post(':id/items')
  @RequirePermission('invoices.update')
  addItem(@Param('id') id: string, @Body() dto: CreateInvoiceItemDto) {
    return this.service.addItem(Number(id), dto);
  }

  @Put('items/:itemId')
  @RequirePermission('invoices.update')
  updateItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpsertInvoiceItemDto,
  ) {
    return this.service.updateItem(Number(itemId), dto);
  }

  @Delete('items/:itemId')
  @RequirePermission('invoices.update')
  removeItem(@Param('itemId') itemId: string) {
    return this.service.removeItem(Number(itemId));
  }

  @Put(':id/send')
  @RequirePermission('invoices.update')
  send(@Param('id') id: string) {
    return this.service.markSent(Number(id));
  }

  @Post(':id/payments')
  @RequirePermission('invoices.update')
  recordPayment(@Param('id') id: string, @Body() dto: RecordPaymentDto) {
    return this.service.recordPayment(Number(id), dto);
  }
}
