import { PrismaService } from '../../database/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { UpsertQuotationItemDto } from './dto/upsert-quotation-item.dto';
import { CreateQuotationItemDto } from './dto/create-quotation.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class QuotationsService {
    private readonly prisma;
    private readonly notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
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
                    quotationId: number;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
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
                title: string;
                leadId: number | null;
                createdBy: number;
                status: import("@prisma/client").$Enums.QuotationStatus;
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
    getById(id: number, user?: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            quotation: {
                companies: {
                    email: string | null;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    notes: string | null;
                    id: number;
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
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    notes: string | null;
                    id: number;
                    companyId: number | null;
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
                    previousStatus: import("@prisma/client").$Enums.LeadStatus | null;
                    convertedToDealId: number | null;
                } | null;
                deal: {
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    id: number;
                    companyId: number | null;
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
                    quotationId: number;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
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
                title: string;
                leadId: number | null;
                createdBy: number;
                status: import("@prisma/client").$Enums.QuotationStatus;
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
    getNextNumber(): Promise<{
        success: boolean;
        data: {
            nextNumber: string;
        };
    }>;
    private calcTotals;
    create(dto: CreateQuotationDto): Promise<{
        success: boolean;
        data: {
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
                quotationId: number;
                productId: number | null;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                discountRate: import("@prisma/client/runtime/library").Decimal;
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
            title: string;
            leadId: number | null;
            createdBy: number;
            status: import("@prisma/client").$Enums.QuotationStatus;
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
    update(id: number, dto: UpdateQuotationDto): Promise<{
        success: boolean;
        data: {
            quotation: {
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
                    quotationId: number;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
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
                title: string;
                leadId: number | null;
                createdBy: number;
                status: import("@prisma/client").$Enums.QuotationStatus;
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
    remove(id: number): Promise<{
        success: boolean;
    }>;
    addItem(id: number, dto: CreateQuotationItemDto): Promise<{
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
                quotationId: number;
                productId: number | null;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                discountRate: import("@prisma/client/runtime/library").Decimal;
            };
        };
    }>;
    updateItem(itemId: number, dto: UpsertQuotationItemDto): Promise<{
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
                quotationId: number;
                productId: number | null;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                discountRate: import("@prisma/client/runtime/library").Decimal;
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
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                notes: string | null;
                id: number;
                companyId: number | null;
                description: string | null;
                currency: string;
                title: string;
                leadId: number | null;
                createdBy: number;
                status: import("@prisma/client").$Enums.QuotationStatus;
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
    markAccepted(id: number): Promise<{
        success: boolean;
        data: {
            quotation: {
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                notes: string | null;
                id: number;
                companyId: number | null;
                description: string | null;
                currency: string;
                title: string;
                leadId: number | null;
                createdBy: number;
                status: import("@prisma/client").$Enums.QuotationStatus;
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
    markRejected(id: number): Promise<{
        success: boolean;
        data: {
            quotation: {
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                notes: string | null;
                id: number;
                companyId: number | null;
                description: string | null;
                currency: string;
                title: string;
                leadId: number | null;
                createdBy: number;
                status: import("@prisma/client").$Enums.QuotationStatus;
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
                    invoiceId: number;
                    productId: number | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    discountRate: import("@prisma/client/runtime/library").Decimal;
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
                title: string;
                leadId: number | null;
                createdBy: number;
                status: import("@prisma/client").$Enums.InvoiceStatus;
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
    bulkAssign(dto: {
        quotationIds: number[];
        userId: number | null;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    bulkExport(opts?: {
        search?: string;
        status?: string;
    }, user?: any): Promise<string>;
    bulkImportFromCsv(file: Express.Multer.File, userId?: number): Promise<{
        success: boolean;
        data: {
            imported: number;
            failed: number;
            errors: {
                row: number;
                error: string;
            }[];
            message: string;
        };
    } | {
        success: boolean;
        message: any;
    }>;
}
