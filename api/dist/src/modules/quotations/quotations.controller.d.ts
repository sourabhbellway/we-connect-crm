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
                id: number;
                email: string;
                firstName: string;
                lastName: string;
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
                    quotationId: number;
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
                status: import("@prisma/client").$Enums.QuotationStatus;
                expiresAt: Date | null;
                sentAt: Date | null;
                dealId: number | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
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
                companies: {
                    id: number;
                    email: string | null;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    notes: string | null;
                    name: string;
                    description: string | null;
                    currency: string | null;
                    tags: string[];
                    assignedTo: number | null;
                    createdBy: number | null;
                    phone: string | null;
                    status: import("@prisma/client").$Enums.CompanyStatus;
                    lastContactedAt: Date | null;
                    nextFollowUpAt: Date | null;
                    website: string | null;
                    companySize: import("@prisma/client").$Enums.CompanySize | null;
                    annualRevenue: import("@prisma/client/runtime/library").Decimal | null;
                    leadScore: number | null;
                    address: string | null;
                    country: string | null;
                    state: string | null;
                    city: string | null;
                    zipCode: string | null;
                    linkedinProfile: string | null;
                    timezone: string | null;
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
                lead: {
                    id: number;
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    companyId: number | null;
                    deletedAt: Date | null;
                    firstNameAr: string | null;
                    lastNameAr: string | null;
                    notes: string | null;
                    industry: string | null;
                    currency: string | null;
                    budget: import("@prisma/client/runtime/library").Decimal | null;
                    assignedTo: number | null;
                    createdBy: number | null;
                    phone: string | null;
                    company: string | null;
                    position: string | null;
                    status: import("@prisma/client").$Enums.LeadStatus;
                    sourceId: number | null;
                    lastContactedAt: Date | null;
                    nextFollowUpAt: Date | null;
                    priority: import("@prisma/client").$Enums.LeadPriority;
                    leadType: import("@prisma/client").$Enums.LeadType | null;
                    customerType: import("@prisma/client").$Enums.CustomerType | null;
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
                    convertedToDealId: number | null;
                    previousStatus: import("@prisma/client").$Enums.LeadStatus | null;
                    customFields: import("@prisma/client/runtime/library").JsonValue | null;
                    addressAr: string | null;
                    companyAr: string | null;
                } | null;
                deal: {
                    id: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    companyId: number | null;
                    deletedAt: Date | null;
                    description: string | null;
                    currency: string;
                    title: string;
                    leadId: number | null;
                    assignedTo: number | null;
                    createdBy: number | null;
                    status: string;
                    value: import("@prisma/client/runtime/library").Decimal;
                    probability: number;
                    expectedCloseDate: Date | null;
                    actualCloseDate: Date | null;
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
                    quotationId: number;
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
                status: import("@prisma/client").$Enums.QuotationStatus;
                expiresAt: Date | null;
                sentAt: Date | null;
                dealId: number | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
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
                quotationId: number;
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
            status: import("@prisma/client").$Enums.QuotationStatus;
            expiresAt: Date | null;
            sentAt: Date | null;
            dealId: number | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            terms: string | null;
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
                    quotationId: number;
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
                status: import("@prisma/client").$Enums.QuotationStatus;
                expiresAt: Date | null;
                sentAt: Date | null;
                dealId: number | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
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
                quotationId: number;
                productId: number | null;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                discountRate: import("@prisma/client/runtime/library").Decimal;
            };
        };
    }>;
    updateItem(itemId: string, dto: UpsertQuotationItemDto): Promise<{
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
                quotationId: number;
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
            quotation: {
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
                status: import("@prisma/client").$Enums.QuotationStatus;
                expiresAt: Date | null;
                sentAt: Date | null;
                dealId: number | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
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
                status: import("@prisma/client").$Enums.QuotationStatus;
                expiresAt: Date | null;
                sentAt: Date | null;
                dealId: number | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
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
                status: import("@prisma/client").$Enums.QuotationStatus;
                expiresAt: Date | null;
                sentAt: Date | null;
                dealId: number | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                terms: string | null;
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
        message?: undefined;
    }>;
    previewPdf(id: string, lang: string, res: Response): Promise<void>;
    downloadPdf(id: string, lang: string, res: Response): Promise<void>;
}
