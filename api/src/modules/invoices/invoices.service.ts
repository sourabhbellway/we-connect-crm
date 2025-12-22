import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { PrismaService } from '../../database/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { UpsertInvoiceItemDto } from './dto/upsert-invoice-item.dto';
import { CreateInvoiceItemDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';
import { getAccessibleUserIds } from '../../common/utils/permission.util';

const genNumber = (prefix: string) => `${prefix}-${Date.now()}`;
const pad = (num: number, size: number) => String(num).padStart(size, '0');

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) { }

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
  }, user?: any) {
    const where: any = { deletedAt: null };

    // Role-based filtering
    if (user && user.userId) {
      const accessibleIds = await getAccessibleUserIds(user.userId, this.prisma);
      if (accessibleIds) {
        where.AND = [
          {
            OR: [
              { createdBy: { in: accessibleIds } },
              { lead: { assignedTo: { in: accessibleIds } } },
              { deal: { assignedTo: { in: accessibleIds } } },
            ],
          },
        ];
      }
    }
    if (status) where.status = status.toUpperCase();
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { invoiceNumber: { contains: q, mode: 'insensitive' } },
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
      this.prisma.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          payments: true,
          lead: {
            select: { id: true, firstName: true, lastName: true, email: true, company: true },
          },
          deal: {
            select: { id: true, title: true },
          },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return { success: true, data: { items, total, page, limit } };
  }

  async getById(id: number, user?: any) {
    const where: any = { id, deletedAt: null };

    // Role-based filtering
    if (user && user.userId) {
      const accessibleIds = await getAccessibleUserIds(user.userId, this.prisma);
      if (accessibleIds) {
        where.AND = [
          {
            OR: [
              { createdBy: { in: accessibleIds } },
              { lead: { assignedTo: { in: accessibleIds } } },
              { deal: { assignedTo: { in: accessibleIds } } },
            ],
          },
        ];
      }
    }

    const invoice = await this.prisma.invoice.findFirst({
      where,
      include: { items: true, payments: true },
    });
    if (!invoice) return { success: false, message: 'Invoice not found' };
    return { success: true, data: { invoice } };
  }

  async getNextNumber() {
    const bs = await this.prisma.businessSettings.findFirst();
    let ext: any = {};
    try {
      ext = bs?.description ? JSON.parse(bs.description) : {};
    } catch { }

    const prefix = (ext.invoicePrefix ?? 'INV-') as string;
    const suffix = (ext.invoiceSuffix ?? '') as string;
    const width = Number(ext.invoicePad ?? 6);

    const lastInvoice = await this.prisma.invoice.findFirst({
      orderBy: { id: 'desc' },
    });

    const nextId = (lastInvoice?.id || 0) + 1;
    const nextNumber = `${prefix}${pad(nextId, width)}${suffix}`;

    return { success: true, data: { nextNumber } };
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
    try {
      console.log('Creating invoice with payload:', JSON.stringify(dto, null, 2));
      const totals = this.calcTotals(dto.items || []);

      const invoice = await this.prisma.invoice.create({
        data: {
          invoiceNumber: dto.invoiceNumber || 'TEMP',
          title: dto.title,
          description: dto.description ?? null,
          status: (dto.status ? (dto.status as string).toUpperCase() : 'DRAFT') as any,
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

      // Update invoice number with proper formatting if not provided
      if (!dto.invoiceNumber) {
        // Get business settings for numbering
        const bs = await this.prisma.businessSettings.findFirst();
        let ext: any = {};
        try {
          ext = bs?.description ? JSON.parse(bs.description) : {};
        } catch { }

        const prefix = (ext.invoicePrefix ?? 'INV-') as string;
        const suffix = (ext.invoiceSuffix ?? '') as string;
        const width = Number(ext.invoicePad ?? 6);
        const number = `${prefix}${pad(invoice.id, width)}${suffix}`;

        await this.prisma.invoice.update({
          where: { id: invoice.id },
          data: { invoiceNumber: number },
        });

        invoice.invoiceNumber = number;
      }

      // Create activity for invoice creation
      if (invoice.leadId) {
        try {
          await this.prisma.activity.create({
            data: {
              title: 'Invoice created',
              description: `Invoice "${invoice.invoiceNumber}" created with total amount ${invoice.currency} ${Number(invoice.totalAmount).toFixed(2)}`,
              type: 'COMMUNICATION_LOGGED' as any,
              icon: 'FileText',
              iconColor: '#8B5CF6',
              metadata: {
                invoiceId: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                totalAmount: invoice.totalAmount,
                currency: invoice.currency,
                status: invoice.status,
              } as any,
              userId: invoice.createdBy,
              leadId: invoice.leadId,
            },
          });
        } catch (error) {
          console.error('Error creating invoice activity:', error);
        }
      }

      // Notify assigned user when invoice is created
      if (invoice.leadId) {
        try {
          const lead = await this.prisma.lead.findUnique({
            where: { id: invoice.leadId },
            select: { id: true, firstName: true, lastName: true, assignedTo: true },
          });

          if (lead?.assignedTo) {
            await this.notificationsService.create({
              userId: lead.assignedTo,
              type: NotificationType.INVOICE_SENT,
              title: 'Invoice Created',
              message: `Invoice "${invoice.invoiceNumber}" has been created for lead "${lead.firstName} ${lead.lastName}".`,
              link: `/leads/${lead.id}`,
              metadata: {
                invoiceId: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                leadId: lead.id,
              } as any,
            });
          }
        } catch (error) {
          console.error('Failed to send invoice created notification:', error);
        }
      }

      return { success: true, data: { invoice } };
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
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

    // Notify assigned user that invoice was sent
    if (invoice.leadId) {
      try {
        const lead = await this.prisma.lead.findUnique({
          where: { id: invoice.leadId },
          select: { id: true, firstName: true, lastName: true, assignedTo: true },
        });

        if (lead?.assignedTo) {
          await this.notificationsService.create({
            userId: lead.assignedTo,
            type: NotificationType.INVOICE_SENT,
            title: 'Invoice Sent',
            message: `Invoice "${invoice.invoiceNumber}" has been sent for lead "${lead.firstName} ${lead.lastName}".`,
            link: `/leads/${lead.id}`,
            metadata: {
              invoiceId: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
              leadId: lead.id,
            } as any,
          });
        }
      } catch (error) {
        console.error('Failed to send invoice sent notification:', error);
      }
    }

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

    // Notify assigned user about payment events
    if (invoice.leadId) {
      try {
        const lead = await this.prisma.lead.findUnique({
          where: { id: invoice.leadId },
          select: { id: true, firstName: true, lastName: true, assignedTo: true },
        });

        if (lead?.assignedTo) {
          const type = status === 'PAID'
            ? NotificationType.PAYMENT_ADDED
            : NotificationType.PAYMENT_UPDATED;

          await this.notificationsService.create({
            userId: lead.assignedTo,
            type,
            title: status === 'PAID' ? 'Invoice Paid' : 'Payment Recorded',
            message: status === 'PAID'
              ? `Invoice "${invoice.invoiceNumber}" has been fully paid.`
              : `A payment of ${payment.currency || invoice.currency} ${Number(payment.amount).toFixed(2)} has been recorded for invoice "${invoice.invoiceNumber}".`,
            link: `/leads/${lead.id}`,
            metadata: {
              invoiceId: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
              paymentId: payment.id,
              status,
              leadId: lead.id,
            } as any,
          });
        }
      } catch (error) {
        console.error('Failed to send payment notification:', error);
      }
    }

    return { success: true, data: { payment } };
  }

  async buildPdf(id: number): Promise<{ buffer: Buffer; filename: string }> {
    try {
      console.log(`Building PDF for invoice ${id}`);
      const invoice = await this.prisma.invoice.findFirst({
        where: { id, deletedAt: null },
        include: {
          items: true,
          lead: true,
          deal: true,
        },
      });
      if (!invoice) throw new Error('Invoice not found');

      // fetch Business Settings
      const bs = await this.prisma.businessSettings.findFirst();
      let ext: any = {};
      try {
        ext = bs?.description ? JSON.parse(bs.description) : {};
      } catch { }

      // Get Selected Template ID (default to template1 if not set)
      const templateId = bs?.invoiceTemplate || 'template1';
      console.log(`Using invoice template: ${templateId}`);

      // Basic Color Defaults
      let primaryColor = '#2563EB'; // Blue
      let secondaryColor = '#DBEAFE'; // Light Blue

      switch (templateId) {
        case 'professional':
        case 'bold-header':
        case 'template3':
          primaryColor = '#EA580C'; // Orange
          secondaryColor = '#FFF7ED';
          break;
        case 'minimalist':
        case 'template5':
          primaryColor = '#111827'; // Black
          secondaryColor = '#F3F4F6'; // Gray
          break;
        case 'classic-right':
        case 'template2':
          primaryColor = '#3730A3'; // Indigo
          secondaryColor = '#EEF2FF';
          break;
      }

      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c));

      // Company Details
      const companyName = bs?.companyName || 'Your Company';
      const companyAddress = bs?.companyAddress || '';
      const companyEmail = bs?.companyEmail || '';
      const companyPhone = bs?.companyPhone || '';
      const companyWebsite = bs?.companyWebsite || '';
      const gstNo = bs?.gstNumber || 'N/A';

      // Customer Details
      const customerName = invoice.lead
        ? `${invoice.lead.firstName || ''} ${invoice.lead.lastName || ''}`.trim() || invoice.lead.company || 'N/A'
        : invoice.deal
          ? invoice.deal.title || 'N/A'
          : 'N/A';
      const customerPhone = invoice.lead?.phone || 'N/A';
      const customerAddress = invoice.lead?.address || invoice.lead?.city || '';
      const customerCompany = invoice.lead?.company || '';

      // Helper: Number to Words (Simplified)
      const numberToWords = (num: number): string => {
        const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
        const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        if ((num = num.toString() as any).length > 9) return 'overflow';
        const n: any = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return '';
        let str = '';
        str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
        str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
        str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
        str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
        str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
        return str.trim();
      };

      // Helper for padding numbers
      const pad = (num: number, size: number): string => {
        let s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
      }

      // Helper: Draw Logo
      const drawLogo = (x: number, y: number, width: number) => {
        if (!bs?.companyLogo) return false;
        try {
          if (bs.companyLogo.startsWith('data:image')) {
            const base64Data = bs.companyLogo.split(';base64,').pop();
            if (base64Data) {
              const imgBuffer = Buffer.from(base64Data, 'base64');
              doc.image(imgBuffer, x, y, { width: width });
              return true;
            }
          } else {
            const uploadsDir = path.join(process.cwd(), 'uploads');
            const logoPath = path.join(uploadsDir, bs.companyLogo);
            if (fs.existsSync(logoPath)) {
              doc.image(logoPath, x, y, { width: width });
              return true;
            }
          }
        } catch (e) {
          console.error('Error drawing logo:', e);
        }
        return false;
      };

      // Helper: Draw Footers (Notes & Terms)
      const drawNotesAndTerms = (startY: number) => {
        let currentY = startY + 30;

        // Notes
        if (invoice.notes) {
          if (currentY > 700) { doc.addPage(); currentY = 50; }
          doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('NOTES', 40, currentY);
          currentY += 15;
          doc.fontSize(9).font('Helvetica').fillColor('#374151').text(invoice.notes, 40, currentY, { width: 515, lineGap: 2 });
          currentY += doc.heightOfString(invoice.notes, { width: 515 }) + 20;
        }

        // Terms & Conditions
        if (invoice.terms) {
          if (currentY > 700) { doc.addPage(); currentY = 50; }
          doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('TERMS & CONDITIONS', 40, currentY);
          currentY += 15;
          doc.fontSize(8).font('Helvetica').fillColor('gray').text(invoice.terms, 40, currentY, { width: 515, lineGap: 1 });
          currentY += doc.heightOfString(invoice.terms, { width: 515 }) + 20;
        }

        return currentY;
      };

      // --- TEMPLATE LOGIC ---

      if (templateId === 'professional') {
        // --- PROFESSIONAL PROPOSAL LAYOUT (ORANGE/MODERN THEME) ---

        // Top accent bar
        doc.rect(0, 0, 595, 15).fill(primaryColor);

        // Header Section
        const leftX = 40;
        let headerY = 50;

        const logoWidth = 90;
        const logoDrawn = drawLogo(leftX, headerY, logoWidth);

        // Right Side: INVOICE and ID
        doc.fontSize(32).font('Helvetica-Bold').fillColor('#111827').text('INVOICE', 350, headerY, { align: 'right', characterSpacing: 1 });
        doc.fontSize(12).font('Helvetica').fillColor('gray').text(`${invoice.invoiceNumber}`, 350, headerY + 35, { align: 'right' });

        if (logoDrawn) headerY += 80;
        else headerY += 20;

        // Company Details (Left) vs bill details (Right)
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827').text(companyName.toUpperCase(), leftX, headerY);
        let leftY = headerY + 18;
        doc.fontSize(9).font('Helvetica').fillColor('gray');
        if (companyAddress) { doc.text(companyAddress, leftX, leftY, { width: 220 }); leftY += doc.heightOfString(companyAddress, { width: 220 }) + 5; }
        if (companyPhone) { doc.text(`Phone: ${companyPhone}`, leftX, leftY); leftY += 14; }
        if (companyEmail) { doc.text(`Email: ${companyEmail}`, leftX, leftY); leftY += 14; }
        if (gstNo && gstNo !== 'N/A') {
          doc.rect(leftX, leftY - 2, 180, 16).fill(secondaryColor);
          doc.fillColor(primaryColor).font('Helvetica-Bold').text(`GSTIN: ${gstNo}`, leftX + 5, leftY + 2);
          leftY += 20;
        }

        // Invoice Meta Info Box (Right)
        let rightY = headerY;
        const metaBoxX = 380;
        doc.rect(metaBoxX, rightY, 175, 75).strokeColor('#E5E7EB').stroke();

        const drawMeta = (label: string, value: string, y: number, isLast = false) => {
          doc.fontSize(8).font('Helvetica-Bold').fillColor('gray').text(label.toUpperCase(), metaBoxX + 10, y + 10);
          doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827').text(value, metaBoxX + 10, y + 25);
          if (!isLast) doc.moveTo(metaBoxX, y + 42).lineTo(metaBoxX + 175, y + 42).strokeColor('#F3F4F6').stroke();
        };

        drawMeta('Date of Issue', new Date(invoice.createdAt).toLocaleDateString(), rightY);
        drawMeta('Due Date', invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A', rightY + 35, true);

        // Bill To Section
        const billToY = Math.max(leftY + 40, rightY + 100);
        doc.rect(leftX, billToY, 515, 25).fill(secondaryColor);
        doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryColor).text('BILL TO', leftX + 10, billToY + 8);

        let billY = billToY + 35;
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827').text(customerName, leftX + 10, billY);
        billY += 18;
        doc.fontSize(9).font('Helvetica').fillColor('gray');
        if (customerCompany) { doc.text(customerCompany, leftX + 10, billY); billY += 14; }
        if (customerAddress) { doc.text(customerAddress, leftX + 10, billY, { width: 250 }); billY += doc.heightOfString(customerAddress, { width: 250 }) + 5; }
        if (customerPhone !== 'N/A') { doc.text(`Phone: ${customerPhone}`, leftX + 10, billY); billY += 14; }

        // Items Table
        const tableTop = billY + 30;
        const tableWidth = 515;

        const cols = {
          name: { x: leftX, width: 280 },
          qty: { x: leftX + 290, width: 40 },
          rate: { x: leftX + 340, width: 80 },
          total: { x: leftX + 430, width: 85 }
        };

        // Header
        doc.rect(leftX, tableTop, tableWidth, 30).fill('#111827');
        doc.fontSize(8).font('Helvetica-Bold').fillColor('white');
        doc.text('ITEM & DESCRIPTION', cols.name.x + 10, tableTop + 11);
        doc.text('QTY', cols.qty.x, tableTop + 11, { width: cols.qty.width, align: 'center' });
        doc.text('RATE', cols.rate.x, tableTop + 11, { width: cols.rate.width, align: 'right' });
        doc.text('AMOUNT', cols.total.x, tableTop + 11, { width: cols.total.width, align: 'right' });

        let rowY = tableTop + 30;
        doc.fontSize(9).font('Helvetica');

        invoice.items.forEach((item, idx) => {
          const itemHeight = item.description ? 45 : 35;
          if (rowY + itemHeight > 750) { doc.addPage(); rowY = 50; }

          // zebra striping
          if (idx % 2 !== 0) doc.rect(leftX, rowY, tableWidth, itemHeight).fill('#F9FAFB');

          doc.fillColor('#1F2937').font('Helvetica-Bold').text(item.name, cols.name.x + 10, rowY + 10);
          if (item.description) {
            doc.fontSize(8).font('Helvetica').fillColor('gray').text(item.description, cols.name.x + 10, rowY + 22, { width: cols.name.width - 20, height: 20, ellipsis: true });
          }

          doc.fontSize(9).font('Helvetica').fillColor('#111827');
          doc.text(String(item.quantity), cols.qty.x, rowY + 12, { width: cols.qty.width, align: 'center' });
          doc.text(Number(item.unitPrice).toFixed(2), cols.rate.x, rowY + 12, { width: cols.rate.width, align: 'right' });
          doc.font('Helvetica-Bold').text(Number(item.totalAmount).toFixed(2), cols.total.x, rowY + 12, { width: cols.total.width, align: 'right' });

          rowY += itemHeight;
        });

        // Totals Section
        rowY += 20;
        if (rowY > 650) { doc.addPage(); rowY = 50; }

        const totalsX = 350;
        const drawTotalRow = (label: string, value: string, isFinal = false) => {
          doc.fontSize(9).font(isFinal ? 'Helvetica-Bold' : 'Helvetica').fillColor(isFinal ? '#111827' : 'gray').text(label, totalsX, rowY);
          doc.fontSize(isFinal ? 14 : 10).font('Helvetica-Bold').fillColor(isFinal ? primaryColor : '#111827').text(value, totalsX + 100, rowY, { width: 105, align: 'right' });
          rowY += isFinal ? 30 : 20;
        };

        drawTotalRow('Subtotal', Number(invoice.subtotal).toFixed(2));
        if (Number(invoice.discountAmount) > 0) drawTotalRow('Discount', `- ${Number(invoice.discountAmount).toFixed(2)}`);
        if (Number(invoice.taxAmount) > 0) drawTotalRow('Tax', Number(invoice.taxAmount).toFixed(2));

        doc.rect(totalsX, rowY - 5, 205, 1).fill('#E5E7EB');
        rowY += 10;
        drawTotalRow('Total Amount', `${invoice.currency} ${Number(invoice.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, true);

        // Render Notes & Terms
        drawNotesAndTerms(rowY);

      } else if (templateId === 'minimalist' || templateId === 'template5') {
        // --- MINIMALIST LAYOUT (CLEAN B&W) ---

        const centerX = 297;
        const logoWidth = 60;
        const logoDrawn = drawLogo(centerX - (logoWidth / 2), 40, logoWidth);

        let centerStackY = logoDrawn ? 110 : 60;
        doc.fillColor('#111827').fontSize(24).font('Helvetica-Bold').text('INVOICE', 0, centerStackY, { align: 'center', characterSpacing: 2 });

        centerStackY += 35;
        doc.fontSize(10).font('Helvetica').fillColor('gray').text(companyName.toUpperCase(), 0, centerStackY, { align: 'center' });

        centerStackY += 20;
        doc.rect(centerX - 30, centerStackY, 60, 1).fill('#111827');

        // Billing Info Columns
        const detailsY = centerStackY + 50;
        const colWidth = 200;

        // Bill To (Left)
        doc.fontSize(8).font('Helvetica-Bold').fillColor('gray').text('BILLED TO', 50, detailsY);
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827').text(customerName, 50, detailsY + 15);
        let billY = detailsY + 32;
        doc.fontSize(9).font('Helvetica').fillColor('gray');
        if (customerAddress) { doc.text(customerAddress, 50, billY, { width: colWidth }); billY += doc.heightOfString(customerAddress, { width: colWidth }) + 5; }
        if (customerPhone !== 'N/A') { doc.text(customerPhone, 50, billY); }

        // Invoice Info (Right)
        doc.fontSize(8).font('Helvetica-Bold').fillColor('gray').text('INVOICE INFO', 400, detailsY, { align: 'right' });
        doc.fontSize(10).font('Courier-Bold').fillColor('#111827').text(invoice.invoiceNumber, 400, detailsY + 15, { align: 'right' });
        doc.fontSize(9).font('Courier').fillColor('gray').text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 400, detailsY + 30, { align: 'right' });
        doc.fillColor('#DC2626').text(`Due: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}`, 400, detailsY + 45, { align: 'right' });

        // Items Table
        const tableY = Math.max(billY + 40, detailsY + 80);
        doc.moveTo(50, tableY).lineTo(545, tableY).lineWidth(1).stroke('#000');

        doc.fontSize(8).font('Helvetica-Bold').fillColor('#111827');
        doc.text('ITEM', 50, tableY + 10);
        doc.text('QTY', 350, tableY + 10, { align: 'center', width: 50 });
        doc.text('TOTAL', 480, tableY + 10, { align: 'right', width: 65 });

        let rowY = tableY + 30;
        doc.font('Helvetica').fontSize(10);

        invoice.items.forEach(item => {
          if (rowY > 700) { doc.addPage(); rowY = 50; }
          doc.fillColor('#111827').font('Helvetica-Bold').text(item.name, 50, rowY);
          doc.fontSize(8).font('Helvetica').fillColor('gray').text(item.description || '', 50, rowY + 12, { width: 280, height: 10 });

          doc.fontSize(10).font('Courier').fillColor('#111827').text(String(item.quantity), 350, rowY, { align: 'center', width: 50 });
          doc.font('Helvetica-Bold').text(Number(item.totalAmount).toFixed(2), 480, rowY, { align: 'right', width: 65 });

          doc.moveTo(50, rowY + 25).lineTo(545, rowY + 25).lineWidth(0.5).stroke('#F3F4F6');
          rowY += 35;
        });

        // Total
        rowY += 20;
        if (rowY > 650) { doc.addPage(); rowY = 50; }
        doc.fontSize(8).font('Helvetica-Bold').fillColor('gray').text('TOTAL AMOUNT', 400, rowY, { align: 'right', width: 145 });
        doc.fontSize(24).font('Helvetica-Bold').fillColor('#111827').text(`${invoice.currency} ${Number(invoice.totalAmount).toFixed(2)}`, 350, rowY + 15, { align: 'right', width: 195 });

        drawNotesAndTerms(rowY + 60);

      } else if (templateId === 'bold-header' || templateId === 'template3') {
        // --- BOLD ACCENT (Template 3 / EMERALD THEME) ---
        const accentColor = '#059669'; // Emerald

        doc.rect(0, 0, 595, 120).fill('#F9FAFB');
        doc.moveTo(0, 120).lineTo(595, 120).strokeColor('#E5E7EB').stroke();

        const headerY = 40;
        // Company Side (Left)
        const logoDrawn = drawLogo(30, headerY - 10, 60);
        let leftOff = logoDrawn ? 100 : 30;
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#111827').text(companyName, leftOff, headerY);
        doc.fontSize(9).font('Helvetica').fillColor('gray').text(companyAddress || '', leftOff, headerY + 22, { width: 250 });

        // Bill To (Right)
        doc.fontSize(8).font('Helvetica-Bold').fillColor(accentColor).text('BILL TO', 400, headerY, { align: 'right' });
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827').text(customerName, 350, headerY + 15, { align: 'right', width: 215 });
        doc.fontSize(9).font('Helvetica').fillColor('gray').text(customerAddress || '', 350, headerY + 30, { align: 'right', width: 215 });

        // Hero Info Box
        const boxY = 150;
        doc.roundedRect(30, boxY, 535, 60, 8).fill(accentColor);
        doc.fillColor('white');

        doc.fontSize(8).font('Helvetica').text('INVOICE NUMBER', 55, boxY + 15);
        doc.fontSize(14).font('Helvetica-Bold').text(invoice.invoiceNumber, 55, boxY + 30);

        doc.moveTo(250, boxY + 10).lineTo(250, boxY + 50).strokeColor('rgba(255,255,255,0.3)').lineWidth(1).stroke();

        doc.fontSize(8).font('Helvetica').text('DATE OF ISSUE', 270, boxY + 15);
        doc.fontSize(12).font('Helvetica-Bold').text(new Date(invoice.createdAt).toLocaleDateString(), 270, boxY + 30);

        doc.moveTo(420, boxY + 10).lineTo(420, boxY + 50).strokeColor('rgba(255,255,255,0.3)').stroke();

        doc.fontSize(8).font('Helvetica').text('DUE DATE', 440, boxY + 15);
        doc.fontSize(12).font('Helvetica-Bold').text(invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A', 440, boxY + 30);

        // Table
        const tableY = 240;
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#9CA3AF');
        doc.text('#', 30, tableY, { width: 30, align: 'center' });
        doc.text('DESCRIPTION', 70, tableY);
        doc.text('QTY', 430, tableY, { width: 40, align: 'center' });
        doc.text('PRICE', 490, tableY, { width: 75, align: 'right' });

        doc.moveTo(30, tableY + 15).lineTo(565, tableY + 15).strokeColor(accentColor).lineWidth(1.5).stroke();

        let rowY = tableY + 25;
        doc.font('Helvetica').fontSize(10).fillColor('#374151');

        invoice.items.forEach((item, idx) => {
          if (rowY > 700) { doc.addPage(); rowY = 50; }
          doc.fillColor('#9CA3AF').text(String(idx + 1).padStart(2, '0'), 30, rowY, { width: 30, align: 'center' });
          doc.fillColor('#111827').font('Helvetica-Bold').text(item.name, 70, rowY);
          doc.text(String(item.quantity), 430, rowY, { width: 40, align: 'center' });
          doc.text(Number(item.totalAmount).toFixed(2), 490, rowY, { width: 75, align: 'right' });

          doc.moveTo(30, rowY + 18).lineTo(565, rowY + 18).strokeColor('#F3F4F6').lineWidth(0.5).stroke();
          rowY += 28;
        });

        const totalY = rowY + 20;
        if (totalY > 650) { doc.addPage(); rowY = 50; }
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#9CA3AF').text('TOTAL DUE', 380, totalY + 15);
        doc.fontSize(24).font('Helvetica-Bold').fillColor(accentColor).text(`${invoice.currency} ${Number(invoice.totalAmount).toFixed(2)}`, 350, totalY + 30, { align: 'right', width: 215 });

        drawNotesAndTerms(totalY + 70);

      } else if (templateId === 'classic-right' || templateId === 'template2') {
        // --- CLASSIC ELEGANT (Template 2 / INDIGO SERIF) ---
        const indigoAccent = '#3730A3';

        doc.fontSize(32).font('Times-Bold').fillColor('#111827').text('INVOICE', 30, 40, { characterSpacing: 2 });

        let headerRY = 40;
        const logoDrawn = drawLogo(500, headerRY, 60);
        if (logoDrawn) headerRY += 70;

        doc.fontSize(14).font('Times-Roman').fillColor(indigoAccent).text(companyName.toUpperCase(), 300, headerRY, { align: 'right', width: 265 });
        doc.fontSize(9).font('Helvetica').fillColor('gray').text(companyAddress || '', 300, headerRY + 18, { align: 'right', width: 265 });

        doc.moveTo(30, headerRY + 55).lineTo(565, headerRY + 55).lineWidth(2).strokeColor(indigoAccent).stroke();

        const detailsY = headerRY + 80;

        doc.fontSize(9).font('Helvetica-Bold').fillColor(indigoAccent).text('BILL TO', 30, detailsY);
        doc.fontSize(12).font('Times-Bold').fillColor('#111827').text(customerName, 30, detailsY + 15);
        doc.fontSize(10).font('Times-Roman').fillColor('gray').text(customerAddress || '', 30, detailsY + 30, { width: 250 });

        doc.font('Times-Bold').fontSize(16).fillColor('#111827').text(`Invoice No: ${invoice.invoiceNumber}`, 350, detailsY, { align: 'right', width: 215 });
        doc.fontSize(10).font('Times-Roman').fillColor('gray');
        doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 350, detailsY + 20, { align: 'right', width: 215 });
        doc.fillColor('#DC2626').text(`Due By: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}`, 350, detailsY + 35, { align: 'right', width: 215 });

        const tableY = detailsY + 80;
        doc.rect(30, tableY, 535, 25).fill('#EEF2FF');
        doc.fillColor(indigoAccent).fontSize(9).font('Helvetica-Bold');
        doc.text('DESCRIPTION', 45, tableY + 8);
        doc.text('QTY', 440, tableY + 8, { width: 40, align: 'center' });
        doc.text('AMOUNT', 500, tableY + 8, { width: 55, align: 'right' });

        let rowY = tableY + 35;
        doc.font('Times-Roman').fontSize(11).fillColor('#1F2937');

        invoice.items.forEach(item => {
          if (rowY > 700) { doc.addPage(); rowY = 50; }
          doc.text(item.name, 45, rowY);
          doc.text(String(item.quantity), 440, rowY, { width: 40, align: 'center' });
          doc.font('Times-Bold').text(Number(item.totalAmount).toFixed(2), 500, rowY, { width: 55, align: 'right' });
          doc.font('Times-Roman');
          doc.moveTo(30, rowY + 18).lineTo(565, rowY + 18).lineWidth(0.5).strokeColor('#E5E7EB').stroke();
          rowY += 30;
        });

        rowY += 20;
        if (rowY > 650) { doc.addPage(); rowY = 50; }
        doc.rect(380, rowY, 185, 45).fill(indigoAccent);
        doc.fillColor('white');
        doc.fontSize(9).font('Helvetica-Bold').text('TOTAL PAYABLE', 395, rowY + 10);
        doc.fontSize(16).font('Times-Bold').text(`${invoice.currency} ${Number(invoice.totalAmount).toLocaleString()}`, 395, rowY + 22, { align: 'right', width: 160 });

        drawNotesAndTerms(rowY + 60);

      } else {
        // --- STANDARD / DEFAULT LAYOUT (BLUE THEME) ---

        const leftX = 40;
        let headerY = 50;

        // Background header accent
        doc.rect(0, 0, 595, 80).fill(secondaryColor);

        const logoDrawn = drawLogo(leftX, 20, 50);

        doc.fontSize(24).font('Helvetica-Bold').fillColor(primaryColor).text('INVOICE', 350, 25, { align: 'right', characterSpacing: 1 });
        doc.fontSize(10).font('Helvetica').fillColor('#4B5563').text(`# ${invoice.invoiceNumber}`, 350, 55, { align: 'right' });

        headerY = 100;
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827').text(companyName.toUpperCase(), leftX, headerY);
        let leftY = headerY + 18;
        doc.fontSize(9).font('Helvetica').fillColor('gray');
        if (companyAddress) { doc.text(companyAddress, leftX, leftY); leftY += 14; }
        if (companyEmail) { doc.text(companyEmail, leftX, leftY); leftY += 14; }
        if (gstNo && gstNo !== 'N/A') { doc.text(`GSTIN: ${gstNo}`, leftX, leftY); leftY += 14; }

        // Bill To section
        const billX = 350;
        doc.fontSize(8).font('Helvetica-Bold').fillColor(primaryColor).text('BILL TO', billX, headerY);
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827').text(customerName, billX, headerY + 15);
        let billRY = headerY + 30;
        doc.fontSize(9).font('Helvetica').fillColor('gray');
        if (customerCompany) { doc.text(customerCompany, billX, billRY); billRY += 12; }
        if (customerAddress) { doc.text(customerAddress, billX, billRY, { width: 200 }); billRY += 25; }

        // Table
        const tableTop = Math.max(leftY, billRY) + 30;
        const colSetup = {
          name: { x: leftX, width: 300 },
          qty: { x: leftX + 310, width: 40 },
          total: { x: leftX + 360, width: 155 }
        };

        doc.rect(leftX, tableTop, 515, 20).fill(primaryColor);
        doc.fillColor('white').fontSize(8).font('Helvetica-Bold');
        doc.text('DESCRIPTION', colSetup.name.x + 10, tableTop + 6);
        doc.text('QTY', colSetup.qty.x, tableTop + 6, { width: colSetup.qty.width, align: 'center' });
        doc.text('TOTAL', colSetup.total.x, tableTop + 6, { width: colSetup.total.width, align: 'right' });

        let rowY = tableTop + 20;
        doc.font('Helvetica').fontSize(9).fillColor('#374151');

        invoice.items.forEach((item, idx) => {
          doc.text(item.name, colSetup.name.x + 10, rowY + 8);
          doc.text(String(item.quantity), colSetup.qty.x, rowY + 8, { width: colSetup.qty.width, align: 'center' });
          doc.font('Helvetica-Bold').text(Number(item.totalAmount).toFixed(2), colSetup.total.x - 10, rowY + 8, { width: colSetup.total.width, align: 'right' });
          doc.font('Helvetica');
          doc.moveTo(leftX, rowY + 25).lineTo(555, rowY + 25).strokeColor('#F3F4F6').stroke();
          rowY += 25;
        });

        rowY += 20;
        doc.fontSize(10).font('Helvetica-Bold').fillColor('gray').text('TOTAL DUE', 350, rowY, { align: 'right', width: 100 });
        doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor).text(`${invoice.currency} ${Number(invoice.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 450, rowY - 5, { align: 'right', width: 105 });

        drawNotesAndTerms(rowY + 40);
      }

      const footerY = 750;
      doc.fontSize(8).font('Helvetica').fillColor('#9CA3AF');
      doc.text('Thank you for your business!', 30, footerY, { align: 'center', width: 535 });
      if (companyEmail) doc.text(companyEmail, 30, footerY + 12, { align: 'center', width: 535 });

      doc.end();

      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({ buffer, filename: `invoice-${invoice.invoiceNumber}.pdf` });
        });
        doc.on('error', reject);
      });
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw error;
    }
  }
} // End InvoicesService
