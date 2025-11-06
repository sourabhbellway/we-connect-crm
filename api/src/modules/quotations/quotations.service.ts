import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { PrismaService } from '../../database/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { UpsertQuotationItemDto } from './dto/upsert-quotation-item.dto';
import { CreateQuotationItemDto } from './dto/create-quotation.dto';

const pad = (num: number, size: number) => String(num).padStart(size, '0');

@Injectable()
export class QuotationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTemplate() {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });
    return { success: true, data: { users } };
  }

  async list({
    page = 1,
    limit = 10,
    search,
    status,
    entityType,
    entityId,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    entityType?: string;
    entityId?: string;
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
    // Filter by entity type and ID
    if (entityType && entityId) {
      const id = Number(entityId);
      if (entityType.toLowerCase() === 'lead') {
        where.leadId = id;
      } else if (entityType.toLowerCase() === 'deal') {
        where.dealId = id;
      } else if (entityType.toLowerCase() === 'contact') {
        // Note: contacts might not have direct relation, adjust if needed
      }
    }
    const [items, total] = await Promise.all([
      this.prisma.quotation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { 
          items: true,
          lead: {
            select: { id: true, firstName: true, lastName: true, email: true, company: true },
          },
          deal: {
            select: { id: true, title: true },
          },
        },
      }),
      this.prisma.quotation.count({ where }),
    ]);
    return { success: true, data: { items, total, page, limit } };
  }

  async getById(id: number) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, deletedAt: null },
      include: { items: true, lead: true, deal: true, companies: true },
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
    // Pre-create quotation to get ID
    const created = await this.prisma.quotation.create({
      data: {
        quotationNumber: dto.quotationNumber || 'PENDING',
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
        companyId: dto.companyId ?? null,
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

    // Load business settings for prefix/pad and default terms
    const bs = await this.prisma.businessSettings.findFirst();
    let ext: any = {};
    try { ext = bs?.description ? JSON.parse(bs.description) : {}; } catch {}
    const prefix = (ext.quotePrefix ?? 'Q-') as string;
    const width = Number(ext.quotePad ?? 6);
    const number = dto.quotationNumber || `${prefix}${pad(created.id, width)}`;
    const termsFinal = created.terms ?? ext.defaultTerms ?? '';

    const quotation = await this.prisma.quotation.update({
      where: { id: created.id },
      data: { quotationNumber: number, terms: termsFinal },
      include: { items: true },
    });

    // Create activity for quotation creation
    if (quotation.leadId) {
      try {
        await this.prisma.activity.create({
          data: {
            title: 'Quotation created',
            description: `Quotation "${quotation.quotationNumber}" created with total amount ${quotation.currency} ${Number(quotation.totalAmount).toFixed(2)}`,
            type: 'COMMUNICATION_LOGGED' as any,
            icon: 'FileText',
            iconColor: '#10B981',
            metadata: {
              quotationId: quotation.id,
              quotationNumber: quotation.quotationNumber,
              totalAmount: quotation.totalAmount,
              currency: quotation.currency,
            } as any,
            userId: quotation.createdBy,
            leadId: quotation.leadId,
          },
        });
      } catch (error) {
        console.error('Error creating quotation activity:', error);
      }
    }

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
        companyId: dto.companyId ?? undefined,
        updatedAt: new Date(),
      },
      include: { items: true },
    });

    // Create activity for quotation update
    if (quotation.leadId) {
      try {
        await this.prisma.activity.create({
          data: {
            title: 'Quotation updated',
            description: `Quotation "${quotation.quotationNumber}" updated. Status: ${quotation.status}`,
            type: 'COMMUNICATION_LOGGED' as any,
            icon: 'Edit',
            iconColor: '#F59E0B',
            metadata: {
              quotationId: quotation.id,
              quotationNumber: quotation.quotationNumber,
              status: quotation.status,
            } as any,
            userId: quotation.createdBy,
            leadId: quotation.leadId,
          },
        });
      } catch (error) {
        console.error('Error creating quotation update activity:', error);
      }
    }

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

  async buildPdf(id: number): Promise<{ buffer: Buffer; filename: string }> {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, deletedAt: null },
      include: {
        items: true,
        lead: true,
        deal: true,
        companies: true,
      },
    });
    if (!quotation) throw new Error('Quotation not found');

    // Define customerName and customerEmail based on lead or companies
    const customerName = quotation.lead
      ? `${quotation.lead.firstName || ''} ${quotation.lead.lastName || ''}`.trim()
      : quotation.companies
      ? quotation.companies.name
      : 'N/A';

    const customerEmail = quotation.lead?.email || quotation.companies?.email || '';

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));

    // Business settings
    const bs = await this.prisma.businessSettings.findFirst();
    const companyName = bs?.companyName || 'Your Company';
    const companyAddress = bs?.companyAddress || '';
    const companyEmail = bs?.companyEmail || '';
    const companyPhone = bs?.companyPhone || '';

    // Header
    try {
      if (bs?.companyLogo) {
        // Attempt to draw logo if accessible on disk
        doc.image(bs.companyLogo, 50, 40, { width: 120 }).moveDown();
      }
    } catch {}

    doc
      .fontSize(16)
      .fillColor('#111827')
      .text(companyName, 50, 50, { align: 'left' });
    if (companyAddress) doc.fontSize(10).fillColor('#374151').text(companyAddress);
    if (companyEmail || companyPhone) doc.fontSize(10).fillColor('#374151').text([companyEmail, companyPhone].filter(Boolean).join(' • '));

    doc
      .fontSize(22)
      .fillColor('#111827')
      .text('Quotation', 0, 50, { align: 'right' })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .fillColor('#374151')
      .text(`Quotation No: ${quotation.quotationNumber}`, { align: 'right' })
      .text(`Date: ${new Date(quotation.createdAt).toLocaleDateString()}`, { align: 'right' })
      .text(`Status: ${quotation.status}`, { align: 'right' })
      .moveDown();

    // Bill To
  
    // Helpers
    const primary = '#EF444E';
    const light = '#F3F4F6';
    const textDark = '#111827';
    const textMuted = '#374151';

    const drawCard = (x: number, y: number, w: number, h: number, title: string, lines: string[]) => {
      doc.save();
      doc.roundedRect(x, y, w, h, 8).fill(light).stroke();
      doc.fillColor(textDark).fontSize(12).text(title, x + 12, y + 10);
      doc.fillColor(textMuted).fontSize(10);
      let yy = y + 28;
      lines.filter(Boolean).slice(0, 5).forEach((ln) => {
        doc.text(ln, x + 12, yy, { width: w - 24 });
        yy += 14;
      });
      doc.restore();
    };

    const amountInWordsIndian = (num: number) => {
      const ones = ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
      const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
      const toWords = (n: number): string => {
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n/10)] + (n%10? ' ' + ones[n%10]: '');
        if (n < 1000) return ones[Math.floor(n/100)] + ' Hundred' + (n%100? ' ' + toWords(n%100): '');
        if (n < 100000) return toWords(Math.floor(n/1000)) + ' Thousand' + (n%1000? ' ' + toWords(n%1000): '');
        if (n < 10000000) return toWords(Math.floor(n/100000)) + ' Lakh' + (n%100000? ' ' + toWords(n%100000): '');
        return toWords(Math.floor(n/10000000)) + ' Crore' + (n%10000000? ' ' + toWords(n%10000000): '');
      };
      const rupees = Math.floor(num);
      const paise = Math.round((num - rupees) * 100);
      return `${toWords(rupees).toUpperCase()} RUPEES${paise? ' AND ' + toWords(paise).toUpperCase() + ' PAISE': ''} ONLY`;
    };

    // Summary cards
    const cardTop = doc.y + 8;
    const pageW = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const cardW = (pageW - 20) / 2;
    drawCard(50, cardTop, cardW, 90, 'Quotation From', [companyName, companyAddress, companyEmail, companyPhone]);
    drawCard(50 + cardW + 20, cardTop, cardW, 90, 'Quotation For', [customerName || 'Customer', customerEmail]);
    doc.moveDown(7);

    // Items table
    doc.fontSize(11);
    const tableTop = doc.y + 6;
    // Header background
    doc.save();
    doc.rect(50, tableTop - 16, pageW, 18).fill(primary);
    doc.fillColor('#ffffff').fontSize(11).text('Item', 58, tableTop - 14);
    doc.text('Quantity', 320, tableTop - 14, { width: 60, align: 'right' });
    doc.text('Rate', 400, tableTop - 14, { width: 80, align: 'right' });
    doc.text('Amount', 490, tableTop - 14, { width: 80, align: 'right' });
    doc.restore();

    // Rows
    let yCursor = tableTop + 8;
    quotation.items.forEach((it, idx) => {
      const rowH = 18;
      if (idx % 2 === 0) {
        doc.save();
        doc.rect(50, yCursor - 4, pageW, rowH).fill('#FAFAFA');
        doc.restore();
      }
      doc.fillColor(textMuted);
      doc.text(it.name || it.description || 'Item', 58, yCursor, { width: 250 });
      doc.text(String(it.quantity), 320, yCursor, { width: 60, align: 'right' });
      doc.text(`${quotation.currency} ${Number(it.unitPrice).toFixed(2)}`, 400, yCursor, { width: 80, align: 'right' });
      const lineTotal = Number(it.totalAmount ?? (Number(it.quantity) * Number(it.unitPrice)));
      doc.text(`${quotation.currency} ${lineTotal.toFixed(2)}`, 490, yCursor, { width: 80, align: 'right' });
      yCursor += rowH;
    });

    // Totals panel
    const totalsY = yCursor + 12;
    const totalsX = 380;
    const totalsW = 190;
    const amountWords = amountInWordsIndian(Number(quotation.totalAmount || 0));

    // Amount in words
    doc.fillColor(textDark).fontSize(10).text(`Total (in words): ${amountWords}`, 50, totalsY, { width: 300 });

    // Totals box
    doc.save();
    doc.roundedRect(totalsX, totalsY - 6, totalsW, 80, 6).strokeColor(light).lineWidth(1).stroke();
    doc.fillColor(textDark).fontSize(11).text('Subtotal', totalsX + 10, totalsY);
    doc.text(`${quotation.currency} ${Number(quotation.subtotal).toFixed(2)}`, totalsX + 90, totalsY, { width: 90, align: 'right' });
    doc.text('Tax', totalsX + 10, totalsY + 16);
    doc.text(`${quotation.currency} ${Number(quotation.taxAmount).toFixed(2)}`, totalsX + 90, totalsY + 16, { width: 90, align: 'right' });
    doc.text('Discount', totalsX + 10, totalsY + 32);
    doc.text(`${quotation.currency} ${Number(quotation.discountAmount).toFixed(2)}`, totalsX + 90, totalsY + 32, { width: 90, align: 'right' });
    doc.fillColor(primary).fontSize(12).text('Total', totalsX + 10, totalsY + 50);
    doc.fillColor(primary).fontSize(12).text(`${quotation.currency} ${Number(quotation.totalAmount).toFixed(2)}`, totalsX + 90, totalsY + 50, { width: 90, align: 'right' });
    doc.restore();

    doc.moveDown(4);

    // Footer sections
    let ext: any = {};
    try { ext = bs?.description ? JSON.parse(bs.description) : {}; } catch {}

    const termsText = quotation.terms || ext.defaultTerms || '';
    const paymentText = ext.paymentTerms || '';
    const shippingText = ext.shippingTerms || '';

    if (termsText) {
      doc.moveDown(2).fontSize(11).fillColor('#374151').text('Terms & Conditions', { underline: true }).moveDown(0.5).text(termsText);
    }
    if (paymentText) {
      doc.moveDown(1).fontSize(11).fillColor('#374151').text('Payment Terms', { underline: true }).moveDown(0.5).text(paymentText);
    }
    if (shippingText) {
      doc.moveDown(1).fontSize(11).fillColor('#374151').text('Shipping Terms', { underline: true }).moveDown(0.5).text(shippingText);
    }

    doc.end();

    const buffer: Buffer = await new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    const filename = `${quotation.quotationNumber || 'quotation'}.pdf`;
    return { buffer, filename };
  }

  async generateInvoice(id: number) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!quotation) return { success: false, message: 'Quotation not found' };
    const createdInv = await this.prisma.invoice.create({
      data: {
        invoiceNumber: 'PENDING',
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

    const bs = await this.prisma.businessSettings.findFirst();
    let ext: any = {};
    try { ext = bs?.description ? JSON.parse(bs.description) : {}; } catch {}
    const invPrefix = (ext.invoicePrefix ?? 'INV-') as string;
    const invPad = Number(ext.invoicePad ?? 6);
    const invoice = await this.prisma.invoice.update({
      where: { id: createdInv.id },
      data: { invoiceNumber: `${invPrefix}${pad(createdInv.id, invPad)}` },
      include: { items: true },
    });

    return { success: true, data: { invoice } };
  }
}
