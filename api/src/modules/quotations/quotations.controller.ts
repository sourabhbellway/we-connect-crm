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
import { QuotationsService } from './quotations.service';
import type { Response } from 'express';
import { Res } from '@nestjs/common';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { UpsertQuotationItemDto } from './dto/upsert-quotation-item.dto';
import { CreateQuotationItemDto } from './dto/create-quotation.dto';
import { User } from '../../common/decorators/user.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly service: QuotationsService) { }

  @Get('template')
  @RequirePermission('quotations.read')
  getTemplate() {
    return this.service.getTemplate();
  }

  @Get('next-number')
  @RequirePermission('quotations.read')
  getNextNumber() {
    return this.service.getNextNumber();
  }

  @Get()
  @RequirePermission('quotations.read')
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

  @Get(':id')
  @RequirePermission('quotations.read')
  get(@Param('id') id: string, @User() user?: any) {
    return this.service.getById(Number(id), user);
  }

  @Post()
  @RequirePermission('quotations.create')
  create(@Body() body: any, @User() user?: any) {
    console.log('QuotationsController.create called with body:', body);

    // Normalize payloads from different client forms
    const normalizeStatus = (s?: string) =>
      s ? String(s).toUpperCase() : undefined;

    const items = Array.isArray(body.items)
      ? body.items.map((it: any) => ({
        productId: it.productId ? Number(it.productId) : undefined,
        name: it.name ?? it.description ?? 'Item',
        description: it.longDescription ?? it.description ?? undefined,
        quantity: Number(it.quantity ?? 1),
        unit: it.unit ?? 'pcs',
        unitPrice: Number(it.unitPrice ?? it.rate ?? 0),
        taxRate: it.taxRate !== undefined ? Number(it.taxRate) : undefined,
        discountRate:
          it.discountRate !== undefined
            ? Number(it.discountRate)
            : body.discountType === '%'
              ? Number(body.discountValue || 0)
              : undefined,
      }))
      : [];

    const payload: CreateQuotationDto = {
      quotationNumber: body.quotationNumber,
      title: body.title ?? body.subject,
      description: body.description ?? undefined,
      status: normalizeStatus(body.status),
      discountAmount:
        body.discountType && body.discountType !== '%'
          ? Number(body.discountValue || 0)
          : undefined,
      currency: body.currency,
      validUntil: body.validUntil ?? body.openTill,
      notes: body.notes,
      terms: body.terms,
      companyId: body.companyId ? Number(body.companyId) : undefined,
      leadId:
        body.relatedType === 'lead' && body.relatedId
          ? Number(body.relatedId)
          : body.leadId
            ? Number(body.leadId)
            : undefined,
      dealId: body.dealId ? Number(body.dealId) : undefined,
      contactId:
        body.relatedType === 'contact' && body.relatedId
          ? Number(body.relatedId)
          : body.contactId
            ? Number(body.contactId)
            : undefined,
      createdBy:
        (user?.userId ? Number(user.userId) : undefined) ||
        (body.createdBy ? Number(body.createdBy) : undefined),
      items,
    } as CreateQuotationDto;

    console.log('Normalized payload:', payload);

    return this.service.create(payload);
  }

  @Put(':id')
  @RequirePermission('quotations.update')
  update(@Param('id') id: string, @Body() dto: UpdateQuotationDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @RequirePermission('quotations.delete')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }

  @Post(':id/items')
  @RequirePermission('quotations.update')
  addItem(@Param('id') id: string, @Body() dto: CreateQuotationItemDto) {
    return this.service.addItem(Number(id), dto);
  }

  @Put('items/:itemId')
  @RequirePermission('quotations.update')
  updateItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpsertQuotationItemDto,
  ) {
    return this.service.updateItem(Number(itemId), dto);
  }

  @Delete('items/:itemId')
  @RequirePermission('quotations.update')
  removeItem(@Param('itemId') itemId: string) {
    return this.service.removeItem(Number(itemId));
  }

  @Put(':id/send')
  @RequirePermission('quotations.update')
  send(@Param('id') id: string) {
    return this.service.markSent(Number(id));
  }

  @Put(':id/accept')
  @RequirePermission('quotations.update')
  accept(@Param('id') id: string) {
    return this.service.markAccepted(Number(id));
  }

  @Put(':id/reject')
  @RequirePermission('quotations.update')
  reject(@Param('id') id: string) {
    return this.service.markRejected(Number(id));
  }

  @Post(':id/generate-invoice')
  @RequirePermission('invoices.create')
  generateInvoice(@Param('id') id: string) {
    return this.service.generateInvoice(Number(id));
  }

  @Get(':id/pdf/preview')
  @RequirePermission('quotations.read')
  async previewPdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename } = await this.service.buildPdf(Number(id));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.send(buffer);
  }

  @Get(':id/pdf/download')
  @RequirePermission('quotations.read')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename } = await this.service.buildPdf(Number(id));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
