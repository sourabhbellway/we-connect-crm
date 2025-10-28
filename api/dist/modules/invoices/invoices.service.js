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
const prisma_service_1 = require("../../database/prisma.service");
const genNumber = (prefix) => `${prefix}-${Date.now()}`;
let InvoicesService = class InvoicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list({ page = 1, limit = 10, search, status, }) {
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
                contactId: dto.contactId ?? null,
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
                contactId: dto.contactId ?? undefined,
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
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map