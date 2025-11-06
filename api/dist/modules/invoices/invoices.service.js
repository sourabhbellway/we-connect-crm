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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const PDFDocument = require("pdfkit");
const prisma_service_1 = require("../../database/prisma.service");
const genNumber = (prefix) => `${prefix}-${Date.now()}`;
const pad = (num, size) => String(num).padStart(size, '0');
let InvoicesService = class InvoicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list({ page = 1, limit = 10, search, status, entityType, entityId, }) {
        const where = { deletedAt: null };
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
    async getById(id) {
        const invoice = await this.prisma.invoice.findFirst({
            where: { id, deletedAt: null },
            include: { items: true, payments: true },
        });
        if (!invoice)
            return { success: false, message: 'Invoice not found' };
        return { success: true, data: { invoice } };
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
        const invoice = await this.prisma.invoice.create({
            data: {
                invoiceNumber: dto.invoiceNumber || genNumber('INV'),
                title: dto.title,
                description: dto.description ?? null,
                status: dto.status ?? 'DRAFT',
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
        if (invoice.leadId) {
            try {
                await this.prisma.activity.create({
                    data: {
                        title: 'Invoice created',
                        description: `Invoice "${invoice.invoiceNumber}" created with total amount ${invoice.currency} ${Number(invoice.totalAmount).toFixed(2)}`,
                        type: 'COMMUNICATION_LOGGED',
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
        return { success: true, data: { invoice } };
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
        return { success: true, data: { payment } };
    }
    async buildPdf(id) {
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
        const customerName = invoice.lead
            ? `${invoice.lead.firstName || ''} ${invoice.lead.lastName || ''}`.trim() || invoice.lead.company || 'N/A'
            : invoice.deal
                ? invoice.deal.title || 'N/A'
                : 'N/A';
        const customerEmail = invoice.lead?.email || '';
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks = [];
        doc.on('data', (c) => chunks.push(c));
        const bs = await this.prisma.businessSettings.findFirst();
        let ext = {};
        try {
            ext = bs?.description ? JSON.parse(bs.description) : {};
        }
        catch { }
        const companyName = bs?.companyName || ext.companyName || 'Your Company';
        const companyAddress = ext.companyAddress || '';
        const companyEmail = ext.companyEmail || '';
        const companyPhone = ext.companyPhone || '';
        doc.fontSize(20).text(companyName, { align: 'left' });
        if (companyAddress)
            doc.fontSize(10).text(companyAddress, { align: 'left' });
        if (companyEmail)
            doc.fontSize(10).text(companyEmail, { align: 'left' });
        if (companyPhone)
            doc.fontSize(10).text(companyPhone, { align: 'left' });
        doc.moveDown(2);
        doc.fontSize(24).text('INVOICE', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12);
        doc.text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'left' });
        doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, { align: 'left' });
        if (invoice.dueDate) {
            doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, { align: 'left' });
        }
        doc.text(`Status: ${invoice.status}`, { align: 'left' });
        doc.moveDown();
        doc.fontSize(14).text('Bill To:', { align: 'left' });
        doc.fontSize(12);
        doc.text(customerName, { align: 'left' });
        if (customerEmail)
            doc.text(customerEmail, { align: 'left' });
        doc.moveDown();
        doc.fontSize(12);
        const tableTop = doc.y;
        const itemHeight = 20;
        let y = tableTop;
        doc.font('Helvetica-Bold');
        doc.text('Item', 50, y);
        doc.text('Quantity', 200, y);
        doc.text('Rate', 300, y);
        doc.text('Amount', 400, y);
        y += itemHeight;
        doc.font('Helvetica');
        invoice.items.forEach((item) => {
            const itemName = item.name || 'Item';
            const quantity = Number(item.quantity || 0);
            const rate = Number(item.unitPrice || 0);
            const amount = Number(item.totalAmount || 0);
            doc.text(itemName, 50, y, { width: 140 });
            doc.text(String(quantity), 200, y);
            doc.text(`${invoice.currency} ${rate.toFixed(2)}`, 300, y);
            doc.text(`${invoice.currency} ${amount.toFixed(2)}`, 400, y);
            y += itemHeight;
        });
        y += 10;
        doc.font('Helvetica-Bold');
        doc.text(`Subtotal: ${invoice.currency} ${Number(invoice.subtotal).toFixed(2)}`, 300, y, { align: 'right' });
        y += itemHeight;
        if (Number(invoice.taxAmount) > 0) {
            doc.text(`Tax: ${invoice.currency} ${Number(invoice.taxAmount).toFixed(2)}`, 300, y, { align: 'right' });
            y += itemHeight;
        }
        if (Number(invoice.discountAmount) > 0) {
            doc.text(`Discount: ${invoice.currency} ${Number(invoice.discountAmount).toFixed(2)}`, 300, y, { align: 'right' });
            y += itemHeight;
        }
        doc.fontSize(14);
        doc.text(`Total: ${invoice.currency} ${Number(invoice.totalAmount).toFixed(2)}`, 300, y, { align: 'right' });
        if (invoice.notes) {
            y += itemHeight * 2;
            doc.fontSize(10);
            doc.font('Helvetica');
            doc.text('Notes:', 50, y);
            doc.text(invoice.notes, 50, y + 15, { width: 500 });
        }
        if (invoice.terms) {
            y += itemHeight * 2;
            doc.fontSize(10);
            doc.font('Helvetica');
            doc.text('Terms:', 50, y);
            doc.text(invoice.terms, 50, y + 15, { width: 500 });
        }
        doc.end();
        return new Promise((resolve, reject) => {
            doc.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve({ buffer, filename: `invoice-${invoice.invoiceNumber}.pdf` });
            });
            doc.on('error', reject);
        });
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map