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
                    currency: string;
                    title: string;
                    description: string | null;
                    leadId: number | null;
                    createdBy: number;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    companyId: number | null;
                    deletedAt: Date | null;
                    notes: string | null;
                    status: import(".prisma/client").$Enums.InvoiceStatus;
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
                currency: string;
                createdBy: number;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                invoiceId: number;
                amount: import("@prisma/client/runtime/library").Decimal;
                paymentMethod: string;
                paymentDate: Date;
                referenceNumber: string | null;
            };
        };
    }>;
    findAll(query: any, user?: any): Promise<{
        success: boolean;
        data: {
            payments: ({
                createdByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                currency: string;
                createdBy: number;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
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
