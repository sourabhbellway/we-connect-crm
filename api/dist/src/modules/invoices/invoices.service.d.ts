import { PrismaService } from '../../database/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { UpsertInvoiceItemDto } from './dto/upsert-invoice-item.dto';
import { CreateInvoiceItemDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class InvoicesService {
    private readonly prisma;
    private readonly notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    list({ page, limit, search, status, entityType, entityId, }: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        entityType?: string;
        entityId?: string;
    }, user?: any): Promise<{
        success: boolean;
        data: {
            items: ({
                lead: {
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
                    id: number;
                    company: string | null;
                } | null;
                deal: {
                    id: number;
                    title: string;
                } | null;
                items: {
                    createdAt: Date;
                    updatedAt: Date;
                    id: number;
                    name: string;
                    description: string | null;
                    sortOrder: number;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
                    invoiceId: number;
                }[];
                payments: {
                    createdAt: Date;
                    updatedAt: Date;
                    notes: string | null;
                    id: number;
                    currency: string;
                    createdBy: number;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    paymentMethod: string;
                    paymentDate: Date;
                    referenceNumber: string | null;
                    invoiceId: number;
                }[];
            } & {
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
            })[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    getById(id: number, user?: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            invoice: {
                items: {
                    createdAt: Date;
                    updatedAt: Date;
                    id: number;
                    name: string;
                    description: string | null;
                    sortOrder: number;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
                    invoiceId: number;
                }[];
                payments: {
                    createdAt: Date;
                    updatedAt: Date;
                    notes: string | null;
                    id: number;
                    currency: string;
                    createdBy: number;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    paymentMethod: string;
                    paymentDate: Date;
                    referenceNumber: string | null;
                    invoiceId: number;
                }[];
            } & {
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
        };
        message?: undefined;
    }>;
    getNextNumber(): Promise<{
        success: boolean;
        data: {
            nextNumber: string;
        };
    }>;
    private calcTotals;
    create(dto: CreateInvoiceDto): Promise<{
        success: boolean;
        data: {
            invoice: {
                items: {
                    createdAt: Date;
                    updatedAt: Date;
                    id: number;
                    name: string;
                    description: string | null;
                    sortOrder: number;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
                    invoiceId: number;
                }[];
            } & {
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
        };
    }>;
    update(id: number, dto: UpdateInvoiceDto): Promise<{
        success: boolean;
        data: {
            invoice: {
                items: {
                    createdAt: Date;
                    updatedAt: Date;
                    id: number;
                    name: string;
                    description: string | null;
                    sortOrder: number;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
                    invoiceId: number;
                }[];
            } & {
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
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    addItem(id: number, dto: CreateInvoiceItemDto): Promise<{
        success: boolean;
        data: {
            item: {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name: string;
                description: string | null;
                sortOrder: number;
                unit: string | null;
                taxRate: import("@prisma/client/runtime/library").Decimal;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                productId: number | null;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                discountRate: import("@prisma/client/runtime/library").Decimal;
                invoiceId: number;
            };
        };
    }>;
    updateItem(itemId: number, dto: UpsertInvoiceItemDto): Promise<{
        success: boolean;
        data: {
            item: {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name: string;
                description: string | null;
                sortOrder: number;
                unit: string | null;
                taxRate: import("@prisma/client/runtime/library").Decimal;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                productId: number | null;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                discountRate: import("@prisma/client/runtime/library").Decimal;
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
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                id: number;
                currency: string;
                createdBy: number;
                amount: import("@prisma/client/runtime/library").Decimal;
                paymentMethod: string;
                paymentDate: Date;
                referenceNumber: string | null;
                invoiceId: number;
            };
        };
        message?: undefined;
    }>;
    buildPdf(id: number): Promise<{
        buffer: Buffer;
        filename: string;
    }>;
}
