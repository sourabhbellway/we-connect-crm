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

@UseGuards(AuthGuard('jwt'))
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly service: QuotationsService) { }

  @Get('template')
  getTemplate() {
    return this.service.getTemplate();
  }

  @Get('next-number')
  getNextNumber() {
    return this.service.getNextNumber();
  }

  @Get()
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @User() user?: any,
  ) {
    return this.service.list({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
      status,
      entityType,
      entityId,
    }, user);
  }

  @Get(':id')
  get(@Param('id') id: string, @User() user?: any) {
    return this.service.getById(Number(id), user);
  }

  @Post()
  create(@Body() body: any, @User() user?: any) {
    console.log('QuotationsController.create called with body:', body);

    // Normalize payloads from different client forms
    const normalizeStatus = (s?: string) => (s ? String(s).toUpperCase() : undefined);

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
      leadId: body.relatedType === 'lead' && body.relatedId ? Number(body.relatedId) : (body.leadId ? Number(body.leadId) : undefined),
      dealId: body.dealId ? Number(body.dealId) : undefined,
      contactId: body.relatedType === 'contact' && body.relatedId ? Number(body.relatedId) : (body.contactId ? Number(body.contactId) : undefined),
      createdBy: (user?.userId ? Number(user.userId) : undefined) || (body.createdBy ? Number(body.createdBy) : undefined),
      items,
    } as CreateQuotationDto;

    console.log('Normalized payload:', payload);

    return this.service.create(payload);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQuotationDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: CreateQuotationItemDto) {
    return this.service.addItem(Number(id), dto);
  }

  @Put('items/:itemId')
  updateItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpsertQuotationItemDto,
  ) {
    return this.service.updateItem(Number(itemId), dto);
  }

  @Delete('items/:itemId')
  removeItem(@Param('itemId') itemId: string) {
    return this.service.removeItem(Number(itemId));
  }

  @Put(':id/send')
  send(@Param('id') id: string) {
    return this.service.markSent(Number(id));
  }

  @Put(':id/accept')
  accept(@Param('id') id: string) {
    return this.service.markAccepted(Number(id));
  }

  @Put(':id/reject')
  reject(@Param('id') id: string) {
    return this.service.markRejected(Number(id));
  }

  @Post(':id/generate-invoice')
  generateInvoice(@Param('id') id: string) {
    return this.service.generateInvoice(Number(id));
  }

  @Get(':id/pdf/preview')
  async previewPdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename } = await this.service.buildPdf(Number(id));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.send(buffer);
  }

  @Get(':id/pdf/download')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename } = await this.service.buildPdf(Number(id));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
