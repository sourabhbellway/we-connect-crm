import type { Response } from 'express';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { TransferLeadDto } from './dto/transfer-lead.dto';
import { BulkAssignDto } from './dto/bulk-assign.dto';
export declare class LeadsController {
    private readonly leads;
    constructor(leads: LeadsService);
    getStats(): Promise<{
        success: boolean;
        data: any;
    }>;
    list(page?: string, limit?: string, status?: string, priority?: string, search?: string, email?: string, phone?: string, isDeleted?: string, assignedTo?: string, ownerId?: string, createdBy?: string, sourceId?: string, industry?: string, city?: string, state?: string, country?: string, startDate?: string, endDate?: string, productId?: string, sortBy?: string, sortOrder?: 'asc' | 'desc', user?: any): Promise<{
        success: boolean;
        data: {
            leads: {
                id: any;
                firstName: any;
                lastName: any;
                email: any;
                phone: any;
                company: any;
                position: any;
                status: string;
                notes: any;
                isActive: any;
                createdAt: any;
                updatedAt: any;
                sourceId: any;
                assignedTo: any;
                ownerId: any;
                companyId: any;
                deletedAt: any;
                budget: any;
                currency: any;
                lastContactedAt: any;
                nextFollowUpAt: any;
                priority: string | undefined;
                industry: any;
                website: any;
                companySize: any;
                annualRevenue: any;
                leadScore: any;
                productId: any;
                address: any;
                country: any;
                state: any;
                city: any;
                zipCode: any;
                linkedinProfile: any;
                timezone: any;
                preferredContactMethod: any;
                previousStatus: any;
                convertedToDealId: any;
                assignedUser: any;
                ownerUser: any;
                tags: {
                    id: any;
                    name: any;
                    color: any;
                }[];
                source: any;
                products: any;
            }[];
            pagination: {
                totalItems: number;
                currentPage: number;
                pageSize: number;
                totalPages: number;
            };
        };
    }>;
    get(id: string, user?: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            lead: any;
        };
        message?: undefined;
    }>;
    create(dto: CreateLeadDto, user?: any): Promise<{
        success: boolean;
        data: {
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
        } | {
            status: string;
            priority: string | undefined;
            tags: {
                id: any;
                name: any;
                color: any;
            }[];
            products: {
                productId: any;
                name: any;
                quantity: any;
                price: number;
                sku: any;
                currency: any;
            }[];
            assignedUser: {
                email: string;
                firstName: string;
                lastName: string;
                id: number;
            } | null;
            ownerUser: {
                email: string;
                firstName: string;
                lastName: string;
                id: number;
            } | null;
            source: {
                description: string | null;
                id: number;
                name: string;
            } | null;
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
            previousStatus: string | null;
        };
    }>;
    update(id: string, dto: UpdateLeadDto): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            lead: any;
        };
        message?: undefined;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deletePermanently(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    transfer(id: string, dto: TransferLeadDto): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            lead: {
                status: string;
                priority: string | undefined;
                tags: {
                    id: any;
                    name: any;
                    color: any;
                }[];
                products: {
                    productId: any;
                    name: any;
                    quantity: any;
                    price: number;
                    sku: any;
                    currency: any;
                }[];
                assignedUser: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                } | null;
                ownerUser: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                } | null;
                source: {
                    description: string | null;
                    id: number;
                    name: string;
                } | null;
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
                previousStatus: string | null;
            };
        };
    } | {
        success: boolean;
        message: string;
        data: {
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
            };
        };
    }>;
    bulkAssign(dto: BulkAssignDto): Promise<{
        success: boolean;
        message: string;
    }>;
    convert(id: string, dto: ConvertLeadDto): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            lead: any;
            company: any;
            deal: any;
        };
        message?: undefined;
    }>;
    undoConversion(id: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
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
            };
        };
    }>;
    restore(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    bulkImportLeads(file: Express.Multer.File): Promise<{
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
    bulkExport(res: Response, status?: string, search?: string, ids?: string, user?: any): Promise<void>;
    syncAllIntegrations(): Promise<{
        success: boolean;
        data: {
            synced: number;
            integrations: any[];
            message: string;
        };
    } | {
        success: boolean;
        message: string;
        data: {
            synced: number;
            integrations: never[];
        };
    }>;
}
