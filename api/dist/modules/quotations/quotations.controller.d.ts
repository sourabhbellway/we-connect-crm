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
    list(page?: string, limit?: string, search?: string, status?: string, entityType?: string, entityId?: string): Promise<{
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
                    quotationId: number;
                    sortOrder: number;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                notes: string | null;
                description: string | null;
                expiresAt: Date | null;
                title: string;
                currency: string;
                status: import("@prisma/client").$Enums.QuotationStatus;
                leadId: number | null;
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
    get(id: string): Promise<{
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
                    notes: string | null;
                    phone: string | null;
                    company: string | null;
                    position: string | null;
                    address: string | null;
                    website: string | null;
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
                    previousStatus: import("@prisma/client").$Enums.LeadStatus | null;
                    convertedToDealId: number | null;
                } | null;
                companies: {
                    name: string;
                    email: string | null;
                    id: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    notes: string | null;
                    description: string | null;
                    phone: string | null;
                    address: string | null;
                    website: string | null;
                    domain: string | null;
                    slug: string | null;
                    industryId: number | null;
                    currency: string | null;
                    status: import("@prisma/client").$Enums.CompanyStatus;
                    companySize: import("@prisma/client").$Enums.CompanySize | null;
                    annualRevenue: import("@prisma/client/runtime/library").Decimal | null;
                    country: string | null;
                    state: string | null;
                    city: string | null;
                    zipCode: string | null;
                    linkedinProfile: string | null;
                    timezone: string | null;
                    assignedTo: number | null;
                    leadScore: number | null;
                    tags: string[];
                    lastContactedAt: Date | null;
                    nextFollowUpAt: Date | null;
                    alternatePhone: string | null;
                    employeeCount: string | null;
                    facebookPage: string | null;
                    foundedYear: number | null;
                    parentCompanyId: number | null;
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
                    leadId: number | null;
                    actualCloseDate: Date | null;
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
                    quotationId: number;
                    sortOrder: number;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                notes: string | null;
                description: string | null;
                expiresAt: Date | null;
                title: string;
                currency: string;
                status: import("@prisma/client").$Enums.QuotationStatus;
                leadId: number | null;
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
    create(body: any): Promise<{
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
                notes: string | null;
                description: string | null;
                expiresAt: Date | null;
                title: string;
                currency: string;
                status: import("@prisma/client").$Enums.QuotationStatus;
                leadId: number | null;
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
    update(id: string, dto: UpdateQuotationDto): Promise<{
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
                notes: string | null;
                description: string | null;
                expiresAt: Date | null;
                title: string;
                currency: string;
                status: import("@prisma/client").$Enums.QuotationStatus;
                leadId: number | null;
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
    remove(id: string): Promise<{
        success: boolean;
    }>;
    addItem(id: string, dto: CreateQuotationItemDto): Promise<{
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
    updateItem(itemId: string, dto: UpsertQuotationItemDto): Promise<{
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
    removeItem(itemId: string): Promise<{
        success: boolean;
    }>;
    send(id: string): Promise<{
        success: boolean;
        data: {
            quotation: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                notes: string | null;
                description: string | null;
                expiresAt: Date | null;
                title: string;
                currency: string;
                status: import("@prisma/client").$Enums.QuotationStatus;
                leadId: number | null;
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
    accept(id: string): Promise<{
        success: boolean;
        data: {
            quotation: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                notes: string | null;
                description: string | null;
                expiresAt: Date | null;
                title: string;
                currency: string;
                status: import("@prisma/client").$Enums.QuotationStatus;
                leadId: number | null;
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
    reject(id: string): Promise<{
        success: boolean;
        data: {
            quotation: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                notes: string | null;
                description: string | null;
                expiresAt: Date | null;
                title: string;
                currency: string;
                status: import("@prisma/client").$Enums.QuotationStatus;
                leadId: number | null;
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
    generateInvoice(id: string): Promise<{
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
                description: string | null;
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
    previewPdf(id: string, res: Response): Promise<void>;
    downloadPdf(id: string, res: Response): Promise<void>;
}
