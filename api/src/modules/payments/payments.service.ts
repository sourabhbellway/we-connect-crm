import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { getAccessibleUserIds } from '../../common/utils/permission.util';

@Injectable()
export class PaymentsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createPaymentDto: CreatePaymentDto, user?: any) {
        const { invoiceId, amount, ...rest } = createPaymentDto;

        // Verify invoice exists
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
        });
        if (!invoice) throw new NotFoundException('Invoice not found');

        // Create payment
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

        // Update Invoice status and paidAmount
        await this.updateInvoiceStatus(invoiceId);

        return { success: true, data: { payment } };
    }

    async findAll(query: any, user?: any) {
        const { leadId, dealId, invoiceId, entityType, entityId: eId } = query;
        const where: any = {};

        if (invoiceId) where.invoiceId = Number(invoiceId);

        // Role-based filtering
        if (user && user.userId) {
            const accessibleIds = await getAccessibleUserIds(user.userId, this.prisma);
            if (accessibleIds) {
                where.invoice = {
                    OR: [
                        { createdBy: { in: accessibleIds } },
                        { lead: { assignedTo: { in: accessibleIds } } },
                        { deal: { assignedTo: { in: accessibleIds } } },
                    ]
                };
            }
        }

        // Support both direct IDs and entityType/entityId pattern
        const effectiveLeadId = leadId || (entityType?.toLowerCase() === 'lead' ? eId : null);
        const effectiveDealId = dealId || (entityType?.toLowerCase() === 'deal' ? eId : null);

        if (effectiveLeadId) {
            where.invoice = { ...where.invoice, leadId: Number(effectiveLeadId) };
        }
        if (effectiveDealId) {
            where.invoice = { ...where.invoice, dealId: Number(effectiveDealId) };
        }

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

    async remove(id: number) {
        const payment = await this.prisma.payment.findUnique({ where: { id } });
        if (!payment) throw new NotFoundException('Payment not found');

        await this.prisma.payment.delete({ where: { id } });
        await this.updateInvoiceStatus(payment.invoiceId);

        return { success: true, message: 'Payment deleted' };
    }

    private async updateInvoiceStatus(invoiceId: number) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { payments: true },
        });
        if (!invoice) return;

        const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const totalAmount = Number(invoice.totalAmount);

        let status = invoice.status; // Keep current status by default

        // Logic to update status based on payment
        if (totalPaid >= totalAmount) {
            status = 'PAID';
        } else if (totalPaid > 0) {
            status = 'PARTIALLY_PAID';
        } else {
            // If payment removed and balance is 0, revert to SENT if it was PAID/PARTIAL
            if (status === 'PAID' || status === 'PARTIALLY_PAID') {
                status = 'SENT';
            }
        }

        await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                paidAmount: totalPaid,
                status: status as any,
                paidAt: totalPaid >= totalAmount ? new Date() : invoice.paidAt,
            },
        });
    }
}
