import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { UpsertQuotationItemDto } from './dto/upsert-quotation-item.dto';
import { CreateQuotationItemDto } from './dto/create-quotation.dto';

const genNumber = (prefix: string) => `${prefix}-${Date.now()}`;

@Injectable()
export class QuotationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list({
    page = 1,
    limit = 10,
    search,
    status,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const where: any = { deletedAt: null };
    if (status) where.status = status.toUpperCase();
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { quotationNumber: { contains: q, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.quotation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      this.prisma.quotation.count({ where }),
    ]);
    return { success: true, data: { items, total, page, limit } };
  }

  async getById(id: number) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, deletedAt: null },
      include: { items: true },
    });
    if (!quotation) return { success: false, message: 'Quotation not found' };
    return { success: true, data: { quotation } };
  }

  private calcTotals(
    items: {
      quantity: number;
      unitPrice: number;
      taxRate?: number;
      discountRate?: number;
    }[],
  ) {
    const subtotal = items.reduce(
      (sum, it) => sum + Number(it.quantity) * Number(it.unitPrice),
      0,
    );
    const taxAmount = items.reduce(
      (sum, it) =>
        sum +
        (Number(it.quantity) * Number(it.unitPrice) * Number(it.taxRate ?? 0)) /
          100,
      0,
    );
    const discountAmount = items.reduce(
      (sum, it) =>
        sum +
        (Number(it.quantity) *
          Number(it.unitPrice) *
          Number(it.discountRate ?? 0)) /
          100,
      0,
    );
    const totalAmount = subtotal + taxAmount - discountAmount;
    return { subtotal, taxAmount, discountAmount, totalAmount };
  }

  async create(dto: CreateQuotationDto) {
    const totals = this.calcTotals(dto.items || []);
    const quotation = await this.prisma.quotation.create({
      data: {
        quotationNumber: dto.quotationNumber || genNumber('Q'),
        title: dto.title,
        description: dto.description ?? null,
        status: (dto.status as any) ?? 'DRAFT',
        subtotal: totals.subtotal as any,
        taxAmount: totals.taxAmount as any,
        discountAmount:
          (dto.discountAmount as any) ?? (totals.discountAmount as any),
        totalAmount: totals.totalAmount as any,
        currency: dto.currency ?? 'USD',
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        notes: dto.notes ?? null,
        terms: dto.terms ?? null,
        leadId: dto.leadId ?? null,
        dealId: dto.dealId ?? null,
        contactId: dto.contactId ?? null,
        createdBy: dto.createdBy ?? 1,
        items: {
          create: (dto.items || []).map((it, idx) => ({
            productId: it.productId ?? null,
            name: it.name,
            description: it.description ?? null,
            quantity: it.quantity as any,
            unit: it.unit ?? 'pcs',
            unitPrice: it.unitPrice as any,
            taxRate: (it.taxRate as any) ?? 0,
            discountRate: (it.discountRate as any) ?? 0,
            subtotal: (Number(it.quantity) * Number(it.unitPrice)) as any,
            totalAmount: (Number(it.quantity) *
              Number(it.unitPrice) *
              (1 + Number(it.taxRate ?? 0) / 100) *
              (1 - Number(it.discountRate ?? 0) / 100)) as any,
            sortOrder: idx,
          })),
        },
      },
      include: { items: true },
    });
    return { success: true, data: { quotation } };
  }

  async update(id: number, dto: UpdateQuotationDto) {
    const quotation = await this.prisma.quotation.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status as any,
        currency: dto.currency,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        notes: dto.notes,
        terms: dto.terms,
        leadId: dto.leadId ?? undefined,
        dealId: dto.dealId ?? undefined,
        contactId: dto.contactId ?? undefined,
        updatedAt: new Date(),
      },
      include: { items: true },
    });
    return { success: true, data: { quotation } };
  }

  async remove(id: number) {
    await this.prisma.quotation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  async addItem(id: number, dto: CreateQuotationItemDto) {
    const item = await this.prisma.quotationItem.create({
      data: {
        quotationId: id,
        productId: dto.productId ?? null,
        name: dto.name,
        description: dto.description ?? null,
        quantity: dto.quantity as any,
        unit: dto.unit ?? 'pcs',
        unitPrice: dto.unitPrice as any,
        taxRate: (dto.taxRate as any) ?? 0,
        discountRate: (dto.discountRate as any) ?? 0,
        subtotal: (Number(dto.quantity) * Number(dto.unitPrice)) as any,
        totalAmount: (Number(dto.quantity) *
          Number(dto.unitPrice) *
          (1 + Number(dto.taxRate ?? 0) / 100) *
          (1 - Number(dto.discountRate ?? 0) / 100)) as any,
      },
    });
    await this.recalcTotals(id);
    return { success: true, data: { item } };
  }

  async updateItem(itemId: number, dto: UpsertQuotationItemDto) {
    const item = await this.prisma.quotationItem.update({
      where: { id: itemId },
      data: {
        productId: dto.productId ?? undefined,
        name: dto.name,
        description: dto.description,
        quantity: dto.quantity as any,
        unit: dto.unit,
        unitPrice: dto.unitPrice as any,
        taxRate: dto.taxRate as any,
        discountRate: dto.discountRate as any,
        subtotal:
          dto.quantity !== undefined && dto.unitPrice !== undefined
            ? ((Number(dto.quantity) * Number(dto.unitPrice)) as any)
            : undefined,
        totalAmount:
          dto.quantity !== undefined && dto.unitPrice !== undefined
            ? ((Number(dto.quantity) *
                Number(dto.unitPrice) *
                (1 + Number(dto.taxRate ?? 0) / 100) *
                (1 - Number(dto.discountRate ?? 0) / 100)) as any)
            : undefined,
        updatedAt: new Date(),
      },
    });
    await this.recalcTotals(item.quotationId);
    return { success: true, data: { item } };
  }

  async removeItem(itemId: number) {
    const item = await this.prisma.quotationItem.delete({
      where: { id: itemId },
    });
    await this.recalcTotals(item.quotationId);
    return { success: true };
  }

  private async recalcTotals(quotationId: number) {
    const items = await this.prisma.quotationItem.findMany({
      where: { quotationId },
    });
    const totals = this.calcTotals(
      items.map((i) => ({
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        taxRate: Number(i.taxRate),
        discountRate: Number(i.discountRate),
      })),
    );
    await this.prisma.quotation.update({
      where: { id: quotationId },
      data: {
        subtotal: totals.subtotal as any,
        taxAmount: totals.taxAmount as any,
        discountAmount: totals.discountAmount as any,
        totalAmount: totals.totalAmount as any,
      },
    });
  }

  async markSent(id: number) {
    const quotation = await this.prisma.quotation.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date() },
    });
    return { success: true, data: { quotation } };
  }

  async markAccepted(id: number) {
    const quotation = await this.prisma.quotation.update({
      where: { id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    });
    return { success: true, data: { quotation } };
  }

  async markRejected(id: number) {
    const quotation = await this.prisma.quotation.update({
      where: { id },
      data: { status: 'REJECTED', rejectedAt: new Date() },
    });
    return { success: true, data: { quotation } };
  }

  async generateInvoice(id: number) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!quotation) return { success: false, message: 'Quotation not found' };
    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber: genNumber('INV'),
        title: quotation.title,
        description: quotation.description,
        status: 'DRAFT',
        subtotal: quotation.subtotal,
        taxAmount: quotation.taxAmount,
        discountAmount: quotation.discountAmount,
        totalAmount: quotation.totalAmount,
        currency: quotation.currency,
        dueDate: null,
        notes: quotation.notes,
        terms: quotation.terms,
        companyId: quotation.companyId,
        leadId: quotation.leadId,
        dealId: quotation.dealId,
        contactId: quotation.contactId,
        quotationId: quotation.id,
        createdBy: quotation.createdBy,
        items: {
          create: quotation.items.map((it) => ({
            productId: it.productId,
            name: it.name,
            description: it.description,
            quantity: it.quantity,
            unit: it.unit,
            unitPrice: it.unitPrice,
            taxRate: it.taxRate,
            discountRate: it.discountRate,
            subtotal: it.subtotal,
            totalAmount: it.totalAmount,
            sortOrder: it.sortOrder,
          })),
        },
      },
      include: { items: true },
    });
    return { success: true, data: { invoice } };
  }
}
