"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const PDFDocument = require('pdfkit');
const prisma_service_1 = require("../../database/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const notifications_service_1 = require("../notifications/notifications.service");
const client_1 = require("@prisma/client");
const permission_util_1 = require("../../common/utils/permission.util");
const genNumber = (prefix) => `${prefix}-${Date.now()}`;
const pad = (num, size) => String(num).padStart(size, '0');
let InvoicesService = class InvoicesService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async list({ page = 1, limit = 10, search, status, entityType, entityId, }, user) {
        const where = { deletedAt: null };
        if (user && user.userId) {
            const accessibleIds = await (0, permission_util_1.getAccessibleUserIds)(user.userId, this.prisma);
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
        if (status)
            where.status = status.toUpperCase();
        if (search && search.trim()) {
            const q = search.trim();
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { invoiceNumber: { contains: q, mode: 'insensitive' } },
            ];
        }
        if (entityType && entityId) {
            const id = Number(entityId);
            if (entityType.toLowerCase() === 'lead') {
                where.leadId = id;
            }
            else if (entityType.toLowerCase() === 'deal') {
                where.dealId = id;
            }
            else if (entityType.toLowerCase() === 'contact') {
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
    async getById(id, user) {
        const where = { id, deletedAt: null };
        if (user && user.userId) {
            const accessibleIds = await (0, permission_util_1.getAccessibleUserIds)(user.userId, this.prisma);
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
        if (!invoice)
            return { success: false, message: 'Invoice not found' };
        return { success: true, data: { invoice } };
    }
    async getNextNumber() {
        const bs = await this.prisma.businessSettings.findFirst();
        let ext = {};
        try {
            ext = bs?.description ? JSON.parse(bs.description) : {};
        }
        catch { }
        const prefix = (ext.invoicePrefix ?? 'INV-');
        const suffix = (ext.invoiceSuffix ?? '');
        const width = Number(ext.invoicePad ?? 6);
        const lastInvoice = await this.prisma.invoice.findFirst({
            orderBy: { id: 'desc' },
        });
        const nextId = (lastInvoice?.id || 0) + 1;
        const nextNumber = `${prefix}${pad(nextId, width)}${suffix}`;
        return { success: true, data: { nextNumber } };
    }
    calcTotals(items) {
        const subtotal = items.reduce((sum, it) => sum + Number(it.quantity) * Number(it.unitPrice), 0);
        const taxAmount = items.reduce((sum, it) => sum +
            (Number(it.quantity) * Number(it.unitPrice) * Number(it.taxRate ?? 0)) /
                100, 0);
        const discountAmount = items.reduce((sum, it) => sum +
            (Number(it.quantity) *
                Number(it.unitPrice) *
                Number(it.discountRate ?? 0)) /
                100, 0);
        const totalAmount = subtotal + taxAmount - discountAmount;
        return { subtotal, taxAmount, discountAmount, totalAmount };
    }
    async create(dto) {
        try {
            console.log('Creating invoice with payload:', JSON.stringify(dto, null, 2));
            const totals = this.calcTotals(dto.items || []);
            const invoice = await this.prisma.invoice.create({
                data: {
                    invoiceNumber: dto.invoiceNumber || 'TEMP',
                    title: dto.title,
                    description: dto.description ?? null,
                    status: (dto.status ? dto.status.toUpperCase() : 'DRAFT'),
                    subtotal: totals.subtotal,
                    taxAmount: totals.taxAmount,
                    discountAmount: dto.discountAmount ?? totals.discountAmount,
                    totalAmount: totals.totalAmount,
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
                            quantity: it.quantity,
                            unit: it.unit ?? 'pcs',
                            unitPrice: it.unitPrice,
                            taxRate: it.taxRate ?? 0,
                            discountRate: it.discountRate ?? 0,
                            subtotal: (Number(it.quantity) * Number(it.unitPrice)),
                            totalAmount: (Number(it.quantity) *
                                Number(it.unitPrice) *
                                (1 + Number(it.taxRate ?? 0) / 100) *
                                (1 - Number(it.discountRate ?? 0) / 100)),
                            sortOrder: idx,
                        })),
                    },
                },
                include: { items: true },
            });
            if (!dto.invoiceNumber) {
                const bs = await this.prisma.businessSettings.findFirst();
                let ext = {};
                try {
                    ext = bs?.description ? JSON.parse(bs.description) : {};
                }
                catch { }
                const prefix = (ext.invoicePrefix ?? 'INV-');
                const suffix = (ext.invoiceSuffix ?? '');
                const width = Number(ext.invoicePad ?? 6);
                const number = `${prefix}${pad(invoice.id, width)}${suffix}`;
                await this.prisma.invoice.update({
                    where: { id: invoice.id },
                    data: { invoiceNumber: number },
                });
                invoice.invoiceNumber = number;
            }
            if (invoice.leadId) {
                try {
                    await this.prisma.activity.create({
                        data: {
                            title: 'Invoice created',
                            description: `Invoice "${invoice.invoiceNumber}" created with total amount ${invoice.currency} ${Number(invoice.totalAmount).toFixed(2)}`,
                            type: 'INVOICE_CREATED',
                            icon: 'FileText',
                            iconColor: '#8B5CF6',
                            metadata: {
                                invoiceId: invoice.id,
                                invoiceNumber: invoice.invoiceNumber,
                                totalAmount: invoice.totalAmount,
                                currency: invoice.currency,
                                status: invoice.status,
                            },
                            userId: invoice.createdBy,
                            leadId: invoice.leadId,
                        },
                    });
                }
                catch (error) {
                    console.error('Error creating invoice activity:', error);
                }
            }
            if (invoice.leadId) {
                try {
                    const lead = await this.prisma.lead.findUnique({
                        where: { id: invoice.leadId },
                        select: { id: true, firstName: true, lastName: true, assignedTo: true },
                    });
                    if (lead?.assignedTo) {
                        await this.notificationsService.create({
                            userId: lead.assignedTo,
                            type: client_1.NotificationType.INVOICE_SENT,
                            title: 'Invoice Created',
                            message: `Invoice "${invoice.invoiceNumber}" has been created for lead "${lead.firstName} ${lead.lastName}".`,
                            link: `/leads/${lead.id}`,
                            metadata: {
                                invoiceId: invoice.id,
                                invoiceNumber: invoice.invoiceNumber,
                                leadId: lead.id,
                            },
                        });
                    }
                }
                catch (error) {
                    console.error('Failed to send invoice created notification:', error);
                }
            }
            return { success: true, data: { invoice } };
        }
        catch (error) {
            console.error('Error creating invoice:', error);
            throw error;
        }
    }
    async update(id, dto) {
        const invoice = await this.prisma.invoice.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                status: dto.status,
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
    async remove(id) {
        await this.prisma.invoice.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { success: true };
    }
    async addItem(id, dto) {
        const item = await this.prisma.invoiceItem.create({
            data: {
                invoiceId: id,
                productId: dto.productId ?? null,
                name: dto.name,
                description: dto.description ?? null,
                quantity: dto.quantity,
                unit: dto.unit ?? 'pcs',
                unitPrice: dto.unitPrice,
                taxRate: dto.taxRate ?? 0,
                discountRate: dto.discountRate ?? 0,
                subtotal: (Number(dto.quantity) * Number(dto.unitPrice)),
                totalAmount: (Number(dto.quantity) *
                    Number(dto.unitPrice) *
                    (1 + Number(dto.taxRate ?? 0) / 100) *
                    (1 - Number(dto.discountRate ?? 0) / 100)),
            },
        });
        await this.recalcTotals(id);
        return { success: true, data: { item } };
    }
    async updateItem(itemId, dto) {
        const item = await this.prisma.invoiceItem.update({
            where: { id: itemId },
            data: {
                productId: dto.productId ?? undefined,
                name: dto.name,
                description: dto.description,
                quantity: dto.quantity,
                unit: dto.unit,
                unitPrice: dto.unitPrice,
                taxRate: dto.taxRate,
                discountRate: dto.discountRate,
                subtotal: dto.quantity !== undefined && dto.unitPrice !== undefined
                    ? (Number(dto.quantity) * Number(dto.unitPrice))
                    : undefined,
                totalAmount: dto.quantity !== undefined && dto.unitPrice !== undefined
                    ? (Number(dto.quantity) *
                        Number(dto.unitPrice) *
                        (1 + Number(dto.taxRate ?? 0) / 100) *
                        (1 - Number(dto.discountRate ?? 0) / 100))
                    : undefined,
                updatedAt: new Date(),
            },
        });
        await this.recalcTotals(item.invoiceId);
        return { success: true, data: { item } };
    }
    async removeItem(itemId) {
        const item = await this.prisma.invoiceItem.delete({
            where: { id: itemId },
        });
        await this.recalcTotals(item.invoiceId);
        return { success: true };
    }
    async recalcTotals(invoiceId) {
        const items = await this.prisma.invoiceItem.findMany({
            where: { invoiceId },
        });
        const totals = this.calcTotals(items.map((i) => ({
            quantity: Number(i.quantity),
            unitPrice: Number(i.unitPrice),
            taxRate: Number(i.taxRate),
            discountRate: Number(i.discountRate),
        })));
        await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                subtotal: totals.subtotal,
                taxAmount: totals.taxAmount,
                discountAmount: totals.discountAmount,
                totalAmount: totals.totalAmount,
            },
        });
    }
    async markSent(id) {
        const invoice = await this.prisma.invoice.update({
            where: { id },
            data: { status: 'SENT', sentAt: new Date() },
        });
        if (invoice.leadId) {
            try {
                const lead = await this.prisma.lead.findUnique({
                    where: { id: invoice.leadId },
                    select: { id: true, firstName: true, lastName: true, assignedTo: true },
                });
                if (lead?.assignedTo) {
                    await this.notificationsService.create({
                        userId: lead.assignedTo,
                        type: client_1.NotificationType.INVOICE_SENT,
                        title: 'Invoice Sent',
                        message: `Invoice "${invoice.invoiceNumber}" has been sent for lead "${lead.firstName} ${lead.lastName}".`,
                        link: `/leads/${lead.id}`,
                        metadata: {
                            invoiceId: invoice.id,
                            invoiceNumber: invoice.invoiceNumber,
                            leadId: lead.id,
                        },
                    });
                }
            }
            catch (error) {
                console.error('Failed to send invoice sent notification:', error);
            }
        }
        if (invoice.leadId) {
            try {
                await this.prisma.activity.create({
                    data: {
                        title: 'Invoice Sent',
                        description: `Invoice "${invoice.invoiceNumber}" has been sent.`,
                        type: 'INVOICE_SENT',
                        icon: 'Send',
                        iconColor: '#10B981',
                        metadata: {
                            invoiceId: invoice.id,
                            invoiceNumber: invoice.invoiceNumber,
                        },
                        userId: invoice.createdBy,
                        leadId: invoice.leadId,
                    },
                });
            }
            catch (error) {
                console.error('Error creating invoice sent activity:', error);
            }
        }
        return { success: true, data: { invoice } };
    }
    async recordPayment(id, dto) {
        const invoice = await this.prisma.invoice.findUnique({ where: { id } });
        if (!invoice)
            return { success: false, message: 'Invoice not found' };
        const payment = await this.prisma.payment.create({
            data: {
                invoiceId: id,
                amount: dto.amount,
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
        let status = invoice.status;
        if (paidAmount <= 0)
            status = 'SENT';
        else if (paidAmount < Number(invoice.totalAmount))
            status = 'PARTIALLY_PAID';
        else
            status = 'PAID';
        await this.prisma.invoice.update({
            where: { id },
            data: {
                paidAmount: paidAmount,
                status,
                paidAt: status === 'PAID' ? new Date() : undefined,
            },
        });
        if (invoice.leadId) {
            try {
                const lead = await this.prisma.lead.findUnique({
                    where: { id: invoice.leadId },
                    select: { id: true, firstName: true, lastName: true, assignedTo: true },
                });
                if (lead?.assignedTo) {
                    const type = status === 'PAID'
                        ? client_1.NotificationType.PAYMENT_ADDED
                        : client_1.NotificationType.PAYMENT_UPDATED;
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
                        },
                    });
                }
            }
            catch (error) {
                console.error('Failed to send payment notification:', error);
            }
        }
        if (invoice.leadId) {
            try {
                await this.prisma.activity.create({
                    data: {
                        title: status === 'PAID' ? 'Invoice Paid' : 'Payment Recorded',
                        description: `Payment of ${payment.currency} ${Number(payment.amount).toFixed(2)} recorded for Invoice "${invoice.invoiceNumber}".`,
                        type: 'INVOICE_UPDATED',
                        icon: 'CreditCard',
                        iconColor: '#F59E0B',
                        metadata: {
                            invoiceId: invoice.id,
                            invoiceNumber: invoice.invoiceNumber,
                            paymentId: payment.id,
                            amount: payment.amount,
                        },
                        userId: dto.createdBy ?? invoice.createdBy,
                        leadId: invoice.leadId,
                    },
                });
            }
            catch (error) {
                console.error('Error creating payment activity:', error);
            }
        }
        return { success: true, data: { payment } };
    }
    async buildPdf(id) {
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
            if (!invoice)
                throw new Error('Invoice not found');
            const bs = await this.prisma.businessSettings.findFirst();
            let ext = {};
            try {
                ext = bs?.description ? JSON.parse(bs.description) : {};
            }
            catch { }
            const templateId = bs?.invoiceTemplate || 'template1';
            console.log(`Using invoice template: ${templateId}`);
            let primaryColor = '#2563EB';
            let secondaryColor = '#DBEAFE';
            switch (templateId) {
                case 'professional':
                case 'bold-header':
                case 'template3':
                    primaryColor = '#EA580C';
                    secondaryColor = '#FFF7ED';
                    break;
                case 'minimalist':
                case 'template5':
                    primaryColor = '#111827';
                    secondaryColor = '#F3F4F6';
                    break;
                case 'classic-right':
                case 'template2':
                    primaryColor = '#3730A3';
                    secondaryColor = '#EEF2FF';
                    break;
            }
            return new Promise((resolve, reject) => {
                const doc = new PDFDocument({ size: 'A4', margin: 40 });
                const chunks = [];
                doc.on('data', (c) => chunks.push(c));
                doc.on('error', (err) => reject(err));
                doc.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    resolve({ buffer, filename: `invoice-${invoice.invoiceNumber}.pdf` });
                });
                const companyName = bs?.companyName || 'Your Company';
                const companyAddress = bs?.companyAddress || '';
                const companyEmail = bs?.companyEmail || '';
                const companyPhone = bs?.companyPhone || '';
                const companyWebsite = bs?.companyWebsite || '';
                const gstNo = bs?.gstNumber || 'N/A';
                const panNo = bs?.panNumber || 'N/A';
                const cinNo = bs?.cinNumber || 'N/A';
                const customerName = invoice.lead
                    ? `${invoice.lead.firstName || ''} ${invoice.lead.lastName || ''}`.trim() || invoice.lead.company || 'N/A'
                    : invoice.deal
                        ? invoice.deal.title || 'N/A'
                        : 'N/A';
                const customerPhone = invoice.lead?.phone || 'N/A';
                const customerAddress = invoice.lead?.address || invoice.lead?.city || '';
                const customerCompany = invoice.lead?.company || '';
                const numberToWords = (num) => {
                    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
                    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
                    if ((num = num.toString()).length > 9)
                        return 'overflow';
                    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
                    if (!n)
                        return '';
                    let str = '';
                    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
                    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
                    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
                    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
                    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
                    return str.trim();
                };
                const pad = (num, size) => {
                    let s = num + "";
                    while (s.length < size)
                        s = "0" + s;
                    return s;
                };
                const drawLogo = (x, y, width) => {
                    if (!bs?.companyLogo)
                        return false;
                    try {
                        if (bs.companyLogo.startsWith('data:image')) {
                            const base64Data = bs.companyLogo.split(';base64,').pop();
                            if (base64Data) {
                                const imgBuffer = Buffer.from(base64Data, 'base64');
                                doc.image(imgBuffer, x, y, { width: width });
                                return true;
                            }
                        }
                        else {
                            const uploadsDir = path.join(process.cwd(), 'uploads');
                            const logoPath = path.join(uploadsDir, bs.companyLogo);
                            if (fs.existsSync(logoPath)) {
                                doc.image(logoPath, x, y, { width: width });
                                return true;
                            }
                        }
                    }
                    catch (e) {
                        console.error('Error drawing logo:', e);
                    }
                    return false;
                };
                const drawNotesAndTerms = (startY) => {
                    let currentY = startY + 30;
                    if (invoice.notes) {
                        if (currentY > 700) {
                            doc.addPage();
                            currentY = 50;
                        }
                        doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('NOTES', 40, currentY);
                        currentY += 15;
                        doc.fontSize(9).font('Helvetica').fillColor('#374151').text(invoice.notes, 40, currentY, { width: 515, lineGap: 2 });
                        currentY += doc.heightOfString(invoice.notes, { width: 515 }) + 20;
                    }
                    if (invoice.terms) {
                        if (currentY > 700) {
                            doc.addPage();
                            currentY = 50;
                        }
                        doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('TERMS & CONDITIONS', 40, currentY);
                        currentY += 15;
                        doc.fontSize(8).font('Helvetica').fillColor('gray').text(invoice.terms, 40, currentY, { width: 515, lineGap: 1 });
                        currentY += doc.heightOfString(invoice.terms, { width: 515 }) + 20;
                    }
                    return currentY;
                };
                if (templateId === 'professional') {
                    doc.rect(0, 0, 595, 15).fill(primaryColor);
                    const leftX = 40;
                    let headerY = 50;
                    const logoWidth = 90;
                    const logoDrawn = drawLogo(leftX, headerY, logoWidth);
                    doc.fontSize(32).font('Helvetica-Bold').fillColor('#111827').text('INVOICE', 350, headerY, { align: 'right', characterSpacing: 1 });
                    doc.fontSize(12).font('Helvetica').fillColor('gray').text(`${invoice.invoiceNumber}`, 350, headerY + 35, { align: 'right' });
                    if (logoDrawn)
                        headerY += 80;
                    else
                        headerY += 20;
                    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827').text(companyName.toUpperCase(), leftX, headerY);
                    let leftY = headerY + 18;
                    doc.fontSize(9).font('Helvetica').fillColor('gray');
                    if (companyAddress) {
                        doc.text(companyAddress, leftX, leftY, { width: 220 });
                        leftY += doc.heightOfString(companyAddress, { width: 220 }) + 5;
                    }
                    if (companyPhone) {
                        doc.text(`Phone: ${companyPhone}`, leftX, leftY);
                        leftY += 14;
                    }
                    if (companyEmail) {
                        doc.text(`Email: ${companyEmail}`, leftX, leftY);
                        leftY += 14;
                    }
                    if (gstNo && gstNo !== 'N/A') {
                        doc.rect(leftX, leftY - 2, 180, 16).fill(secondaryColor);
                        doc.fillColor(primaryColor).font('Helvetica-Bold').text(`GSTIN: ${gstNo}`, leftX + 5, leftY + 2);
                        leftY += 20;
                    }
                    if (panNo && panNo !== 'N/A') {
                        doc.fontSize(8).font('Helvetica').fillColor('gray').text(`PAN: ${panNo}`, leftX, leftY);
                        leftY += 12;
                    }
                    if (cinNo && cinNo !== 'N/A') {
                        doc.fontSize(8).font('Helvetica').fillColor('gray').text(`CIN: ${cinNo}`, leftX, leftY);
                        leftY += 12;
                    }
                    let rightY = headerY;
                    const metaBoxX = 380;
                    doc.rect(metaBoxX, rightY, 175, 75).strokeColor('#E5E7EB').stroke();
                    const drawMeta = (label, value, y, isLast = false) => {
                        doc.fontSize(8).font('Helvetica-Bold').fillColor('gray').text(label.toUpperCase(), metaBoxX + 10, y + 10);
                        doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827').text(value, metaBoxX + 10, y + 25);
                        if (!isLast)
                            doc.moveTo(metaBoxX, y + 42).lineTo(metaBoxX + 175, y + 42).strokeColor('#F3F4F6').stroke();
                    };
                    drawMeta('Date of Issue', new Date(invoice.createdAt).toLocaleDateString(), rightY);
                    drawMeta('Due Date', invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A', rightY + 35, true);
                    const billToY = Math.max(leftY + 40, rightY + 100);
                    doc.rect(leftX, billToY, 515, 25).fill(secondaryColor);
                    doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryColor).text('BILL TO', leftX + 10, billToY + 8);
                    let billY = billToY + 35;
                    doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827').text(customerName, leftX + 10, billY);
                    billY += 18;
                    doc.fontSize(9).font('Helvetica').fillColor('gray');
                    if (customerCompany) {
                        doc.text(customerCompany, leftX + 10, billY);
                        billY += 14;
                    }
                    if (customerAddress) {
                        doc.text(customerAddress, leftX + 10, billY, { width: 250 });
                        billY += doc.heightOfString(customerAddress, { width: 250 }) + 5;
                    }
                    if (customerPhone !== 'N/A') {
                        doc.text(`Phone: ${customerPhone}`, leftX + 10, billY);
                        billY += 14;
                    }
                    const tableTop = billY + 30;
                    const tableWidth = 515;
                    const cols = {
                        name: { x: leftX, width: 280 },
                        qty: { x: leftX + 290, width: 40 },
                        rate: { x: leftX + 340, width: 80 },
                        total: { x: leftX + 430, width: 85 }
                    };
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
                        if (rowY + itemHeight > 750) {
                            doc.addPage();
                            rowY = 50;
                        }
                        if (idx % 2 !== 0)
                            doc.rect(leftX, rowY, tableWidth, itemHeight).fill('#F9FAFB');
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
                    rowY += 20;
                    if (rowY > 650) {
                        doc.addPage();
                        rowY = 50;
                    }
                    const totalsX = 350;
                    const drawTotalRow = (label, value, isFinal = false) => {
                        doc.fontSize(9).font(isFinal ? 'Helvetica-Bold' : 'Helvetica').fillColor(isFinal ? '#111827' : 'gray').text(label, totalsX, rowY);
                        doc.fontSize(isFinal ? 14 : 10).font('Helvetica-Bold').fillColor(isFinal ? primaryColor : '#111827').text(value, totalsX + 100, rowY, { width: 105, align: 'right' });
                        rowY += isFinal ? 30 : 20;
                    };
                    drawTotalRow('Subtotal', Number(invoice.subtotal).toFixed(2));
                    if (Number(invoice.discountAmount) > 0)
                        drawTotalRow('Discount', `- ${Number(invoice.discountAmount).toFixed(2)}`);
                    if (Number(invoice.taxAmount) > 0)
                        drawTotalRow('Tax', Number(invoice.taxAmount).toFixed(2));
                    doc.rect(totalsX, rowY - 5, 205, 1).fill('#E5E7EB');
                    rowY += 10;
                    drawTotalRow('Total Amount', `${invoice.currency} ${Number(invoice.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, true);
                    drawNotesAndTerms(rowY);
                }
                else if (templateId === 'minimalist' || templateId === 'template5') {
                    const centerX = 297;
                    const logoWidth = 60;
                    const logoDrawn = drawLogo(centerX - (logoWidth / 2), 40, logoWidth);
                    let centerStackY = logoDrawn ? 110 : 60;
                    doc.fillColor('#111827').fontSize(24).font('Helvetica-Bold').text('INVOICE', 0, centerStackY, { align: 'center', characterSpacing: 2 });
                    centerStackY += 35;
                    doc.fontSize(10).font('Helvetica').fillColor('gray').text(companyName.toUpperCase(), 0, centerStackY, { align: 'center' });
                    centerStackY += 20;
                    doc.rect(centerX - 30, centerStackY, 60, 1).fill('#111827');
                    const detailsY = centerStackY + 50;
                    const colWidth = 200;
                    doc.fontSize(8).font('Helvetica-Bold').fillColor('gray').text('BILLED TO', 50, detailsY);
                    doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827').text(customerName, 50, detailsY + 15);
                    let billY = detailsY + 32;
                    doc.fontSize(9).font('Helvetica').fillColor('gray');
                    if (customerAddress) {
                        doc.text(customerAddress, 50, billY, { width: colWidth });
                        billY += doc.heightOfString(customerAddress, { width: colWidth }) + 5;
                    }
                    if (customerPhone !== 'N/A') {
                        doc.text(customerPhone, 50, billY);
                    }
                    doc.fontSize(8).font('Helvetica-Bold').fillColor('gray').text('INVOICE INFO', 400, detailsY, { align: 'right' });
                    doc.fontSize(10).font('Courier-Bold').fillColor('#111827').text(invoice.invoiceNumber, 400, detailsY + 15, { align: 'right' });
                    doc.fontSize(9).font('Courier').fillColor('gray').text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 400, detailsY + 30, { align: 'right' });
                    doc.fillColor('#DC2626').text(`Due: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}`, 400, detailsY + 45, { align: 'right' });
                    const tableY = Math.max(billY + 40, detailsY + 80);
                    doc.moveTo(50, tableY).lineTo(545, tableY).lineWidth(1).stroke('#000');
                    doc.fontSize(8).font('Helvetica-Bold').fillColor('#111827');
                    doc.text('ITEM', 50, tableY + 10);
                    doc.text('QTY', 350, tableY + 10, { align: 'center', width: 50 });
                    doc.text('TOTAL', 480, tableY + 10, { align: 'right', width: 65 });
                    let rowY = tableY + 30;
                    doc.font('Helvetica').fontSize(10);
                    invoice.items.forEach(item => {
                        if (rowY > 700) {
                            doc.addPage();
                            rowY = 50;
                        }
                        doc.fillColor('#111827').font('Helvetica-Bold').text(item.name, 50, rowY);
                        doc.fontSize(8).font('Helvetica').fillColor('gray').text(item.description || '', 50, rowY + 12, { width: 280, height: 10 });
                        doc.fontSize(10).font('Courier').fillColor('#111827').text(String(item.quantity), 350, rowY, { align: 'center', width: 50 });
                        doc.font('Helvetica-Bold').text(Number(item.totalAmount).toFixed(2), 480, rowY, { align: 'right', width: 65 });
                        doc.moveTo(50, rowY + 25).lineTo(545, rowY + 25).lineWidth(0.5).stroke('#F3F4F6');
                        rowY += 35;
                    });
                    rowY += 20;
                    if (rowY > 650) {
                        doc.addPage();
                        rowY = 50;
                    }
                    doc.fontSize(8).font('Helvetica-Bold').fillColor('gray').text('TOTAL AMOUNT', 400, rowY, { align: 'right', width: 145 });
                    doc.fontSize(24).font('Helvetica-Bold').fillColor('#111827').text(`${invoice.currency} ${Number(invoice.totalAmount).toFixed(2)}`, 350, rowY + 15, { align: 'right', width: 195 });
                    drawNotesAndTerms(rowY + 60);
                }
                else if (templateId === 'bold-header' || templateId === 'template3') {
                    const accentColor = '#059669';
                    doc.rect(0, 0, 595, 120).fill('#F9FAFB');
                    doc.moveTo(0, 120).lineTo(595, 120).strokeColor('#E5E7EB').stroke();
                    const headerY = 40;
                    const logoDrawn = drawLogo(30, headerY - 10, 60);
                    let leftOff = logoDrawn ? 100 : 30;
                    doc.fontSize(18).font('Helvetica-Bold').fillColor('#111827').text(companyName, leftOff, headerY);
                    doc.fontSize(9).font('Helvetica').fillColor('gray').text(companyAddress || '', leftOff, headerY + 22, { width: 250 });
                    doc.fontSize(8).font('Helvetica-Bold').fillColor(accentColor).text('BILL TO', 400, headerY, { align: 'right' });
                    doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827').text(customerName, 350, headerY + 15, { align: 'right', width: 215 });
                    doc.fontSize(9).font('Helvetica').fillColor('gray').text(customerAddress || '', 350, headerY + 30, { align: 'right', width: 215 });
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
                        if (rowY > 700) {
                            doc.addPage();
                            rowY = 50;
                        }
                        doc.fillColor('#9CA3AF').text(String(idx + 1).padStart(2, '0'), 30, rowY, { width: 30, align: 'center' });
                        doc.fillColor('#111827').font('Helvetica-Bold').text(item.name, 70, rowY);
                        doc.text(String(item.quantity), 430, rowY, { width: 40, align: 'center' });
                        doc.text(Number(item.totalAmount).toFixed(2), 490, rowY, { width: 75, align: 'right' });
                        doc.moveTo(30, rowY + 18).lineTo(565, rowY + 18).strokeColor('#F3F4F6').lineWidth(0.5).stroke();
                        rowY += 28;
                    });
                    const totalY = rowY + 20;
                    if (totalY > 650) {
                        doc.addPage();
                        rowY = 50;
                    }
                    doc.fontSize(10).font('Helvetica-Bold').fillColor('#9CA3AF').text('TOTAL DUE', 380, totalY + 15);
                    doc.fontSize(24).font('Helvetica-Bold').fillColor(accentColor).text(`${invoice.currency} ${Number(invoice.totalAmount).toFixed(2)}`, 350, totalY + 30, { align: 'right', width: 215 });
                    drawNotesAndTerms(totalY + 70);
                }
                else if (templateId === 'classic-right' || templateId === 'template2') {
                    const primaryAccent = '#00897B';
                    const secondaryAccent = '#E0F2F1';
                    const darkText = '#1F2937';
                    const grayText = '#6B7280';
                    doc.fontSize(32).font('Helvetica-Bold').fillColor(primaryAccent).text('INVOICE', 40, 45);
                    doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText).text(`# ${invoice.invoiceNumber}`, 40, 85);
                    doc.font('Helvetica').fillColor(grayText).fontSize(9);
                    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 40, 100);
                    if (invoice.dueDate)
                        doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 40, 115);
                    const rightColX = 350;
                    let companyY = 45;
                    const logoDrawn = drawLogo(450, 40, 100);
                    if (logoDrawn)
                        companyY += 80;
                    else
                        companyY += 10;
                    doc.fontSize(14).font('Helvetica-Bold').fillColor(darkText).text(companyName.toUpperCase(), rightColX, companyY, { align: 'right', width: 205 });
                    companyY += 20;
                    doc.fontSize(9).font('Helvetica').fillColor(grayText);
                    if (companyAddress) {
                        doc.text(companyAddress, rightColX, companyY, { align: 'right', width: 205 });
                        companyY += doc.heightOfString(companyAddress, { width: 205 }) + 5;
                    }
                    if (companyPhone) {
                        doc.text(companyPhone, rightColX, companyY, { align: 'right', width: 205 });
                        companyY += 12;
                    }
                    if (companyEmail) {
                        doc.text(companyEmail, rightColX, companyY, { align: 'right', width: 205 });
                        companyY += 12;
                    }
                    if (gstNo && gstNo !== 'N/A') {
                        doc.text(`GSTIN: ${gstNo}`, rightColX, companyY, { align: 'right', width: 205 });
                        companyY += 12;
                    }
                    if (panNo && panNo !== 'N/A') {
                        doc.text(`PAN: ${panNo}`, rightColX, companyY, { align: 'right', width: 205 });
                        companyY += 12;
                    }
                    if (cinNo && cinNo !== 'N/A') {
                        doc.text(`CIN: ${cinNo}`, rightColX, companyY, { align: 'right', width: 205 });
                    }
                    const billSectionY = Math.max(160, companyY + 40);
                    doc.rect(40, billSectionY, 515, 25).fill(primaryAccent);
                    doc.fillColor('white').fontSize(10).font('Helvetica-Bold').text('INVOICE TO', 50, billSectionY + 8);
                    const clientY = billSectionY + 35;
                    doc.fillColor(darkText).fontSize(12).font('Helvetica-Bold').text(customerName, 40, clientY);
                    let clientAddrY = clientY + 18;
                    doc.fontSize(10).font('Helvetica').fillColor(grayText);
                    if (customerCompany) {
                        doc.text(customerCompany, 40, clientAddrY);
                        clientAddrY += 14;
                    }
                    if (customerAddress) {
                        doc.text(customerAddress, 40, clientAddrY, { width: 300 });
                        clientAddrY += doc.heightOfString(customerAddress, { width: 300 }) + 5;
                    }
                    const tableHeaderY = billSectionY + 90;
                    doc.rect(40, tableHeaderY, 515, 25).fill(primaryAccent);
                    doc.fillColor('white').fontSize(9).font('Helvetica-Bold');
                    const colX = { desc: 50, price: 340, qty: 420, total: 470 };
                    doc.text('DESCRIPTION', colX.desc, tableHeaderY + 8);
                    doc.text('PRICE', colX.price, tableHeaderY + 8, { width: 70, align: 'right' });
                    doc.text('QTY', colX.qty, tableHeaderY + 8, { width: 40, align: 'center' });
                    doc.text('TOTAL', colX.total, tableHeaderY + 8, { width: 75, align: 'right' });
                    let rowY = tableHeaderY + 30;
                    doc.font('Helvetica').fontSize(10).fillColor(darkText);
                    invoice.items.forEach((item, index) => {
                        if (rowY > 720) {
                            doc.addPage();
                            rowY = 50;
                            doc.rect(40, rowY, 515, 25).fill(primaryAccent);
                            doc.fillColor('white').fontSize(9).font('Helvetica-Bold');
                            doc.text('DESCRIPTION', colX.desc, rowY + 8);
                            doc.text('PRICE', colX.price, rowY + 8, { width: 70, align: 'right' });
                            doc.text('QTY', colX.qty, rowY + 8, { width: 40, align: 'center' });
                            doc.text('TOTAL', colX.total, rowY + 8, { width: 75, align: 'right' });
                            rowY += 30;
                            doc.font('Helvetica').fontSize(10).fillColor(darkText);
                        }
                        if (index % 2 === 0) {
                            doc.rect(40, rowY - 5, 515, 25).fill(secondaryAccent);
                        }
                        doc.fillColor(darkText).text(item.name, colX.desc, rowY, { width: 280 });
                        doc.text(Number(item.unitPrice).toFixed(2), colX.price, rowY, { width: 70, align: 'right' });
                        doc.text(String(item.quantity), colX.qty, rowY, { width: 40, align: 'center' });
                        doc.font('Helvetica-Bold').text(Number(item.totalAmount).toFixed(2), colX.total, rowY, { width: 75, align: 'right' });
                        doc.font('Helvetica');
                        rowY += 25;
                    });
                    rowY += 20;
                    if (rowY > 680) {
                        doc.addPage();
                        rowY = 50;
                    }
                    const totalsX = 350;
                    const totalsValX = 450;
                    const totalsWidth = 100;
                    doc.fontSize(10).fillColor(grayText).text('Subtotal:', totalsX, rowY, { align: 'right', width: 90 });
                    doc.fillColor(darkText).text(Number(invoice.subtotal).toFixed(2), totalsValX, rowY, { align: 'right', width: totalsWidth });
                    rowY += 20;
                    if (Number(invoice.taxAmount) > 0) {
                        doc.fillColor(grayText).text('Tax:', totalsX, rowY, { align: 'right', width: 90 });
                        doc.fillColor(darkText).text(Number(invoice.taxAmount).toFixed(2), totalsValX, rowY, { align: 'right', width: totalsWidth });
                        rowY += 20;
                    }
                    if (Number(invoice.discountAmount) > 0) {
                        doc.fillColor(grayText).text('Discount:', totalsX, rowY, { align: 'right', width: 90 });
                        doc.fillColor('red').text(`- ${Number(invoice.discountAmount).toFixed(2)}`, totalsValX, rowY, { align: 'right', width: totalsWidth });
                        rowY += 20;
                    }
                    rowY += 10;
                    doc.rect(totalsX - 10, rowY - 8, 220, 35).fill(primaryAccent);
                    doc.fillColor('white').fontSize(12).font('Helvetica-Bold');
                    doc.text('Total Due:', totalsX, rowY + 5, { align: 'right', width: 90 });
                    doc.fontSize(14).text(`${invoice.currency} ${Number(invoice.totalAmount).toFixed(2)}`, totalsValX, rowY + 3, { align: 'right', width: totalsWidth });
                    let footerY = rowY + 60;
                    if (footerY > 700) {
                        doc.addPage();
                        footerY = 50;
                    }
                    doc.fontSize(11).font('Helvetica-Bold').fillColor(primaryAccent).text('Payment Information', 40, footerY);
                    doc.fontSize(9).font('Helvetica').fillColor(grayText);
                    footerY += 20;
                    if (bs?.description && bs.description.includes('bankName')) {
                        const bank = JSON.parse(bs.description);
                        doc.text(`Bank: ${bank.bankName || '-'}`, 40, footerY);
                        footerY += 14;
                        doc.text(`Account No: ${bank.accountNumber || '-'}`, 40, footerY);
                        footerY += 14;
                        doc.text(`IFSC/SWIFT: ${bank.ifscCode || '-'}`, 40, footerY);
                    }
                    else {
                        doc.text('Please contact us for payment details.', 40, footerY);
                    }
                    const sigY = footerY;
                    doc.moveTo(380, sigY).lineTo(530, sigY).lineWidth(1).strokeColor(grayText).stroke();
                    doc.fontSize(9).font('Helvetica').fillColor(grayText).text('Authorized Signature', 380, sigY + 10, { align: 'center', width: 150 });
                    drawNotesAndTerms(footerY + 50);
                }
                else if (templateId === 'template1' || templateId === 'standard-left') {
                    const navyColor = '#0F172A';
                    const tealColor = '#2DD4BF';
                    const yellowColor = '#FBBF24';
                    const lightGray = '#F9FAFB';
                    const textGray = '#4B5563';
                    doc.rect(0, 0, 595, 15).fill(navyColor);
                    doc.moveTo(0, 0).lineTo(60, 0).lineTo(0, 60).closePath().fill(tealColor);
                    let headerY = 50;
                    doc.fontSize(44).font('Helvetica-Bold').fillColor('black').text('INVOICE', 40, headerY);
                    const logoWidth = 120;
                    const logoDrawn = drawLogo(440, 45, logoWidth);
                    if (!logoDrawn) {
                        doc.circle(450, 60, 15).fill(yellowColor);
                        doc.fontSize(18).font('Helvetica-Bold').fillColor(navyColor).text(companyName, 470, 52);
                    }
                    headerY += 100;
                    doc.fontSize(14).font('Helvetica-Bold').fillColor('black').text('Bill To:', 40, headerY);
                    let billY = headerY + 25;
                    doc.fontSize(9).font('Helvetica').fillColor(textGray);
                    const details = [
                        ['Client Name:', customerName],
                        ['Company Name:', customerCompany],
                        ['Billing Address:', customerAddress],
                        ['Phone:', customerPhone],
                        ['Email:', invoice.lead?.email || 'N/A']
                    ];
                    details.forEach(([label, value]) => {
                        if (!value || value === 'N/A')
                            return;
                        doc.font('Helvetica-Bold').fillColor('black').text(label, 40, billY);
                        doc.font('Helvetica').fillColor(textGray).text(value, 120, billY, { width: 220 });
                        billY += doc.heightOfString(value, { width: 220 }) + 3;
                    });
                    let metaY = headerY + 25;
                    const metaX = 380;
                    const drawMetaLine = (label, value, y) => {
                        doc.fontSize(9).font('Helvetica-Bold').fillColor('black').text(label, metaX, y);
                        doc.font('Helvetica').fillColor(textGray).text(value, metaX + 80, y, { align: 'right', width: 95 });
                    };
                    drawMetaLine('Invoice Number:', invoice.invoiceNumber, metaY);
                    drawMetaLine('Invoice Date:', new Date(invoice.createdAt).toLocaleDateString(), metaY + 15);
                    if (invoice.dueDate)
                        drawMetaLine('Due Date:', new Date(invoice.dueDate).toLocaleDateString(), metaY + 30);
                    headerY = Math.max(billY, metaY + 50) + 30;
                    doc.fontSize(14).font('Helvetica-Bold').fillColor('black').text('Service Details:', 40, headerY);
                    headerY += 25;
                    const itemsTableWidth = 515;
                    const colX = {
                        no: 40,
                        desc: 75,
                        qty: 290,
                        rate: 380,
                        total: 480
                    };
                    doc.rect(40, headerY, itemsTableWidth, 22).fill(yellowColor);
                    doc.fontSize(9).font('Helvetica-Bold').fillColor('black');
                    doc.text('No', colX.no, headerY + 7, { width: 30, align: 'center' });
                    doc.text('Description of Service', colX.desc + 5, headerY + 7);
                    doc.text('Quantity', colX.qty, headerY + 7, { width: 85, align: 'center' });
                    doc.text(`Rate(${invoice.currency})`, colX.rate, headerY + 7, { width: 95, align: 'right' });
                    doc.text(`Total(${invoice.currency})`, colX.total, headerY + 7, { width: 75, align: 'right' });
                    let rowY = headerY + 22;
                    doc.fontSize(9).font('Helvetica');
                    invoice.items.forEach((item, idx) => {
                        const itemHeight = 25;
                        if (rowY + itemHeight > 750) {
                            doc.addPage();
                            rowY = 40;
                        }
                        if (idx % 2 !== 0)
                            doc.rect(40, rowY, itemsTableWidth, itemHeight).fill(lightGray);
                        doc.fillColor('black');
                        doc.text(String(idx + 1), colX.no, rowY + 8, { width: 30, align: 'center' });
                        doc.text(item.name, colX.desc + 5, rowY + 8, { width: 210, height: 15, ellipsis: true });
                        doc.text(String(item.quantity), colX.qty, rowY + 8, { width: 85, align: 'center' });
                        doc.text(Number(item.unitPrice).toFixed(2), colX.rate, rowY + 8, { width: 95, align: 'right' });
                        doc.font('Helvetica-Bold').text(Number(item.totalAmount).toFixed(2), colX.total, rowY + 8, { width: 75, align: 'right' });
                        doc.font('Helvetica');
                        rowY += itemHeight;
                    });
                    rowY += 20;
                    if (rowY > 700) {
                        doc.addPage();
                        rowY = 40;
                    }
                    const totalLabelX = 350;
                    const totalValX = 480;
                    doc.fontSize(9).font('Helvetica').fillColor(textGray).text('Subtotal', totalLabelX, rowY);
                    doc.text(Number(invoice.subtotal).toFixed(2), totalValX, rowY, { width: 75, align: 'right' });
                    rowY += 18;
                    if (Number(invoice.taxAmount) > 0) {
                        doc.text(`Tax(${invoice.items[0]?.taxRate || 0} %)`, totalLabelX, rowY);
                        doc.text(Number(invoice.taxAmount).toFixed(2), totalValX, rowY, { width: 75, align: 'right' });
                        rowY += 18;
                    }
                    doc.moveTo(totalLabelX, rowY).lineTo(555, rowY).lineWidth(0.5).stroke('#E5E7EB');
                    rowY += 10;
                    doc.fontSize(11).font('Helvetica-Bold').fillColor('black').text('Total Amount Due', totalLabelX, rowY);
                    doc.fontSize(12).text(`${invoice.currency} ${Number(invoice.totalAmount).toFixed(2)} `, totalValX - 25, rowY, { width: 100, align: 'right' });
                    doc.moveTo(totalLabelX, rowY + 18).lineTo(555, rowY + 18).stroke('#E5E7EB');
                    let termsY = rowY - 60;
                    if (termsY < headerY + 50)
                        termsY = rowY + 30;
                    doc.fontSize(12).font('Helvetica-Bold').fillColor('black').text('Terms and Conditions:', 40, termsY);
                    termsY += 18;
                    const termsList = [
                        'Payment is due upon receipt of this invoice.',
                        'Late payments may incur additional charges.',
                        `Please make checks payable to ${companyName}.`
                    ];
                    termsList.forEach(t => {
                        doc.fontSize(8).font('Helvetica').fillColor(textGray).text(`• ${t} `, 45, termsY);
                        termsY += 12;
                    });
                    rowY = Math.max(rowY + 60, termsY + 20);
                    if (rowY > 700) {
                        doc.addPage();
                        rowY = 50;
                    }
                    doc.rect(40, rowY, 515, 25).fill(navyColor);
                    doc.fontSize(11).font('Helvetica-Bold').fillColor('white').text('Payment Information:', 50, rowY + 8);
                    rowY += 35;
                    doc.fontSize(9).font('Helvetica-Bold').fillColor('black');
                    doc.text('Payment Method:', 40, rowY);
                    doc.font('Helvetica').fillColor(textGray).text('Bank Transfer', 120, rowY);
                    rowY += 15;
                    doc.font('Helvetica-Bold').fillColor('black').text('Due Date:', 40, rowY);
                    doc.font('Helvetica').fillColor(textGray).text(invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A', 120, rowY);
                    rowY += 15;
                    if (bs?.description && bs.description.includes('accountNumber')) {
                        try {
                            const bank = JSON.parse(bs.description);
                            doc.font('Helvetica-Bold').fillColor('black').text('Bank Account:', 40, rowY);
                            doc.font('Helvetica').fillColor(textGray).text(`${bank.bankName || ''} - ${bank.accountNumber || ''} `, 120, rowY);
                        }
                        catch { }
                    }
                    else {
                        doc.font('Helvetica-Bold').fillColor('black').text('Bank Account:', 40, rowY);
                        doc.font('Helvetica').fillColor(textGray).text('1234-5678-9012-3456', 120, rowY);
                    }
                    doc.fontSize(10).font('Helvetica-Bold').fillColor('black').text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()} `, 400, rowY - 15);
                    rowY += 40;
                    doc.fontSize(12).font('Helvetica-Bold').text('Questions', 40, rowY);
                    rowY += 20;
                    doc.fontSize(9).font('Helvetica-Bold').text('Email US:', 40, rowY);
                    doc.font('Helvetica').fillColor(textGray).text(companyEmail || 'N/A', 90, rowY);
                    rowY += 13;
                    doc.font('Helvetica-Bold').fillColor('black').text('Call US:', 40, rowY);
                    doc.font('Helvetica').fillColor(textGray).text(companyPhone || 'N/A', 90, rowY);
                    const signatureX = 400;
                    doc.moveTo(signatureX, rowY).lineTo(signatureX + 130, rowY).lineWidth(0.5).stroke('#E5E7EB');
                    doc.fontSize(10).font('Helvetica-Bold').fillColor(navyColor).text(companyName, signatureX, rowY - 25, { width: 130, align: 'center' });
                    doc.fontSize(9).font('Helvetica').fillColor(textGray).text('Authorised Signature', signatureX, rowY + 5, { width: 130, align: 'center' });
                    doc.moveTo(595, 842).lineTo(540, 842).lineTo(595, 787).closePath().fill(tealColor);
                }
                else {
                    const leftX = 40;
                    let headerY = 50;
                    doc.rect(0, 0, 595, 80).fill(secondaryColor);
                    const logoDrawn = drawLogo(leftX, 20, 50);
                    doc.fontSize(24).font('Helvetica-Bold').fillColor(primaryColor).text('INVOICE', 350, 25, { align: 'right', characterSpacing: 1 });
                    doc.fontSize(10).font('Helvetica').fillColor('#4B5563').text(`# ${invoice.invoiceNumber} `, 350, 55, { align: 'right' });
                    headerY = 100;
                    doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827').text(companyName.toUpperCase(), leftX, headerY);
                    let leftY = headerY + 18;
                    doc.fontSize(9).font('Helvetica').fillColor('gray');
                    if (companyAddress) {
                        doc.text(companyAddress, leftX, leftY);
                        leftY += 14;
                    }
                    if (companyEmail) {
                        doc.text(companyEmail, leftX, leftY);
                        leftY += 14;
                    }
                    if (gstNo && gstNo !== 'N/A') {
                        doc.text(`GSTIN: ${gstNo} `, leftX, leftY);
                        leftY += 12;
                    }
                    if (panNo && panNo !== 'N/A') {
                        doc.text(`PAN: ${panNo} `, leftX, leftY);
                        leftY += 12;
                    }
                    if (cinNo && cinNo !== 'N/A') {
                        doc.text(`CIN: ${cinNo} `, leftX, leftY);
                        leftY += 12;
                    }
                    const billX = 350;
                    doc.fontSize(8).font('Helvetica-Bold').fillColor(primaryColor).text('BILL TO', billX, headerY);
                    doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827').text(customerName, billX, headerY + 15);
                    let billRY = headerY + 30;
                    doc.fontSize(9).font('Helvetica').fillColor('gray');
                    if (customerCompany) {
                        doc.text(customerCompany, billX, billRY);
                        billRY += 12;
                    }
                    if (customerAddress) {
                        doc.text(customerAddress, billX, billRY, { width: 200 });
                        billRY += 25;
                    }
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
                    doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor).text(`${invoice.currency} ${Number(invoice.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} `, 450, rowY - 5, { align: 'right', width: 105 });
                    drawNotesAndTerms(rowY + 40);
                }
                const footerY = 750;
                doc.fontSize(8).font('Helvetica').fillColor('#9CA3AF');
                doc.text('Thank you for your business!', 30, footerY, { align: 'center', width: 535 });
                if (companyEmail)
                    doc.text(companyEmail, 30, footerY + 12, { align: 'center', width: 535 });
                doc.end();
            });
        }
        catch (error) {
            console.error('Error generating invoice PDF:', error);
            throw error;
        }
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map