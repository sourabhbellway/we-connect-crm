import type { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { UpsertInvoiceItemDto } from './dto/upsert-invoice-item.dto';
import { CreateInvoiceItemDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
export declare class InvoicesController {
    private readonly service;
    constructor(service: InvoicesService);
    list(page?: string, limit?: string, search?: string, status?: string, entityType?: string, entityId?: string, user?: any): Promise<{
        success: boolean;
        data: {
            items: ({
                lead: {
                    id: number;
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
                    company: string | null;
                } | null;
                deal: {
                    id: number;
                    title: string;
                } | null;
                items: {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    sortOrder: number;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    invoiceId: number;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
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
                currency: string;
                title: string;
                leadId: number | null;
                createdBy: number;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                sentAt: Date | null;
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
                viewedAt: Date | null;
                paidAt: Date | null;
            })[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    getNextNumber(): Promise<{
        success: boolean;
        data: {
            nextNumber: string;
        };
    }>;
    previewPdf(id: string, res: Response): Promise<void>;
    downloadPdf(id: string, res: Response): Promise<void>;
    get(id: string, user?: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            invoice: {
                items: {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    sortOrder: number;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    invoiceId: number;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
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
                currency: string;
                title: string;
                leadId: number | null;
                createdBy: number;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                sentAt: Date | null;
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
                viewedAt: Date | null;
                paidAt: Date | null;
            };
        };
        message?: undefined;
    }>;
    create(dto: CreateInvoiceDto, user?: any): Promise<{
        success: boolean;
        data: {
            invoice: {
                items: {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    sortOrder: number;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    invoiceId: number;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                notes: string | null;
                description: string | null;
                currency: string;
                title: string;
                leadId: number | null;
                createdBy: number;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                sentAt: Date | null;
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
                viewedAt: Date | null;
                paidAt: Date | null;
            };
        };
    }>;
    update(id: string, dto: UpdateInvoiceDto): Promise<{
        success: boolean;
        data: {
            invoice: {
                items: {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    sortOrder: number;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    invoiceId: number;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                notes: string | null;
                description: string | null;
                currency: string;
                title: string;
                leadId: number | null;
                createdBy: number;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                sentAt: Date | null;
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
                viewedAt: Date | null;
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
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                sortOrder: number;
                unit: string | null;
                taxRate: import("@prisma/client/runtime/library").Decimal;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                invoiceId: number;
                productId: number | null;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                discountRate: import("@prisma/client/runtime/library").Decimal;
            };
        };
    }>;
    updateItem(itemId: string, dto: UpsertInvoiceItemDto): Promise<{
        success: boolean;
        data: {
            item: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                sortOrder: number;
                unit: string | null;
                taxRate: import("@prisma/client/runtime/library").Decimal;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                invoiceId: number;
                productId: number | null;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                discountRate: import("@prisma/client/runtime/library").Decimal;
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
                notes: string | null;
                description: string | null;
                currency: string;
                title: string;
                leadId: number | null;
                createdBy: number;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                sentAt: Date | null;
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
                viewedAt: Date | null;
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
