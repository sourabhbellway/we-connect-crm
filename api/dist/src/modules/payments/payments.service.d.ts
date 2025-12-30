import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createPaymentDto: CreatePaymentDto, user?: any): Promise<{
        success: boolean;
        data: {
            payment: {
                invoice: {
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    notes: string | null;
                    id: number;
                    companyId: number | null;
                    description: string | null;
                    currency: string;
                    status: import("@prisma/client").$Enums.InvoiceStatus;
                    createdBy: number;
                    title: string;
                    leadId: number | null;
                    dueDate: Date | null;
                    dealId: number | null;
                    invoiceNumber: string;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    taxAmount: import("@prisma/client/runtime/library").Decimal;
                    discountAmount: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    paidAmount: import("@prisma/client/runtime/library").Decimal;
                    terms: string | null;
                    quotationId: number | null;
                    sentAt: Date | null;
                    viewedAt: Date | null;
                    paidAt: Date | null;
                };
                createdByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                id: number;
                currency: string;
                createdBy: number;
                invoiceId: number;
                amount: import("@prisma/client/runtime/library").Decimal;
                paymentMethod: string;
                paymentDate: Date;
                referenceNumber: string | null;
            };
        };
    }>;
    findAll(query: any): Promise<{
        success: boolean;
        data: {
            payments: ({
                createdByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                id: number;
                currency: string;
                createdBy: number;
                invoiceId: number;
                amount: import("@prisma/client/runtime/library").Decimal;
                paymentMethod: string;
                paymentDate: Date;
                referenceNumber: string | null;
            })[];
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    private updateInvoiceStatus;
}
