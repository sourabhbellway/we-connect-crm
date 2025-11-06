"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationsService = void 0;
const common_1 = require("@nestjs/common");
const PDFDocument = require("pdfkit");
const prisma_service_1 = require("../../database/prisma.service");
const pad = (num, size) => String(num).padStart(size, '0');
let QuotationsService = class QuotationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
    async list({ page = 1, limit = 10, search, status, entityType, entityId, }) {
        const where = { deletedAt: null };
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
    async getById(id) {
        const quotation = await this.prisma.quotation.findFirst({
            where: { id, deletedAt: null },
            include: { items: true, lead: true, deal: true, companies: true },
        });
        if (!quotation)
            return { success: false, message: 'Quotation not found' };
        return { success: true, data: { quotation } };
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
        const totals = this.calcTotals(dto.items || []);
        const created = await this.prisma.quotation.create({
            data: {
                quotationNumber: dto.quotationNumber || 'PENDING',
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
        const bs = await this.prisma.businessSettings.findFirst();
        let ext = {};
        try {
            ext = bs?.description ? JSON.parse(bs.description) : {};
        }
        catch { }
        const prefix = (ext.quotePrefix ?? 'Q-');
        const width = Number(ext.quotePad ?? 6);
        const number = dto.quotationNumber || `${prefix}${pad(created.id, width)}`;
        const termsFinal = created.terms ?? ext.defaultTerms ?? '';
        const quotation = await this.prisma.quotation.update({
            where: { id: created.id },
            data: { quotationNumber: number, terms: termsFinal },
            include: { items: true },
        });
        if (quotation.leadId) {
            try {
                await this.prisma.activity.create({
                    data: {
                        title: 'Quotation created',
                        description: `Quotation "${quotation.quotationNumber}" created with total amount ${quotation.currency} ${Number(quotation.totalAmount).toFixed(2)}`,
                        type: 'COMMUNICATION_LOGGED',
                        icon: 'FileText',
                        iconColor: '#10B981',
                        metadata: {
                            quotationId: quotation.id,
                            quotationNumber: quotation.quotationNumber,
                            totalAmount: quotation.totalAmount,
                            currency: quotation.currency,
                        },
                        userId: quotation.createdBy,
                        leadId: quotation.leadId,
                    },
                });
            }
            catch (error) {
                console.error('Error creating quotation activity:', error);
            }
        }
        return { success: true, data: { quotation } };
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
                        type: 'COMMUNICATION_LOGGED',
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
        const item = await this.prisma.quotationItem.update({
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
        return { success: true, data: { quotation } };
    }
    async markAccepted(id) {
        const quotation = await this.prisma.quotation.update({
            where: { id },
            data: { status: 'ACCEPTED', acceptedAt: new Date() },
        });
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
        const customerName = quotation.lead
            ? `${quotation.lead.firstName || ''} ${quotation.lead.lastName || ''}`.trim()
            : quotation.companies
                ? quotation.companies.name
                : 'N/A';
        const customerEmail = quotation.lead?.email || quotation.companies?.email || '';
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks = [];
        doc.on('data', (c) => chunks.push(c));
        const bs = await this.prisma.businessSettings.findFirst();
        const companyName = bs?.companyName || 'Your Company';
        const companyAddress = bs?.companyAddress || '';
        const companyEmail = bs?.companyEmail || '';
        const companyPhone = bs?.companyPhone || '';
        try {
            if (bs?.companyLogo) {
                doc.image(bs.companyLogo, 50, 40, { width: 120 }).moveDown();
            }
        }
        catch { }
        doc
            .fontSize(16)
            .fillColor('#111827')
            .text(companyName, 50, 50, { align: 'left' });
        if (companyAddress)
            doc.fontSize(10).fillColor('#374151').text(companyAddress);
        if (companyEmail || companyPhone)
            doc.fontSize(10).fillColor('#374151').text([companyEmail, companyPhone].filter(Boolean).join(' • '));
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
        const primary = '#EF444E';
        const light = '#F3F4F6';
        const textDark = '#111827';
        const textMuted = '#374151';
        const drawCard = (x, y, w, h, title, lines) => {
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
        const amountInWordsIndian = (num) => {
            const ones = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
            const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
            const toWords = (n) => {
                if (n < 20)
                    return ones[n];
                if (n < 100)
                    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
                if (n < 1000)
                    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + toWords(n % 100) : '');
                if (n < 100000)
                    return toWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + toWords(n % 1000) : '');
                if (n < 10000000)
                    return toWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + toWords(n % 100000) : '');
                return toWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + toWords(n % 10000000) : '');
            };
            const rupees = Math.floor(num);
            const paise = Math.round((num - rupees) * 100);
            return `${toWords(rupees).toUpperCase()} RUPEES${paise ? ' AND ' + toWords(paise).toUpperCase() + ' PAISE' : ''} ONLY`;
        };
        const cardTop = doc.y + 8;
        const pageW = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const cardW = (pageW - 20) / 2;
        drawCard(50, cardTop, cardW, 90, 'Quotation From', [companyName, companyAddress, companyEmail, companyPhone]);
        drawCard(50 + cardW + 20, cardTop, cardW, 90, 'Quotation For', [customerName || 'Customer', customerEmail]);
        doc.moveDown(7);
        doc.fontSize(11);
        const tableTop = doc.y + 6;
        doc.save();
        doc.rect(50, tableTop - 16, pageW, 18).fill(primary);
        doc.fillColor('#ffffff').fontSize(11).text('Item', 58, tableTop - 14);
        doc.text('Quantity', 320, tableTop - 14, { width: 60, align: 'right' });
        doc.text('Rate', 400, tableTop - 14, { width: 80, align: 'right' });
        doc.text('Amount', 490, tableTop - 14, { width: 80, align: 'right' });
        doc.restore();
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
        const totalsY = yCursor + 12;
        const totalsX = 380;
        const totalsW = 190;
        const amountWords = amountInWordsIndian(Number(quotation.totalAmount || 0));
        doc.fillColor(textDark).fontSize(10).text(`Total (in words): ${amountWords}`, 50, totalsY, { width: 300 });
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
        let ext = {};
        try {
            ext = bs?.description ? JSON.parse(bs.description) : {};
        }
        catch { }
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
        const buffer = await new Promise((resolve) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
        });
        const filename = `${quotation.quotationNumber || 'quotation'}.pdf`;
        return { buffer, filename };
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
        const invPad = Number(ext.invoicePad ?? 6);
        const invoice = await this.prisma.invoice.update({
            where: { id: createdInv.id },
            data: { invoiceNumber: `${invPrefix}${pad(createdInv.id, invPad)}` },
            include: { items: true },
        });
        return { success: true, data: { invoice } };
    }
};
exports.QuotationsService = QuotationsService;
exports.QuotationsService = QuotationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuotationsService);
//# sourceMappingURL=quotations.service.js.map