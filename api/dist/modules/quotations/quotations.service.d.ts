import { PrismaService } from '../../database/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { UpsertQuotationItemDto } from './dto/upsert-quotation-item.dto';
import { CreateQuotationItemDto } from './dto/create-quotation.dto';
export declare class QuotationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getTemplate(): Promise<{
        success: boolean;
        data: {
            users: {
                email: string;
                firstName: string;
                lastName: string;
                id: number;
            }[];
        };
    }>;
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
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    quotationId: number;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
                    sortOrder: number;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                description: string | null;
                expiresAt: Date | null;
                notes: string | null;
                title: string;
                currency: string;
                status: import("@prisma/client").$Enums.QuotationStatus;
                contactId: number | null;
                leadId: number | null;
                createdBy: number;
                dealId: number | null;
                quotationNumber: string;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                validUntil: Date | null;
                terms: string | null;
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
                lead: {
                    industry: string | null;
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    companyId: number | null;
                    deletedAt: Date | null;
                    phone: string | null;
                    company: string | null;
                    position: string | null;
                    address: string | null;
                    website: string | null;
                    notes: string | null;
                    currency: string | null;
                    status: import("@prisma/client").$Enums.LeadStatus;
                    companySize: number | null;
                    annualRevenue: import("@prisma/client/runtime/library").Decimal | null;
                    country: string | null;
                    state: string | null;
                    city: string | null;
                    zipCode: string | null;
                    linkedinProfile: string | null;
                    timezone: string | null;
                    preferredContactMethod: string | null;
                    sourceId: number | null;
                    priority: import("@prisma/client").$Enums.LeadPriority;
                    assignedTo: number | null;
                    budget: import("@prisma/client/runtime/library").Decimal | null;
                    leadScore: number | null;
                    lastContactedAt: Date | null;
                    nextFollowUpAt: Date | null;
                    convertedToContactId: number | null;
                } | null;
                contact: {
                    industry: string | null;
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    companyId: number | null;
                    deletedAt: Date | null;
                    phone: string | null;
                    company: string | null;
                    position: string | null;
                    address: string | null;
                    website: string | null;
                    notes: string | null;
                    country: string | null;
                    state: string | null;
                    city: string | null;
                    zipCode: string | null;
                    linkedinProfile: string | null;
                    timezone: string | null;
                    preferredContactMethod: string | null;
                    assignedTo: number | null;
                    leadScore: number | null;
                    tags: string[];
                    lastContactedAt: Date | null;
                    alternatePhone: string | null;
                    birthday: Date | null;
                    blacklistReason: string | null;
                    department: string | null;
                    isBlacklisted: boolean;
                    sourceLeadId: number | null;
                    twitterHandle: string | null;
                } | null;
                deal: {
                    id: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    companyId: number | null;
                    deletedAt: Date | null;
                    description: string | null;
                    title: string;
                    value: import("@prisma/client/runtime/library").Decimal;
                    currency: string;
                    status: import("@prisma/client").$Enums.DealStatus;
                    probability: number;
                    expectedCloseDate: Date | null;
                    assignedTo: number | null;
                    actualCloseDate: Date | null;
                    contactId: number | null;
                    leadId: number | null;
                } | null;
                items: {
                    name: string;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    quotationId: number;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
                    sortOrder: number;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                description: string | null;
                expiresAt: Date | null;
                notes: string | null;
                title: string;
                currency: string;
                status: import("@prisma/client").$Enums.QuotationStatus;
                contactId: number | null;
                leadId: number | null;
                createdBy: number;
                dealId: number | null;
                quotationNumber: string;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                validUntil: Date | null;
                terms: string | null;
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
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    quotationId: number;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
                    sortOrder: number;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                description: string | null;
                expiresAt: Date | null;
                notes: string | null;
                title: string;
                currency: string;
                status: import("@prisma/client").$Enums.QuotationStatus;
                contactId: number | null;
                leadId: number | null;
                createdBy: number;
                dealId: number | null;
                quotationNumber: string;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                validUntil: Date | null;
                terms: string | null;
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
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    quotationId: number;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
                    sortOrder: number;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                description: string | null;
                expiresAt: Date | null;
                notes: string | null;
                title: string;
                currency: string;
                status: import("@prisma/client").$Enums.QuotationStatus;
                contactId: number | null;
                leadId: number | null;
                createdBy: number;
                dealId: number | null;
                quotationNumber: string;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                validUntil: Date | null;
                terms: string | null;
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
                subtotal: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                quotationId: number;
                unit: string | null;
                taxRate: import("@prisma/client/runtime/library").Decimal;
                productId: number | null;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                discountRate: import("@prisma/client/runtime/library").Decimal;
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
                subtotal: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                quotationId: number;
                unit: string | null;
                taxRate: import("@prisma/client/runtime/library").Decimal;
                productId: number | null;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                discountRate: import("@prisma/client/runtime/library").Decimal;
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
                description: string | null;
                expiresAt: Date | null;
                notes: string | null;
                title: string;
                currency: string;
                status: import("@prisma/client").$Enums.QuotationStatus;
                contactId: number | null;
                leadId: number | null;
                createdBy: number;
                dealId: number | null;
                quotationNumber: string;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                validUntil: Date | null;
                terms: string | null;
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
                description: string | null;
                expiresAt: Date | null;
                notes: string | null;
                title: string;
                currency: string;
                status: import("@prisma/client").$Enums.QuotationStatus;
                contactId: number | null;
                leadId: number | null;
                createdBy: number;
                dealId: number | null;
                quotationNumber: string;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                validUntil: Date | null;
                terms: string | null;
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
                description: string | null;
                expiresAt: Date | null;
                notes: string | null;
                title: string;
                currency: string;
                status: import("@prisma/client").$Enums.QuotationStatus;
                contactId: number | null;
                leadId: number | null;
                createdBy: number;
                dealId: number | null;
                quotationNumber: string;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                validUntil: Date | null;
                terms: string | null;
                sentAt: Date | null;
                viewedAt: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
            };
        };
    }>;
    buildPdf(id: number): Promise<{
        buffer: Buffer;
        filename: string;
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
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    invoiceId: number;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
                    sortOrder: number;
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
                contactId: number | null;
                leadId: number | null;
                dueDate: Date | null;
                createdBy: number;
                dealId: number | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
                sentAt: Date | null;
                viewedAt: Date | null;
                invoiceNumber: string;
                paidAmount: import("@prisma/client/runtime/library").Decimal;
                quotationId: number | null;
                paidAt: Date | null;
            };
        };
        message?: undefined;
    }>;
}
