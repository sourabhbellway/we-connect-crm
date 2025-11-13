import { PrismaService } from '../../database/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { UpsertInvoiceItemDto } from './dto/upsert-invoice-item.dto';
import { CreateInvoiceItemDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
export declare class InvoicesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list({ page, limit, search, status, entityType, entityId, }: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        entityType?: string;
        entityId?: string;
    }): Promise<{
        success: boolean;
        data: {
            items: ({
                lead: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                    company: string | null;
                } | null;
                deal: {
                    id: number;
                    title: string;
                } | null;
                items: {
                    name: string;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    sortOrder: number;
                    invoiceId: number;
                }[];
                payments: {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    notes: string | null;
                    currency: string;
                    createdBy: number;
                    invoiceId: number;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    paymentMethod: string;
                    paymentDate: Date;
                    referenceNumber: string | null;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                notes: string | null;
                description: string | null;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                title: string;
                currency: string;
                createdBy: number;
                dueDate: Date | null;
                leadId: number | null;
                dealId: number | null;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                sentAt: Date | null;
                viewedAt: Date | null;
                quotationId: number | null;
                invoiceNumber: string;
                paidAmount: import("@prisma/client/runtime/library").Decimal;
                paidAt: Date | null;
            })[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    getById(id: number): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            invoice: {
                items: {
                    name: string;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    sortOrder: number;
                    invoiceId: number;
                }[];
                payments: {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    notes: string | null;
                    currency: string;
                    createdBy: number;
                    invoiceId: number;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    paymentMethod: string;
                    paymentDate: Date;
                    referenceNumber: string | null;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                notes: string | null;
                description: string | null;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                title: string;
                currency: string;
                createdBy: number;
                dueDate: Date | null;
                leadId: number | null;
                dealId: number | null;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                sentAt: Date | null;
                viewedAt: Date | null;
                quotationId: number | null;
                invoiceNumber: string;
                paidAmount: import("@prisma/client/runtime/library").Decimal;
                paidAt: Date | null;
            };
        };
        message?: undefined;
    }>;
    private calcTotals;
    create(dto: CreateInvoiceDto): Promise<{
        success: boolean;
        data: {
            invoice: {
                items: {
                    name: string;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    sortOrder: number;
                    invoiceId: number;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                notes: string | null;
                description: string | null;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                title: string;
                currency: string;
                createdBy: number;
                dueDate: Date | null;
                leadId: number | null;
                dealId: number | null;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                sentAt: Date | null;
                viewedAt: Date | null;
                quotationId: number | null;
                invoiceNumber: string;
                paidAmount: import("@prisma/client/runtime/library").Decimal;
                paidAt: Date | null;
            };
        };
    }>;
    update(id: number, dto: UpdateInvoiceDto): Promise<{
        success: boolean;
        data: {
            invoice: {
                items: {
                    name: string;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    sortOrder: number;
                    invoiceId: number;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                notes: string | null;
                description: string | null;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                title: string;
                currency: string;
                createdBy: number;
                dueDate: Date | null;
                leadId: number | null;
                dealId: number | null;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                sentAt: Date | null;
                viewedAt: Date | null;
                quotationId: number | null;
                invoiceNumber: string;
                paidAmount: import("@prisma/client/runtime/library").Decimal;
                paidAt: Date | null;
            };
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    addItem(id: number, dto: CreateInvoiceItemDto): Promise<{
        success: boolean;
        data: {
            item: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                unit: string | null;
                taxRate: import("@prisma/client/runtime/library").Decimal;
                productId: number | null;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                discountRate: import("@prisma/client/runtime/library").Decimal;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                sortOrder: number;
                invoiceId: number;
            };
        };
    }>;
    updateItem(itemId: number, dto: UpsertInvoiceItemDto): Promise<{
        success: boolean;
        data: {
            item: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                unit: string | null;
                taxRate: import("@prisma/client/runtime/library").Decimal;
                productId: number | null;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                discountRate: import("@prisma/client/runtime/library").Decimal;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                sortOrder: number;
                invoiceId: number;
            };
        };
    }>;
    removeItem(itemId: number): Promise<{
        success: boolean;
    }>;
    private recalcTotals;
    markSent(id: number): Promise<{
        success: boolean;
        data: {
            invoice: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                notes: string | null;
                description: string | null;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                title: string;
                currency: string;
                createdBy: number;
                dueDate: Date | null;
                leadId: number | null;
                dealId: number | null;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                sentAt: Date | null;
                viewedAt: Date | null;
                quotationId: number | null;
                invoiceNumber: string;
                paidAmount: import("@prisma/client/runtime/library").Decimal;
                paidAt: Date | null;
            };
        };
    }>;
    recordPayment(id: number, dto: RecordPaymentDto): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            payment: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                currency: string;
                createdBy: number;
                invoiceId: number;
                amount: import("@prisma/client/runtime/library").Decimal;
                paymentMethod: string;
                paymentDate: Date;
                referenceNumber: string | null;
            };
        };
        message?: undefined;
    }>;
    buildPdf(id: number): Promise<{
        buffer: Buffer;
        filename: string;
    }>;
}
