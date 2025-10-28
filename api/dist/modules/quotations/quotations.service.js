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
const prisma_service_1 = require("../../database/prisma.service");
const genNumber = (prefix) => `${prefix}-${Date.now()}`;
let QuotationsService = class QuotationsService {
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
    async getById(id) {
        const quotation = await this.prisma.quotation.findFirst({
            where: { id, deletedAt: null },
            include: { items: true },
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
        const quotation = await this.prisma.quotation.create({
            data: {
                quotationNumber: dto.quotationNumber || genNumber('Q'),
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
                contactId: dto.contactId ?? undefined,
                updatedAt: new Date(),
            },
            include: { items: true },
        });
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
    async generateInvoice(id) {
        const quotation = await this.prisma.quotation.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!quotation)
            return { success: false, message: 'Quotation not found' };
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
};
exports.QuotationsService = QuotationsService;
exports.QuotationsService = QuotationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuotationsService);
//# sourceMappingURL=quotations.service.js.map