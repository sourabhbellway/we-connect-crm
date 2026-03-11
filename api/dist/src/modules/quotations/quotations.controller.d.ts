import { QuotationsService } from './quotations.service';
import type { Response } from 'express';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { UpsertQuotationItemDto } from './dto/upsert-quotation-item.dto';
import { CreateQuotationItemDto } from './dto/create-quotation.dto';
export declare class QuotationsController {
    private readonly service;
    constructor(service: QuotationsService);
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
    getNextNumber(): Promise<{
        success: boolean;
        data: {
            nextNumber: string;
        };
    }>;
    list(page?: string, limit?: string, search?: string, status?: string, entityType?: string, entityId?: string, user?: any): Promise<{
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
                    title: string;
                    id: number;
                } | null;
                items: {
                    description: string | null;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    sortOrder: number;
                    productId: number | null;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    quotationId: number;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
                }[];
            } & {
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
                status: import(".prisma/client").$Enums.QuotationStatus;
                expiresAt: Date | null;
                dealId: number | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
                sentAt: Date | null;
                viewedAt: Date | null;
                quotationNumber: string;
                validUntil: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
            })[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    get(id: string, user?: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            quotation: {
                lead: {
                    industry: string | null;
                    currency: string | null;
                    budget: import("@prisma/client/runtime/library").Decimal | null;
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
                    assignedTo: number | null;
                    createdBy: number | null;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    isActive: boolean;
                    companyId: number | null;
                    deletedAt: Date | null;
                    notes: string | null;
                    phone: string | null;
                    company: string | null;
                    position: string | null;
                    sourceId: number | null;
                    lastContactedAt: Date | null;
                    nextFollowUpAt: Date | null;
                    priority: import(".prisma/client").$Enums.LeadPriority;
                    website: string | null;
                    companySize: number | null;
                    annualRevenue: import("@prisma/client/runtime/library").Decimal | null;
                    leadScore: number | null;
                    address: string | null;
                    country: string | null;
                    state: string | null;
                    city: string | null;
                    zipCode: string | null;
                    linkedinProfile: string | null;
                    timezone: string | null;
                    preferredContactMethod: string | null;
                    customFields: import("@prisma/client/runtime/library").JsonValue | null;
                    convertedToDealId: number | null;
                    ownerId: number | null;
                    status: string;
                    previousStatus: string | null;
                } | null;
                companies: {
                    currency: string | null;
                    email: string | null;
                    description: string | null;
                    tags: string[];
                    assignedTo: number | null;
                    createdBy: number | null;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    isActive: boolean;
                    deletedAt: Date | null;
                    notes: string | null;
                    phone: string | null;
                    lastContactedAt: Date | null;
                    nextFollowUpAt: Date | null;
                    website: string | null;
                    companySize: import(".prisma/client").$Enums.CompanySize | null;
                    annualRevenue: import("@prisma/client/runtime/library").Decimal | null;
                    leadScore: number | null;
                    address: string | null;
                    country: string | null;
                    state: string | null;
                    city: string | null;
                    zipCode: string | null;
                    linkedinProfile: string | null;
                    timezone: string | null;
                    status: import(".prisma/client").$Enums.CompanyStatus;
                    employeeCount: string | null;
                    domain: string | null;
                    slug: string | null;
                    industryId: number | null;
                    alternatePhone: string | null;
                    facebookPage: string | null;
                    foundedYear: number | null;
                    parentCompanyId: number | null;
                    twitterHandle: string | null;
                } | null;
                deal: {
                    currency: string;
                    title: string;
                    description: string | null;
                    leadId: number | null;
                    assignedTo: number | null;
                    createdBy: number | null;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    isActive: boolean;
                    companyId: number | null;
                    deletedAt: Date | null;
                    status: string;
                    value: import("@prisma/client/runtime/library").Decimal;
                    probability: number;
                    expectedCloseDate: Date | null;
                    actualCloseDate: Date | null;
                } | null;
                items: {
                    description: string | null;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    sortOrder: number;
                    productId: number | null;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    quotationId: number;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
                }[];
            } & {
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
                status: import(".prisma/client").$Enums.QuotationStatus;
                expiresAt: Date | null;
                dealId: number | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
                sentAt: Date | null;
                viewedAt: Date | null;
                quotationNumber: string;
                validUntil: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
            };
        };
        message?: undefined;
    }>;
    create(body: any, user?: any): Promise<{
        success: boolean;
        data: {
            items: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                sortOrder: number;
                productId: number | null;
                unit: string | null;
                taxRate: import("@prisma/client/runtime/library").Decimal;
                quantity: import("@prisma/client/runtime/library").Decimal;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                quotationId: number;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                discountRate: import("@prisma/client/runtime/library").Decimal;
            }[];
        } & {
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
            status: import(".prisma/client").$Enums.QuotationStatus;
            expiresAt: Date | null;
            dealId: number | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            terms: string | null;
            sentAt: Date | null;
            viewedAt: Date | null;
            quotationNumber: string;
            validUntil: Date | null;
            acceptedAt: Date | null;
            rejectedAt: Date | null;
        };
    }>;
    update(id: string, dto: UpdateQuotationDto): Promise<{
        success: boolean;
        data: {
            quotation: {
                items: {
                    description: string | null;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    sortOrder: number;
                    productId: number | null;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    quotationId: number;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
                }[];
            } & {
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
                status: import(".prisma/client").$Enums.QuotationStatus;
                expiresAt: Date | null;
                dealId: number | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
                sentAt: Date | null;
                viewedAt: Date | null;
                quotationNumber: string;
                validUntil: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
            };
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    addItem(id: string, dto: CreateQuotationItemDto): Promise<{
        success: boolean;
        data: {
            item: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                sortOrder: number;
                productId: number | null;
                unit: string | null;
                taxRate: import("@prisma/client/runtime/library").Decimal;
                quantity: import("@prisma/client/runtime/library").Decimal;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                quotationId: number;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                discountRate: import("@prisma/client/runtime/library").Decimal;
            };
        };
    }>;
    updateItem(itemId: string, dto: UpsertQuotationItemDto): Promise<{
        success: boolean;
        data: {
            item: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                sortOrder: number;
                productId: number | null;
                unit: string | null;
                taxRate: import("@prisma/client/runtime/library").Decimal;
                quantity: import("@prisma/client/runtime/library").Decimal;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                quotationId: number;
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
            quotation: {
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
                status: import(".prisma/client").$Enums.QuotationStatus;
                expiresAt: Date | null;
                dealId: number | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
                sentAt: Date | null;
                viewedAt: Date | null;
                quotationNumber: string;
                validUntil: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
            };
        };
    }>;
    accept(id: string): Promise<{
        success: boolean;
        data: {
            quotation: {
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
                status: import(".prisma/client").$Enums.QuotationStatus;
                expiresAt: Date | null;
                dealId: number | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
                sentAt: Date | null;
                viewedAt: Date | null;
                quotationNumber: string;
                validUntil: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
            };
        };
    }>;
    reject(id: string): Promise<{
        success: boolean;
        data: {
            quotation: {
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
                status: import(".prisma/client").$Enums.QuotationStatus;
                expiresAt: Date | null;
                dealId: number | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
                sentAt: Date | null;
                viewedAt: Date | null;
                quotationNumber: string;
                validUntil: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
            };
        };
    }>;
    generateInvoice(id: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            invoice: {
                items: {
                    description: string | null;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    sortOrder: number;
                    productId: number | null;
                    unit: string | null;
                    taxRate: import("@prisma/client/runtime/library").Decimal;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    invoiceId: number;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
                }[];
            } & {
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
        };
        message?: undefined;
    }>;
    previewPdf(id: string, res: Response): Promise<void>;
    downloadPdf(id: string, res: Response): Promise<void>;
}
