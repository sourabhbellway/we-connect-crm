import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { UpsertInvoiceItemDto } from './dto/upsert-invoice-item.dto';
import { CreateInvoiceItemDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
export declare class InvoicesController {
    private readonly service;
    constructor(service: InvoicesService);
    list(page?: string, limit?: string, search?: string, status?: string): Promise<{
        success: boolean;
        data: {
            items: ({
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
                description: string | null;
                notes: string | null;
                title: string;
                currency: string;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                leadId: number | null;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
                dealId: number | null;
                createdBy: number;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                sentAt: Date | null;
                viewedAt: Date | null;
                quotationId: number | null;
                invoiceNumber: string;
                paidAmount: import("@prisma/client/runtime/library").Decimal;
                dueDate: Date | null;
                paidAt: Date | null;
            })[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    get(id: string): Promise<{
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
                description: string | null;
                notes: string | null;
                title: string;
                currency: string;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                leadId: number | null;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
                dealId: number | null;
                createdBy: number;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                sentAt: Date | null;
                viewedAt: Date | null;
                quotationId: number | null;
                invoiceNumber: string;
                paidAmount: import("@prisma/client/runtime/library").Decimal;
                dueDate: Date | null;
                paidAt: Date | null;
            };
        };
        message?: undefined;
    }>;
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
                description: string | null;
                notes: string | null;
                title: string;
                currency: string;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                leadId: number | null;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
                dealId: number | null;
                createdBy: number;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                sentAt: Date | null;
                viewedAt: Date | null;
                quotationId: number | null;
                invoiceNumber: string;
                paidAmount: import("@prisma/client/runtime/library").Decimal;
                dueDate: Date | null;
                paidAt: Date | null;
            };
        };
    }>;
    update(id: string, dto: UpdateInvoiceDto): Promise<{
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
                description: string | null;
                notes: string | null;
                title: string;
                currency: string;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                leadId: number | null;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
                dealId: number | null;
                createdBy: number;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                sentAt: Date | null;
                viewedAt: Date | null;
                quotationId: number | null;
                invoiceNumber: string;
                paidAmount: import("@prisma/client/runtime/library").Decimal;
                dueDate: Date | null;
                paidAt: Date | null;
            };
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    addItem(id: string, dto: CreateInvoiceItemDto): Promise<{
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
    updateItem(itemId: string, dto: UpsertInvoiceItemDto): Promise<{
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
    removeItem(itemId: string): Promise<{
        success: boolean;
    }>;
    send(id: string): Promise<{
        success: boolean;
        data: {
            invoice: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                description: string | null;
                notes: string | null;
                title: string;
                currency: string;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                leadId: number | null;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
                dealId: number | null;
                createdBy: number;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                sentAt: Date | null;
                viewedAt: Date | null;
                quotationId: number | null;
                invoiceNumber: string;
                paidAmount: import("@prisma/client/runtime/library").Decimal;
                dueDate: Date | null;
                paidAt: Date | null;
            };
        };
    }>;
    recordPayment(id: string, dto: RecordPaymentDto): Promise<{
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
}
