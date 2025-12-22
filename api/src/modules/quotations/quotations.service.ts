import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { PrismaService } from '../../database/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { UpsertQuotationItemDto } from './dto/upsert-quotation-item.dto';
import { CreateQuotationItemDto } from './dto/create-quotation.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';
import { getAccessibleUserIds } from '../../common/utils/permission.util';
import * as fs from 'fs';
import * as path from 'path';

const pad = (num: number, size: number) => String(num).padStart(size, '0');

@Injectable()
export class QuotationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) { }

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

    const quotation = await this.prisma.quotation.findFirst({
      where,
      include: { items: true, lead: true, deal: true, companies: true },
    });
    if (!quotation) return { success: false, message: 'Quotation not found' };
    return { success: true, data: { quotation } };
  }

  async getNextNumber() {
    const bs = await this.prisma.businessSettings.findFirst();
    let ext: any = {};
    try {
      ext = bs?.description ? JSON.parse(bs.description) : {};
    } catch { }

    const prefix = (ext.quotePrefix ?? 'Q-') as string;
    const suffix = (ext.quoteSuffix ?? '') as string;
    const width = Number(ext.quotePad ?? 6);

    const lastQuotation = await this.prisma.quotation.findFirst({
      orderBy: { id: 'desc' },
    });

    const nextId = (lastQuotation?.id || 0) + 1;
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

  async create(dto: CreateQuotationDto) {
    const totals = this.calcTotals(dto.items || []);

    // Helper to get Business Settings
    const bs = await this.prisma.businessSettings.findFirst();
    let ext: any = {};
    try { ext = bs?.description ? JSON.parse(bs.description) : {}; } catch { }

    let number = dto.quotationNumber;

    // If no number provided, generate one NOW to ensure we insert with a valid unique number
    if (!number) {
      const prefix = (ext.quotePrefix ?? 'Q-') as string;
      const width = Number(ext.quotePad ?? 6);
      const lastQuotation = await this.prisma.quotation.findFirst({ orderBy: { id: 'desc' } });
      const nextId = (lastQuotation?.id || 0) + 1;
      number = `${prefix}${pad(nextId, width)}`;
    }

    const termsFinal = dto.terms ?? ext.defaultTerms ?? '';

    // Create the quotation
    const quotation = await this.prisma.quotation.create({
      data: {
        quotationNumber: number,
        title: dto.title,
        description: dto.description ?? null,
        status: (dto.status as any) ?? 'DRAFT',

        // Financials
        subtotal: totals.subtotal as any,
        taxAmount: totals.taxAmount as any,
        discountAmount: (dto.discountAmount as any) ?? (totals.discountAmount as any),
        totalAmount: totals.totalAmount as any,
        currency: dto.currency ?? 'USD',

        // Dates & Meta
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        notes: dto.notes ?? null,
        terms: termsFinal,

        // Relations
        leadId: dto.leadId ?? null,
        dealId: dto.dealId ?? null,
        companyId: dto.companyId ?? null,
        createdBy: dto.createdBy ?? 1,

        // Items
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

            // Item Totals (Calculated locally to be safe)
            subtotal: (Number(it.quantity) * Number(it.unitPrice)) as any,
            totalAmount: (
              Number(it.quantity) * Number(it.unitPrice) *
              (1 + Number(it.taxRate ?? 0) / 100) *
              (1 - Number(it.discountRate ?? 0) / 100)
            ) as any,
            sortOrder: idx,
          })),
        },
      },
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

    // Send notification when quotation is created (draft)
    if (quotation.leadId) {
      try {
        const lead = await this.prisma.lead.findUnique({
          where: { id: quotation.leadId },
          select: { id: true, firstName: true, lastName: true, assignedTo: true },
        });

        if (lead?.assignedTo) {
          await this.notificationsService.create({
            userId: lead.assignedTo,
            type: NotificationType.QUOTATION_SENT, // Ensure this enum exists or use string if loose
            title: 'Quotation Created',
            message: `Quotation "${quotation.quotationNumber}" has been created for lead "${lead.firstName} ${lead.lastName}".`,
            link: `/leads/${lead.id}`,
            metadata: {
              quotationId: quotation.id,
              quotationNumber: quotation.quotationNumber,
              leadId: lead.id,
            } as any,
          });
        }
      } catch (error) {
        console.error('Failed to send quotation created notification:', error);
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

    // Notify assigned user that quotation was sent
    if (quotation.leadId) {
      try {
        const lead = await this.prisma.lead.findUnique({
          where: { id: quotation.leadId },
          select: { id: true, firstName: true, lastName: true, assignedTo: true },
        });

        if (lead?.assignedTo) {
          await this.notificationsService.create({
            userId: lead.assignedTo,
            type: NotificationType.QUOTATION_SENT,
            title: 'Quotation Sent',
            message: `Quotation "${quotation.quotationNumber}" has been sent for lead "${lead.firstName} ${lead.lastName}".`,
            link: `/leads/${lead.id}`,
            metadata: {
              quotationId: quotation.id,
              quotationNumber: quotation.quotationNumber,
              leadId: lead.id,
            } as any,
          });
        }
      } catch (error) {
        console.error('Failed to send quotation sent notification:', error);
      }
    }

    return { success: true, data: { quotation } };
  }

  async markAccepted(id: number) {
    const quotation = await this.prisma.quotation.update({
      where: { id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    });

    // Notify assigned user that quotation was accepted
    if (quotation.leadId) {
      try {
        const lead = await this.prisma.lead.findUnique({
          where: { id: quotation.leadId },
          select: { id: true, firstName: true, lastName: true, assignedTo: true },
        });

        if (lead?.assignedTo) {
          await this.notificationsService.create({
            userId: lead.assignedTo,
            type: NotificationType.QUOTATION_ACCEPTED,
            title: 'Quotation Accepted',
            message: `Quotation "${quotation.quotationNumber}" has been accepted by lead "${lead.firstName} ${lead.lastName}".`,
            link: `/leads/${lead.id}`,
            metadata: {
              quotationId: quotation.id,
              quotationNumber: quotation.quotationNumber,
              leadId: lead.id,
            } as any,
          });
        }
      } catch (error) {
        console.error('Failed to send quotation accepted notification:', error);
      }
    }

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

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));

    // Colors
    const colors = {
      primary: '#4f46e5', // Indigo 600
      text: '#1e293b',    // Slate 800
      lightText: '#64748b', // Slate 500
      border: '#e2e8f0',  // Slate 200
      bg: '#f8fafc',      // Slate 50
      white: '#ffffff',
      accent: '#4338ca'   // Indigo 700
    };

    // Business settings
    const bs = await this.prisma.businessSettings.findFirst();
    const companyName = bs?.companyName || 'WE-CONNECT';

    // Customer Details
    const customerName = quotation.lead
      ? `${quotation.lead.firstName || ''} ${quotation.lead.lastName || ''}`.trim()
      : quotation.companies ? quotation.companies.name : 'N/A';
    const customerCompany = quotation.lead?.company || '';
    const customerEmail = quotation.lead?.email || '';
    const customerAddress = quotation.lead?.address || '';

    // --- LOGO & HEADER ---
    let y = 40;

    // Attempt to draw logo
    let logoWidth = 120;
    let hasLogo = false;
    if (bs?.companyLogo) {
      try {
        if (bs.companyLogo.startsWith('data:image')) {
          const base64Data = bs.companyLogo.split(';base64,').pop();
          if (base64Data) {
            const imgBuffer = Buffer.from(base64Data, 'base64');
            doc.image(imgBuffer, 40, y, { width: logoWidth });
            hasLogo = true;
          }
        } else {
          const uploadsDir = path.join(process.cwd(), 'uploads');
          const logoPath = path.join(uploadsDir, bs.companyLogo);
          if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 40, y, { width: logoWidth });
            hasLogo = true;
          }
        }
      } catch (e) {
        console.error('Error drawing PDF logo:', e);
      }
    }

    if (!hasLogo) {
      doc.fontSize(24).font('Helvetica-Bold').fillColor(colors.primary).text(companyName, 40, y);
    }

    // QUOTATION LABEL (Top Right)
    doc.fontSize(40).font('Helvetica-Bold').fillColor(colors.text).opacity(0.1)
      .text('QUOTATION', 300, y - 5, { align: 'right' }).opacity(1);

    // QUOTATION NO
    y = 80;
    doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.lightText).text('QUOTATION NUMBER', 400, y, { align: 'right' });
    doc.fontSize(18).font('Helvetica-Bold').fillColor(colors.primary).text(quotation.quotationNumber, 400, y + 12, { align: 'right' });

    y = hasLogo ? 130 : 110;

    // --- COMPANY & INFO GRID ---
    const leftCol = 40;
    const rightCol = 350;

    // Company Details
    doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.text).text(companyName, leftCol, y);
    doc.font('Helvetica').fillColor(colors.lightText);
    if (bs?.companyAddress) doc.text(bs.companyAddress, leftCol, y + 14, { width: 200 });
    if (bs?.companyPhone) doc.text(`Phone: ${bs.companyPhone}`, leftCol, y + 42);
    if (bs?.companyEmail) doc.text(`Email: ${bs.companyEmail}`, leftCol, y + 54);

    // Meta Details (Right)
    doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.lightText).text('DATE', rightCol, y);
    doc.fillColor(colors.text).text(new Date(quotation.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), rightCol + 80, y, { align: 'right', width: 120 });

    const validUntil = quotation.validUntil ? new Date(quotation.validUntil) : null;
    if (validUntil) {
      doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.lightText).text('VALID UNTIL', rightCol, y + 18);
      doc.fillColor(colors.text).text(validUntil.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), rightCol + 80, y + 18, { align: 'right', width: 120 });
    }

    y += 100;

    // --- RECIPIENT BOX ---
    doc.rect(40, y, 515, 80).fill(colors.bg);
    doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(8).text('RECIPIENT', 55, y + 15);

    doc.fontSize(14).font('Helvetica-Bold').fillColor(colors.text).text(customerName, 55, y + 30);
    if (customerCompany) {
      doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.lightText).text(customerCompany, 55, y + 48);
    }

    let contactInfo = customerEmail;
    if (quotation.lead?.phone) contactInfo += `  |  ${quotation.lead.phone}`;
    doc.fontSize(9).font('Helvetica').fillColor(colors.lightText).text(contactInfo, 55, y + 62);

    // Title / Subject
    y += 105;
    doc.fontSize(11).font('Helvetica-Bold').fillColor(colors.text).text(quotation.title, 40, y);
    if (quotation.description) {
      doc.fontSize(9).font('Helvetica').fillColor(colors.lightText).text(quotation.description, 40, y + 16, { width: 515 });
      y += 20;
    }
    y += 15;

    // --- TABLE HEADER ---
    doc.rect(40, y, 515, 30).fill(colors.text);
    doc.fontSize(8).font('Helvetica-Bold').fillColor(colors.white);
    doc.text('#', 50, y + 11);
    doc.text('DESCRIPTION', 80, y + 11);
    doc.text('QTY', 350, y + 11, { width: 40, align: 'center' });
    doc.text('PRICE', 400, y + 11, { width: 70, align: 'right' });
    doc.text('AMOUNT', 480, y + 11, { width: 65, align: 'right' });

    y += 30;

    // --- TABLE ROWS ---
    quotation.items.forEach((item, i) => {
      // Background for alternate rows
      if (i % 2 === 1) {
        doc.rect(40, y, 515, 40).fill(colors.bg);
      }

      doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.lightText).text(String(i + 1).padStart(2, '0'), 50, y + 15);
      doc.fillColor(colors.text).text(item.name, 80, y + 10, { width: 260 });
      if (item.description) {
        doc.fontSize(7).font('Helvetica').fillColor(colors.lightText).text(item.description, 80, y + 22, { width: 260, height: 15, ellipsis: true });
      }

      doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.text);
      doc.text(String(item.quantity), 350, y + 15, { width: 40, align: 'center' });
      doc.text(`${quotation.currency} ${Number(item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 400, y + 15, { width: 70, align: 'right' });
      doc.text(`${quotation.currency} ${Number(item.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 480, y + 15, { width: 65, align: 'right' });

      // Border bottom
      doc.moveTo(40, y + 40).lineTo(555, y + 40).lineWidth(0.5).strokeColor(colors.border).stroke();

      y += 40;

      // Page break if needed
      if (y > 700) {
        doc.addPage();
        y = 40;
      }
    });

    // --- SUMMARY SECTION ---
    y += 20;
    const summaryWidth = 200;
    const summaryX = 355;

    const drawSummaryRow = (label: string, value: string, isTotal = false) => {
      if (isTotal) {
        doc.rect(summaryX, y, summaryWidth, 35).fill(colors.primary);
        doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.white).text(label, summaryX + 10, y + 13);
        doc.fontSize(14).text(value, summaryX + 10, y + 10, { width: summaryWidth - 20, align: 'right' });
        y += 45;
      } else {
        doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.lightText).text(label, summaryX + 10, y);
        doc.fillColor(colors.text).text(value, summaryX + 10, y, { width: summaryWidth - 20, align: 'right' });
        y += 18;
      }
    };

    drawSummaryRow('Subtotal', `${quotation.currency} ${Number(quotation.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);

    if (Number(quotation.taxAmount) > 0) {
      drawSummaryRow('Tax Amount', `+ ${quotation.currency} ${Number(quotation.taxAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    }

    if (Number(quotation.discountAmount) > 0) {
      doc.fillColor('#ef4444');
      drawSummaryRow('Discount', `- ${quotation.currency} ${Number(quotation.discountAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    }

    y += 5;
    drawSummaryRow('TOTAL AMOUNT', `${quotation.currency} ${Number(quotation.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, true);

    // --- TERMS & NOTES ---
    let footerY = y;
    if (quotation.notes) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor(colors.lightText).text('ADDITIONAL NOTES', 40, footerY);
      doc.fontSize(8).font('Helvetica').fillColor(colors.text).text(quotation.notes, 40, footerY + 12, { width: 300 });
      footerY += 45;
    }

    if (quotation.terms) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor(colors.lightText).text('TERMS & CONDITIONS', 40, footerY);
      doc.fontSize(7).font('Helvetica').fillColor(colors.text).text(quotation.terms, 40, footerY + 12, { width: 300 });
    }

    // --- FOOTER ---
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).font('Helvetica').fillColor(colors.lightText);
      doc.text(`Thank you for your business!  |  Page ${i + 1} of ${pageCount}`, 0, 800, { align: 'center', width: 595 });
    }

    doc.end();

    const buffer = Buffer.concat(chunks);
    return { buffer, filename: `Quotation_${quotation.quotationNumber}.pdf` };
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
    try { ext = bs?.description ? JSON.parse(bs.description) : {}; } catch { }
    const invPrefix = (ext.invoicePrefix ?? 'INV-') as string;
    const invSuffix = (ext.invoiceSuffix ?? '') as string;
    const invPad = Number(ext.invoicePad ?? 6);
    const invoice = await this.prisma.invoice.update({
      where: { id: createdInv.id },
      data: { invoiceNumber: `${invPrefix}${pad(createdInv.id, invPad)}${invSuffix} ` },
      include: { items: true },
    });

    return { success: true, data: { invoice } };
  }
}