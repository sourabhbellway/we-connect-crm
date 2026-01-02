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
exports.QuotationsService = void 0;
const common_1 = require("@nestjs/common");
const PDFDocument = require('pdfkit');
const prisma_service_1 = require("../../database/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const client_1 = require("@prisma/client");
const permission_util_1 = require("../../common/utils/permission.util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pad = (num, size) => String(num).padStart(size, '0');
let QuotationsService = class QuotationsService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    numberToWords(num) {
        const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        if (num === 0)
            return 'Zero';
        if (num < 0)
            return 'Minus ' + this.numberToWords(Math.abs(num));
        let words = '';
        if (num >= 10000000) {
            words += this.numberToWords(Math.floor(num / 10000000)) + ' Crore ';
            num %= 10000000;
        }
        if (num >= 100000) {
            words += this.numberToWords(Math.floor(num / 100000)) + ' Lakh ';
            num %= 100000;
        }
        if (num >= 1000) {
            words += this.numberToWords(Math.floor(num / 1000)) + ' Thousand ';
            num %= 1000;
        }
        if (num >= 100) {
            words += this.numberToWords(Math.floor(num / 100)) + ' Hundred ';
            num %= 100;
        }
        if (num > 0) {
            if (num < 20) {
                words += a[num];
            }
            else {
                words += b[Math.floor(num / 10)];
                if (num % 10 > 0) {
                    words += ' ' + a[num % 10];
                }
            }
        }
        return words.trim() + ' Only';
    }
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
                { quotationNumber: { contains: q, mode: 'insensitive' } },
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
        const quotation = await this.prisma.quotation.findFirst({
            where,
            include: { items: true, lead: true, deal: true, companies: true },
        });
        if (!quotation)
            return { success: false, message: 'Quotation not found' };
        return { success: true, data: { quotation } };
    }
    async getNextNumber() {
        const bs = await this.prisma.businessSettings.findFirst();
        let ext = {};
        try {
            ext = bs?.description ? JSON.parse(bs.description) : {};
        }
        catch { }
        const prefix = (ext.quotePrefix ?? 'Q-');
        const suffix = (ext.quoteSuffix ?? '');
        const width = Number(ext.quotePad ?? 6);
        const lastQuotation = await this.prisma.quotation.findFirst({
            orderBy: { id: 'desc' },
        });
        const nextId = (lastQuotation?.id || 0) + 1;
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
            console.log('--- START QUOTATION CREATION ---');
            console.log('DTO:', JSON.stringify(dto, null, 2));
            const totals = this.calcTotals(dto.items || []);
            console.log('Calculated Totals:', totals);
            const bs = await this.prisma.businessSettings.findFirst();
            let ext = {};
            try {
                ext = bs?.description ? JSON.parse(bs.description) : {};
            }
            catch { }
            let number = dto.quotationNumber;
            if (!number) {
                const prefix = (ext.quotePrefix ?? 'Q-');
                const width = Number(ext.quotePad ?? 6);
                const lastQuotation = await this.prisma.quotation.findFirst({ orderBy: { id: 'desc' } });
                const nextId = (lastQuotation?.id || 0) + 1;
                number = `${prefix}${pad(nextId, width)}`;
            }
            console.log('Quotation Number:', number);
            const termsFinal = dto.terms ?? ext.defaultTerms ?? '';
            console.log('Creating quotation record...');
            const quotation = await this.prisma.quotation.create({
                data: {
                    quotationNumber: number,
                    title: dto.title,
                    description: dto.description ?? null,
                    status: dto.status ?? 'DRAFT',
                    subtotal: totals.subtotal,
                    taxAmount: totals.taxAmount,
                    discountAmount: dto.discountAmount ?? totals.discountAmount,
                    totalAmount: totals.totalAmount,
                    currency: dto.currency ?? 'USD',
                    validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
                    notes: dto.notes ?? null,
                    terms: termsFinal,
                    leadId: dto.leadId ?? null,
                    dealId: dto.dealId ?? null,
                    companyId: dto.companyId ?? null,
                    createdBy: dto.createdBy ?? 1,
                    items: {
                        create: (dto.items || []).map((it, idx) => ({
                            productId: it.productId ? Number(it.productId) : null,
                            name: it.name,
                            description: it.description ?? null,
                            quantity: it.quantity,
                            unit: it.unit ?? 'pcs',
                            unitPrice: it.unitPrice,
                            taxRate: it.taxRate ?? 0,
                            discountRate: it.discountRate ?? 0,
                            subtotal: (Number(it.quantity) * Number(it.unitPrice)),
                            totalAmount: (Number(it.quantity) * Number(it.unitPrice) *
                                (1 + Number(it.taxRate ?? 0) / 100) *
                                (1 - Number(it.discountRate ?? 0) / 100)),
                            sortOrder: idx,
                        })),
                    },
                },
                include: { items: true },
            });
            console.log('Quotation record created successfully:', quotation.id);
            if (quotation.leadId) {
                try {
                    await this.prisma.activity.create({
                        data: {
                            title: 'Quotation created',
                            description: `Quotation "${quotation.quotationNumber}" created with total amount ${quotation.currency} ${Number(quotation.totalAmount).toFixed(2)}`,
                            type: 'QUOTATION_CREATED',
                            icon: 'FileText',
                            iconColor: '#10B981',
                            metadata: {
                                quotationId: quotation.id,
                                quotationNumber: quotation.quotationNumber,
                                totalAmount: Number(quotation.totalAmount),
                                currency: quotation.currency,
                            },
                            userId: quotation.createdBy,
                            leadId: quotation.leadId,
                        },
                    });
                    console.log('Activity record created');
                }
                catch (err) {
                    console.error('Failed to create quotation activity:', err);
                }
            }
            if (quotation.leadId) {
                try {
                    const lead = await this.prisma.lead.findUnique({
                        where: { id: quotation.leadId },
                        select: { id: true, firstName: true, lastName: true, assignedTo: true },
                    });
                    if (lead?.assignedTo) {
                        await this.notificationsService.create({
                            userId: lead.assignedTo,
                            type: client_1.NotificationType.QUOTATION_SENT,
                            title: 'Quotation Created',
                            message: `Quotation "${quotation.quotationNumber}" has been created for lead "${lead.firstName} ${lead.lastName}".`,
                            link: `/leads/${lead.id}`,
                            metadata: {
                                quotationId: quotation.id,
                                quotationNumber: quotation.quotationNumber,
                                leadId: lead.id,
                            },
                        });
                        console.log('Notification sent to user:', lead.assignedTo);
                    }
                }
                catch (err) {
                    console.error('Failed to send quotation notification:', err);
                }
            }
            console.log('--- END QUOTATION CREATION (SUCCESS) ---');
            return { success: true, data: quotation };
        }
        catch (error) {
            console.error('--- CRITICAL ERROR IN QUOTATION CREATION ---');
            console.error(error);
            throw error;
        }
    }
    async update(id, dto) {
        const quotation = await this.prisma.quotation.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                status: dto.status,
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
        if (quotation.leadId) {
            try {
                await this.prisma.activity.create({
                    data: {
                        title: 'Quotation updated',
                        description: `Quotation "${quotation.quotationNumber}" updated. Status: ${quotation.status}`,
                        type: 'QUOTATION_UPDATED',
                        icon: 'Edit',
                        iconColor: '#F59E0B',
                        metadata: {
                            quotationId: quotation.id,
                            quotationNumber: quotation.quotationNumber,
                            status: quotation.status,
                        },
                        userId: quotation.createdBy,
                        leadId: quotation.leadId,
                    },
                });
            }
            catch (error) {
                console.error('Error creating quotation update activity:', error);
            }
        }
        return { success: true, data: { quotation } };
    }
    async remove(id) {
        await this.prisma.quotation.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { success: true };
    }
    async addItem(id, dto) {
        const item = await this.prisma.quotationItem.create({
            data: {
                quotationId: id,
                productId: dto.productId ? Number(dto.productId) : null,
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
        const item = await this.prisma.quotationItem.update({
            where: { id: itemId },
            data: {
                productId: dto.productId ? Number(dto.productId) : undefined,
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
        await this.recalcTotals(item.quotationId);
        return { success: true, data: { item } };
    }
    async removeItem(itemId) {
        const item = await this.prisma.quotationItem.delete({
            where: { id: itemId },
        });
        await this.recalcTotals(item.quotationId);
        return { success: true };
    }
    async recalcTotals(quotationId) {
        const items = await this.prisma.quotationItem.findMany({
            where: { quotationId },
        });
        const totals = this.calcTotals(items.map((i) => ({
            quantity: Number(i.quantity),
            unitPrice: Number(i.unitPrice),
            taxRate: Number(i.taxRate),
            discountRate: Number(i.discountRate),
        })));
        await this.prisma.quotation.update({
            where: { id: quotationId },
            data: {
                subtotal: totals.subtotal,
                taxAmount: totals.taxAmount,
                discountAmount: totals.discountAmount,
                totalAmount: totals.totalAmount,
            },
        });
    }
    async markSent(id) {
        const quotation = await this.prisma.quotation.update({
            where: { id },
            data: { status: 'SENT', sentAt: new Date() },
        });
        if (quotation.leadId) {
            try {
                await this.prisma.activity.create({
                    data: {
                        title: 'Quotation sent',
                        description: `Quotation "${quotation.quotationNumber}" sent to customer.`,
                        type: 'QUOTATION_SENT',
                        icon: 'Send',
                        iconColor: '#3B82F6',
                        metadata: {
                            quotationId: quotation.id,
                            quotationNumber: quotation.quotationNumber,
                        },
                        userId: quotation.createdBy,
                        leadId: quotation.leadId,
                    },
                });
            }
            catch (error) {
                console.error('Error creating quotation sent activity:', error);
            }
        }
        if (quotation.leadId) {
            try {
                const lead = await this.prisma.lead.findUnique({
                    where: { id: quotation.leadId },
                    select: { id: true, firstName: true, lastName: true, assignedTo: true },
                });
                if (lead?.assignedTo) {
                    await this.notificationsService.create({
                        userId: lead.assignedTo,
                        type: client_1.NotificationType.QUOTATION_SENT,
                        title: 'Quotation Sent',
                        message: `Quotation "${quotation.quotationNumber}" has been sent for lead "${lead.firstName} ${lead.lastName}".`,
                        link: `/leads/${lead.id}`,
                        metadata: {
                            quotationId: quotation.id,
                            quotationNumber: quotation.quotationNumber,
                            leadId: lead.id,
                        },
                    });
                }
            }
            catch (error) {
                console.error('Failed to send quotation sent notification:', error);
            }
        }
        return { success: true, data: { quotation } };
    }
    async markAccepted(id) {
        const quotation = await this.prisma.quotation.update({
            where: { id },
            data: { status: 'ACCEPTED', acceptedAt: new Date() },
        });
        if (quotation.leadId) {
            try {
                const lead = await this.prisma.lead.findUnique({
                    where: { id: quotation.leadId },
                    select: { id: true, firstName: true, lastName: true, assignedTo: true },
                });
                if (lead?.assignedTo) {
                    await this.notificationsService.create({
                        userId: lead.assignedTo,
                        type: client_1.NotificationType.QUOTATION_ACCEPTED,
                        title: 'Quotation Accepted',
                        message: `Quotation "${quotation.quotationNumber}" has been accepted by lead "${lead.firstName} ${lead.lastName}".`,
                        link: `/leads/${lead.id}`,
                        metadata: {
                            quotationId: quotation.id,
                            quotationNumber: quotation.quotationNumber,
                            leadId: lead.id,
                        },
                    });
                }
            }
            catch (error) {
                console.error('Failed to send quotation accepted notification:', error);
            }
        }
        return { success: true, data: { quotation } };
    }
    async markRejected(id) {
        const quotation = await this.prisma.quotation.update({
            where: { id },
            data: { status: 'REJECTED', rejectedAt: new Date() },
        });
        return { success: true, data: { quotation } };
    }
    async buildPdf(id) {
        const quotation = await this.prisma.quotation.findFirst({
            where: { id, deletedAt: null },
            include: {
                items: true,
                lead: true,
                deal: true,
                companies: true,
            },
        });
        if (!quotation)
            throw new Error('Quotation not found');
        const bs = await this.prisma.businessSettings.findFirst();
        const companyName = bs?.companyName || 'WE-CONNECT';
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
            const chunks = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('error', (err) => reject(err));
            doc.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve({ buffer, filename: `${quotation.quotationNumber}.pdf` });
            });
            const colors = {
                primary: '#1E3A8A',
                secondary: '#F97316',
                tertiary: '#10B981',
                light: '#F8FAFC',
                text: '#1E293B',
                lightText: '#64748B',
                border: '#E2E8F0',
                white: '#FFFFFF',
                lightOrange: '#FFF7ED'
            };
            doc.rect(0, 0, 595, 15).fill(colors.primary);
            let y = 35;
            const leftCol = 40;
            const rightCol = 340;
            let hasLogo = false;
            if (bs?.companyLogo) {
                try {
                    const logoPath = bs.companyLogo.startsWith('data:image')
                        ? Buffer.from(bs.companyLogo.split(';base64,').pop(), 'base64')
                        : path.join(process.cwd(), 'uploads', bs.companyLogo);
                    if (typeof logoPath === 'string' ? fs.existsSync(logoPath) : true) {
                        doc.image(logoPath, leftCol, y, { width: 80, height: 50, fit: [80, 50] });
                        hasLogo = true;
                    }
                }
                catch (e) {
                    console.error('PDF Logo Error:', e);
                }
            }
            if (hasLogo) {
                y += 60;
            }
            doc.fontSize(18).font('Helvetica-Bold').fillColor(colors.primary).text(companyName, leftCol, y);
            y += 25;
            doc.fontSize(8).font('Helvetica').fillColor(colors.text);
            if (bs?.companyAddress) {
                const addressLines = bs.companyAddress.split(',').map((line) => line.trim());
                addressLines.forEach((line) => {
                    doc.text(line, leftCol, y);
                    y += 10;
                });
            }
            if (bs?.companyPhone) {
                doc.text(`Phone: ${bs.companyPhone}`, leftCol, y);
                y += 10;
            }
            if (bs?.companyEmail) {
                doc.text(`Email: ${bs.companyEmail}`, leftCol, y);
                y += 10;
            }
            if (bs?.gstNumber) {
                doc.text(`GSTIN: ${bs.gstNumber}`, leftCol, y);
                y += 10;
            }
            if (bs?.panNumber) {
                doc.text(`PAN: ${bs.panNumber}`, leftCol, y);
                y += 10;
            }
            if (bs?.cinNumber) {
                doc.text(`CIN: ${bs.cinNumber}`, leftCol, y);
                y += 10;
            }
            let rightY = 35;
            doc.rect(rightCol - 10, rightY - 5, 230, 30).fill(colors.primary);
            doc.fontSize(16).font('Helvetica-Bold').fillColor(colors.white).text('QUOTATION', rightCol, rightY + 5);
            rightY += 40;
            const detailsBoxHeight = 25;
            const detailsBoxSpacing = 5;
            doc.rect(rightCol - 10, rightY, 230, detailsBoxHeight).fill(colors.light);
            doc.rect(rightCol - 10, rightY, 230, detailsBoxHeight).lineWidth(1).strokeColor(colors.border).stroke();
            doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.lightText).text('Quotation No:', rightCol, rightY + 8);
            doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.text).text(quotation.quotationNumber, rightCol + 80, rightY + 8);
            rightY += detailsBoxHeight + detailsBoxSpacing;
            doc.rect(rightCol - 10, rightY, 230, detailsBoxHeight).fill(colors.light);
            doc.rect(rightCol - 10, rightY, 230, detailsBoxHeight).lineWidth(1).strokeColor(colors.border).stroke();
            doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.lightText).text('Quotation Date:', rightCol, rightY + 8);
            doc.fontSize(10).font('Helvetica').fillColor(colors.text).text(new Date(quotation.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), rightCol + 80, rightY + 8);
            rightY += detailsBoxHeight + detailsBoxSpacing;
            doc.rect(rightCol - 10, rightY, 230, detailsBoxHeight).fill(colors.light);
            doc.rect(rightCol - 10, rightY, 230, detailsBoxHeight).lineWidth(1).strokeColor(colors.border).stroke();
            doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.lightText).text('Valid Until:', rightCol, rightY + 8);
            const validDate = quotation.validUntil
                ? new Date(quotation.validUntil).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : 'N/A';
            doc.fontSize(10).font('Helvetica').fillColor(colors.text).text(validDate, rightCol + 80, rightY + 8);
            y = Math.max(y, rightY) + 20;
            doc.moveTo(leftCol, y).lineTo(555, y).lineWidth(1).strokeColor(colors.border).stroke();
            y += 15;
            doc.rect(leftCol, y, 515, 25).fill(colors.lightOrange);
            doc.fontSize(11).font('Helvetica-Bold').fillColor(colors.primary).text('BILLING DETAILS', leftCol + 10, y + 8);
            y += 30;
            const billingLeftCol = leftCol;
            const billingRightCol = leftCol + 270;
            let leftY = y;
            doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primary).text('Quotation By:', billingLeftCol, leftY);
            leftY += 15;
            doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.text).text(companyName, billingLeftCol, leftY);
            leftY += 12;
            doc.fontSize(8).font('Helvetica').fillColor(colors.text);
            if (bs?.companyAddress) {
                const addressLines = bs.companyAddress.split(',').map((line) => line.trim());
                addressLines.forEach((line) => {
                    doc.text(line, billingLeftCol, leftY);
                    leftY += 10;
                });
            }
            if (bs?.companyPhone) {
                doc.text(`Phone: ${bs.companyPhone}`, billingLeftCol, leftY);
                leftY += 10;
            }
            if (bs?.companyEmail) {
                doc.text(`Email: ${bs.companyEmail}`, billingLeftCol, leftY);
                leftY += 10;
            }
            let customerY = y;
            doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primary).text('Quotation To:', billingRightCol, customerY);
            customerY += 15;
            const customerName = quotation.lead
                ? `${quotation.lead.firstName || ''} ${quotation.lead.lastName || ''}`.trim()
                : quotation.companies?.name || 'Valued Customer';
            doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.text).text(customerName, billingRightCol, customerY);
            customerY += 12;
            doc.fontSize(8).font('Helvetica').fillColor(colors.text);
            if (quotation.lead?.company) {
                doc.text(quotation.lead.company, billingRightCol, customerY);
                customerY += 10;
            }
            if (quotation.lead?.address) {
                const custAddressLines = quotation.lead.address.split(',').map((line) => line.trim());
                custAddressLines.forEach((line) => {
                    doc.text(line, billingRightCol, customerY);
                    customerY += 10;
                });
            }
            if (quotation.lead?.city) {
                doc.text(quotation.lead.city, billingRightCol, customerY);
                customerY += 10;
            }
            if (quotation.lead?.phone) {
                doc.text(`Phone: ${quotation.lead.phone}`, billingRightCol, customerY);
                customerY += 10;
            }
            if (quotation.lead?.email) {
                doc.text(`Email: ${quotation.lead.email}`, billingRightCol, customerY);
                customerY += 10;
            }
            y = Math.max(leftY, customerY) + 20;
            doc.moveTo(leftCol, y).lineTo(555, y).lineWidth(1).strokeColor(colors.border).stroke();
            y += 15;
            if (quotation.title) {
                doc.rect(leftCol, y, 515, 20).fill(colors.lightOrange);
                doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.text).text(`Subject: ${quotation.title}`, leftCol + 10, y + 5);
                y += 30;
            }
            const tableTop = y;
            doc.rect(leftCol, tableTop, 515, 25).fill(colors.primary);
            doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.white);
            doc.text('S.No', leftCol + 5, tableTop + 8, { width: 25, align: 'center' });
            doc.text('Item Description', leftCol + 40, tableTop + 8);
            doc.text('Qty', leftCol + 285, tableTop + 8, { width: 35, align: 'center' });
            doc.text('Unit Price', leftCol + 325, tableTop + 8, { width: 90, align: 'right' });
            doc.text('Amount', leftCol + 420, tableTop + 8, { width: 90, align: 'right' });
            y = tableTop + 25;
            quotation.items.forEach((item, index) => {
                if (y > 650) {
                    doc.addPage();
                    y = 50;
                    doc.rect(leftCol, y, 515, 25).fill(colors.primary);
                    doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.white);
                    doc.text('S.No', leftCol + 5, y + 8, { width: 25, align: 'center' });
                    doc.text('Item Description', leftCol + 40, y + 8);
                    doc.text('Qty', leftCol + 285, y + 8, { width: 35, align: 'center' });
                    doc.text('Unit Price', leftCol + 325, y + 8, { width: 90, align: 'right' });
                    doc.text('Amount', leftCol + 420, y + 8, { width: 90, align: 'right' });
                    y += 25;
                }
                const rowHeight = 25;
                if (index % 2 === 0) {
                    doc.rect(leftCol, y, 515, rowHeight).fill(colors.light);
                }
                doc.rect(leftCol, y, 515, rowHeight).lineWidth(0.5).strokeColor(colors.border).stroke();
                doc.fontSize(8).font('Helvetica').fillColor(colors.text);
                doc.text(String(index + 1), leftCol + 5, y + 8, { width: 25, align: 'center' });
                doc.text(item.name, leftCol + 40, y + 8, { width: 240 });
                doc.text(String(item.quantity), leftCol + 285, y + 8, { width: 35, align: 'center' });
                doc.text(`${quotation.currency} ${Number(item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, leftCol + 325, y + 8, { width: 90, align: 'right' });
                doc.text(`${quotation.currency} ${Number(item.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, leftCol + 420, y + 8, { width: 90, align: 'right' });
                y += rowHeight;
            });
            doc.rect(leftCol, y, 515, 0.5).fill(colors.border);
            y += 20;
            const totalsX = 350;
            const totalsLabelWidth = 90;
            const totalsValueWidth = 115;
            doc.rect(totalsX - 15, y - 10, totalsLabelWidth + totalsValueWidth + 25, 110).fill(colors.light);
            doc.rect(totalsX - 15, y - 10, totalsLabelWidth + totalsValueWidth + 25, 110).lineWidth(1).strokeColor(colors.border).stroke();
            doc.fontSize(9).font('Helvetica').fillColor(colors.text);
            doc.text('Sub Total', totalsX, y);
            doc.text(`${quotation.currency} ${Number(quotation.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, totalsX + totalsLabelWidth, y, { width: totalsValueWidth, align: 'right' });
            y += 20;
            if (Number(quotation.taxAmount) > 0) {
                doc.text('Tax', totalsX, y);
                doc.text(`${quotation.currency} ${Number(quotation.taxAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, totalsX + totalsLabelWidth, y, { width: totalsValueWidth, align: 'right' });
                y += 20;
            }
            if (Number(quotation.discountAmount) > 0) {
                doc.text('Discount', totalsX, y);
                doc.text(`- ${quotation.currency} ${Number(quotation.discountAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, totalsX + totalsLabelWidth, y, { width: totalsValueWidth, align: 'right' });
                y += 20;
            }
            doc.moveTo(totalsX - 10, y).lineTo(totalsX + totalsLabelWidth + totalsValueWidth + 10, y).lineWidth(0.5).strokeColor(colors.border).stroke();
            y += 10;
            doc.rect(totalsX - 10, y - 5, totalsLabelWidth + totalsValueWidth + 20, 25).fill(colors.tertiary);
            doc.fontSize(11).font('Helvetica-Bold').fillColor(colors.white);
            doc.text('Total', totalsX, y + 2);
            doc.text(`${quotation.currency} ${Number(quotation.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, totalsX + totalsLabelWidth, y + 2, { width: totalsValueWidth, align: 'right' });
            y += 40;
            const amountInWords = this.numberToWords(Number(quotation.totalAmount));
            doc.fontSize(8).font('Helvetica-Oblique').fillColor(colors.text).text(`Amount in Words: ${amountInWords}`, leftCol, y);
            y += 30;
            if (quotation.terms) {
                doc.rect(leftCol, y, 515, 20).fill(colors.lightOrange);
                doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primary).text('Terms and Conditions', leftCol + 10, y + 5);
                y += 25;
                const termsLines = quotation.terms.split('\n');
                doc.fontSize(8).font('Helvetica').fillColor(colors.text);
                termsLines.forEach((line, idx) => {
                    doc.text(`${idx + 1}. ${line}`, leftCol + 10, y, { width: 515 });
                    y += 12;
                });
                y += 15;
            }
            if (quotation.notes) {
                doc.rect(leftCol, y, 515, 20).fill(colors.lightOrange);
                doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primary).text('Additional Notes', leftCol + 10, y + 5);
                y += 25;
                doc.fontSize(8).font('Helvetica').fillColor(colors.text).text(quotation.notes, leftCol + 10, y, { width: 515, lineGap: 2 });
                y += doc.heightOfString(quotation.notes, { width: 515 }) + 20;
            }
            if (y > 700) {
                doc.addPage();
                y = 50;
            }
            y = Math.max(y, 700);
            doc.rect(0, y + 20, 595, 60).fill(colors.light);
            doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.primary).text('Contact Information', leftCol, y + 30);
            doc.fontSize(8).font('Helvetica').fillColor(colors.text).text(`Email: ${bs?.companyEmail || 'info@company.com'} | Phone: ${bs?.companyPhone || '+91-XXXXXXXXXX'}`, leftCol, y + 45);
            doc.text(`Website: ${bs?.companyWebsite || 'www.example.com'}`, leftCol, y + 60);
            doc.fontSize(12).font('Helvetica-Bold').fillColor(colors.secondary).text('Thank you for your business!', 0, y + 45, { align: 'center', width: 595 });
            const range = doc.bufferedPageRange();
            for (let i = range.start; i <= range.start + range.count - 1; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).font('Helvetica').fillColor(colors.lightText).text(`Page ${i + 1} of ${range.start + range.count}`, 0, 820, { align: 'center', width: 595 });
            }
            doc.end();
        });
    }
    async generateInvoice(id) {
        const quotation = await this.prisma.quotation.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!quotation)
            return { success: false, message: 'Quotation not found' };
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
        let ext = {};
        try {
            ext = bs?.description ? JSON.parse(bs.description) : {};
        }
        catch { }
        const invPrefix = (ext.invoicePrefix ?? 'INV-');
        const invSuffix = (ext.invoiceSuffix ?? '');
        const invPad = Number(ext.invoicePad ?? 6);
        const invoice = await this.prisma.invoice.update({
            where: { id: createdInv.id },
            data: { invoiceNumber: `${invPrefix}${pad(createdInv.id, invPad)}${invSuffix} ` },
            include: { items: true },
        });
        return { success: true, data: { invoice } };
    }
    async bulkAssign(dto) {
        await this.prisma.quotation.updateMany({
            where: { id: { in: dto.quotationIds } },
            data: { createdBy: dto.userId || 1 },
        });
        return { success: true, message: 'Quotations reassigned successfully' };
    }
    async bulkExport(opts = {}, user) {
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
        if (opts.status)
            where.status = opts.status.toUpperCase();
        if (opts.search) {
            const s = String(opts.search).trim();
            const searchConditions = [
                { title: { contains: s, mode: 'insensitive' } },
                { quotationNumber: { contains: s, mode: 'insensitive' } },
            ];
            if (where.AND) {
                where.AND.push({ OR: searchConditions });
            }
            else {
                where.OR = searchConditions;
            }
        }
        const quotations = await this.prisma.quotation.findMany({
            where,
            include: { lead: true, deal: true, companies: true },
            orderBy: { createdAt: 'desc' },
        });
        const headers = [
            'quotationNumber',
            'title',
            'description',
            'status',
            'totalAmount',
            'currency',
            'validUntil',
            'lead',
            'deal',
            'company',
            'createdAt',
        ];
        const rows = [headers.join(',')];
        for (const q of quotations) {
            const row = [
                escapeCsv(q.quotationNumber),
                escapeCsv(q.title),
                escapeCsv(q.description || ''),
                escapeCsv(q.status),
                escapeCsv(Number(q.totalAmount)),
                escapeCsv(q.currency),
                escapeCsv(q.validUntil ? new Date(q.validUntil).toISOString() : ''),
                escapeCsv(q.lead ? `${q.lead.firstName} ${q.lead.lastName}` : ''),
                escapeCsv(q.deal ? q.deal.title : ''),
                escapeCsv(q.companies ? q.companies.name : ''),
                escapeCsv(q.createdAt ? new Date(q.createdAt).toISOString() : ''),
            ];
            rows.push(row.join(','));
        }
        return rows.join('\r\n');
    }
    async bulkImportFromCsv(file, userId) {
        try {
            if (!file || !file.buffer) {
                return { success: false, message: 'Invalid file' };
            }
            const csvContent = file.buffer.toString('utf-8');
            const rawLines = csvContent.split('\n');
            const lines = rawLines.map(line => line.trim()).filter(line => line.length > 0);
            if (lines.length < 2) {
                return { success: false, message: 'CSV file must contain headers and at least one row of data' };
            }
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const requiredFields = ['title', 'totalamount'];
            const missingFields = requiredFields.filter(field => !headers.includes(field));
            if (missingFields.length > 0) {
                return { success: false, message: `CSV must contain these columns: ${missingFields.join(', ')}` };
            }
            const results = {
                success: true,
                data: {
                    imported: 0,
                    failed: 0,
                    errors: [],
                    message: '',
                },
            };
            for (let i = 1; i < lines.length; i++) {
                try {
                    const values = lines[i].split(',').map(v => v.trim());
                    const row = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                    });
                    if (!row.title || !row.totalamount) {
                        results.data.errors.push({ row: i + 1, error: 'Missing required fields: title or totalAmount' });
                        results.data.failed++;
                        continue;
                    }
                    const totalAmountVal = parseFloat(row.totalamount) || 0;
                    await this.create({
                        title: row.title,
                        description: row.description || null,
                        status: row.status ? row.status.toUpperCase() : 'DRAFT',
                        currency: row.currency || 'USD',
                        validUntil: row.validuntil || null,
                        createdBy: userId || 1,
                        items: [
                            {
                                name: 'General Items',
                                quantity: 1,
                                unitPrice: totalAmountVal,
                                taxRate: 0,
                                discountRate: 0,
                            },
                        ],
                        quotationNumber: row.quotationnumber || undefined,
                    });
                    results.data.imported++;
                }
                catch (error) {
                    results.data.errors.push({ row: i + 1, error: error.message || 'Unknown error' });
                    results.data.failed++;
                }
            }
            results.data.message = `Import completed. Imported: ${results.data.imported}, Failed: ${results.data.failed}`;
            return results;
        }
        catch (error) {
            return { success: false, message: error.message || 'Failed to import quotations from CSV' };
        }
    }
};
exports.QuotationsService = QuotationsService;
exports.QuotationsService = QuotationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], QuotationsService);
function escapeCsv(val) {
    if (val === null || val === undefined)
        return '""';
    let s = String(val);
    if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
        s = s.replace(/"/g, '""');
        return `"${s}"`;
    }
    return s;
}
//# sourceMappingURL=quotations.service.js.map