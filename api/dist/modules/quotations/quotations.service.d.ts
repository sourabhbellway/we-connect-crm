import { PrismaService } from '../../database/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { UpsertQuotationItemDto } from './dto/upsert-quotation-item.dto';
import { CreateQuotationItemDto } from './dto/create-quotation.dto';
export declare class QuotationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list({ page, limit, search, status, }: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<{
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
                    quotationId: number;
                    sortOrder: number;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                expiresAt: Date | null;
                notes: string | null;
                status: import("@prisma/client").$Enums.QuotationStatus;
                currency: string;
                title: string;
                description: string | null;
                leadId: number | null;
                contactId: number | null;
                quotationNumber: string;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                validUntil: Date | null;
                terms: string | null;
                dealId: number | null;
                createdBy: number;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                sentAt: Date | null;
                viewedAt: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
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
            quotation: {
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
                    quotationId: number;
                    sortOrder: number;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                expiresAt: Date | null;
                notes: string | null;
                status: import("@prisma/client").$Enums.QuotationStatus;
                currency: string;
                title: string;
                description: string | null;
                leadId: number | null;
                contactId: number | null;
                quotationNumber: string;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                validUntil: Date | null;
                terms: string | null;
                dealId: number | null;
                createdBy: number;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                sentAt: Date | null;
                viewedAt: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
            };
        };
        message?: undefined;
    }>;
    private calcTotals;
    create(dto: CreateQuotationDto): Promise<{
        success: boolean;
        data: {
            quotation: {
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
                    quotationId: number;
                    sortOrder: number;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                expiresAt: Date | null;
                notes: string | null;
                status: import("@prisma/client").$Enums.QuotationStatus;
                currency: string;
                title: string;
                description: string | null;
                leadId: number | null;
                contactId: number | null;
                quotationNumber: string;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                validUntil: Date | null;
                terms: string | null;
                dealId: number | null;
                createdBy: number;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                sentAt: Date | null;
                viewedAt: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
            };
        };
    }>;
    update(id: number, dto: UpdateQuotationDto): Promise<{
        success: boolean;
        data: {
            quotation: {
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
                    quotationId: number;
                    sortOrder: number;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                expiresAt: Date | null;
                notes: string | null;
                status: import("@prisma/client").$Enums.QuotationStatus;
                currency: string;
                title: string;
                description: string | null;
                leadId: number | null;
                contactId: number | null;
                quotationNumber: string;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                validUntil: Date | null;
                terms: string | null;
                dealId: number | null;
                createdBy: number;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                sentAt: Date | null;
                viewedAt: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
            };
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    addItem(id: number, dto: CreateQuotationItemDto): Promise<{
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
                quotationId: number;
                sortOrder: number;
            };
        };
    }>;
    updateItem(itemId: number, dto: UpsertQuotationItemDto): Promise<{
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
                quotationId: number;
                sortOrder: number;
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
            quotation: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                expiresAt: Date | null;
                notes: string | null;
                status: import("@prisma/client").$Enums.QuotationStatus;
                currency: string;
                title: string;
                description: string | null;
                leadId: number | null;
                contactId: number | null;
                quotationNumber: string;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                validUntil: Date | null;
                terms: string | null;
                dealId: number | null;
                createdBy: number;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                sentAt: Date | null;
                viewedAt: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
            };
        };
    }>;
    markAccepted(id: number): Promise<{
        success: boolean;
        data: {
            quotation: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                expiresAt: Date | null;
                notes: string | null;
                status: import("@prisma/client").$Enums.QuotationStatus;
                currency: string;
                title: string;
                description: string | null;
                leadId: number | null;
                contactId: number | null;
                quotationNumber: string;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                validUntil: Date | null;
                terms: string | null;
                dealId: number | null;
                createdBy: number;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                sentAt: Date | null;
                viewedAt: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
            };
        };
    }>;
    markRejected(id: number): Promise<{
        success: boolean;
        data: {
            quotation: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                expiresAt: Date | null;
                notes: string | null;
                status: import("@prisma/client").$Enums.QuotationStatus;
                currency: string;
                title: string;
                description: string | null;
                leadId: number | null;
                contactId: number | null;
                quotationNumber: string;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                validUntil: Date | null;
                terms: string | null;
                dealId: number | null;
                createdBy: number;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                sentAt: Date | null;
                viewedAt: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
            };
        };
    }>;
    generateInvoice(id: number): Promise<{
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
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                notes: string | null;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                currency: string;
                title: string;
                description: string | null;
                leadId: number | null;
                contactId: number | null;
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
}
