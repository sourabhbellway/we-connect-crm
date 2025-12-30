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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPaymentDto, user) {
        const { invoiceId, amount, ...rest } = createPaymentDto;
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        const payment = await this.prisma.payment.create({
            data: {
                amount,
                invoiceId,
                currency: rest.currency || invoice.currency,
                paymentMethod: rest.paymentMethod,
                paymentDate: rest.paymentDate ? new Date(rest.paymentDate) : new Date(),
                referenceNumber: rest.reference,
                notes: rest.notes,
                createdBy: user?.userId || createPaymentDto.createdBy || 1,
            },
            include: {
                createdByUser: {
                    select: { id: true, firstName: true, lastName: true },
                },
                invoice: true,
            },
        });
        await this.updateInvoiceStatus(invoiceId);
        return { success: true, data: { payment } };
    }
    async findAll(query) {
        const { leadId, dealId, invoiceId } = query;
        const where = {};
        if (invoiceId)
            where.invoiceId = Number(invoiceId);
        if (leadId)
            where.invoice = { leadId: Number(leadId) };
        if (dealId)
            where.invoice = { dealId: Number(dealId) };
        const payments = await this.prisma.payment.findMany({
            where,
            orderBy: { paymentDate: 'desc' },
            include: {
                createdByUser: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
        return { success: true, data: { payments } };
    }
    async remove(id) {
        const payment = await this.prisma.payment.findUnique({ where: { id } });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        await this.prisma.payment.delete({ where: { id } });
        await this.updateInvoiceStatus(payment.invoiceId);
        return { success: true, message: 'Payment deleted' };
    }
    async updateInvoiceStatus(invoiceId) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { payments: true },
        });
        if (!invoice)
            return;
        const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const totalAmount = Number(invoice.totalAmount);
        let status = invoice.status;
        if (totalPaid >= totalAmount) {
            status = 'PAID';
        }
        else if (totalPaid > 0) {
            status = 'PARTIALLY_PAID';
        }
        else {
            if (status === 'PAID' || status === 'PARTIALLY_PAID') {
                status = 'SENT';
            }
        }
        await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                paidAmount: totalPaid,
                status: status,
                paidAt: totalPaid >= totalAmount ? new Date() : invoice.paidAt,
            },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map