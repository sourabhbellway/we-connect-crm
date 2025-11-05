import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { UpsertInvoiceItemDto } from './dto/upsert-invoice-item.dto';
import { CreateInvoiceItemDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';

const genNumber = (prefix: string) => `${prefix}-${Date.now()}`;

@Injectable()
export class InvoicesService {
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
        { invoiceNumber: { contains: q, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true, payments: true },
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return { success: true, data: { items, total, page, limit } };
  }

  async getById(id: number) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, deletedAt: null },
      include: { items: true, payments: true },
    });
    if (!invoice) return { success: false, message: 'Invoice not found' };
    return { success: true, data: { invoice } };
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

  async create(dto: CreateInvoiceDto) {
    const totals = this.calcTotals(dto.items || []);
    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber: dto.invoiceNumber || genNumber('INV'),
        title: dto.title,
        description: dto.description ?? null,
        status: (dto.status as any) ?? 'DRAFT',
        subtotal: totals.subtotal as any,
        taxAmount: totals.taxAmount as any,
        discountAmount:
          (dto.discountAmount as any) ?? (totals.discountAmount as any),
        totalAmount: totals.totalAmount as any,
        currency: dto.currency ?? 'USD',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        notes: dto.notes ?? null,
        terms: dto.terms ?? null,
        leadId: dto.leadId ?? null,
        dealId: dto.dealId ?? null,
     
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
    return { success: true, data: { invoice } };
  }

  async update(id: number, dto: UpdateInvoiceDto) {
    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status as any,
        currency: dto.currency,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
        terms: dto.terms,
        leadId: dto.leadId ?? undefined,
        dealId: dto.dealId ?? undefined,
  
        updatedAt: new Date(),
      },
      include: { items: true },
    });
    return { success: true, data: { invoice } };
  }

  async remove(id: number) {
    await this.prisma.invoice.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  async addItem(id: number, dto: CreateInvoiceItemDto) {
    const item = await this.prisma.invoiceItem.create({
      data: {
        invoiceId: id,
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

  async updateItem(itemId: number, dto: UpsertInvoiceItemDto) {
    const item = await this.prisma.invoiceItem.update({
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
    await this.recalcTotals(item.invoiceId);
    return { success: true, data: { item } };
  }

  async removeItem(itemId: number) {
    const item = await this.prisma.invoiceItem.delete({
      where: { id: itemId },
    });
    await this.recalcTotals(item.invoiceId);
    return { success: true };
  }

  private async recalcTotals(invoiceId: number) {
    const items = await this.prisma.invoiceItem.findMany({
      where: { invoiceId },
    });
    const totals = this.calcTotals(
      items.map((i) => ({
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        taxRate: Number(i.taxRate),
        discountRate: Number(i.discountRate),
      })),
    );
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        subtotal: totals.subtotal as any,
        taxAmount: totals.taxAmount as any,
        discountAmount: totals.discountAmount as any,
        totalAmount: totals.totalAmount as any,
      },
    });
  }

  async markSent(id: number) {
    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date() },
    });
    return { success: true, data: { invoice } };
  }

  async recordPayment(id: number, dto: RecordPaymentDto) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return { success: false, message: 'Invoice not found' };
    const payment = await this.prisma.payment.create({
      data: {
        invoiceId: id,
        amount: dto.amount as any,
        currency: dto.currency ?? invoice.currency,
        paymentMethod: dto.paymentMethod,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
        referenceNumber: dto.referenceNumber ?? null,
        notes: dto.notes ?? null,
        createdBy: dto.createdBy ?? 1,
      },
    });
    const paidAgg = await this.prisma.payment.aggregate({
      _sum: { amount: true },
      where: { invoiceId: id },
    });
    const paidAmount = Number(paidAgg._sum.amount ?? 0);
    let status: any = invoice.status;
    if (paidAmount <= 0) status = 'SENT';
    else if (paidAmount < Number(invoice.totalAmount))
      status = 'PARTIALLY_PAID';
    else status = 'PAID';
    await this.prisma.invoice.update({
      where: { id },
      data: {
        paidAmount: paidAmount as any,
        status,
        paidAt: status === 'PAID' ? new Date() : undefined,
      },
    });
    return { success: true, data: { payment } };
  }
}
