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
    list(page?: string, limit?: string, status?: string, search?: string, isDeleted?: string, assignedTo?: string, user?: any): Promise<{
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
                tags: {
                    id: any;
                    name: any;
                    color: any;
                }[];
                source: any;
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
            status: import("@prisma/client").$Enums.LeadStatus;
            createdBy: number | null;
            phone: string | null;
            company: string | null;
            position: string | null;
            website: string | null;
            companySize: number | null;
            annualRevenue: import("@prisma/client/runtime/library").Decimal | null;
            country: string | null;
            state: string | null;
            city: string | null;
            zipCode: string | null;
            address: string | null;
            timezone: string | null;
            linkedinProfile: string | null;
            sourceId: number | null;
            priority: import("@prisma/client").$Enums.LeadPriority;
            assignedTo: number | null;
            leadScore: number | null;
            preferredContactMethod: string | null;
            nextFollowUpAt: Date | null;
            lastContactedAt: Date | null;
            customFields: import("@prisma/client/runtime/library").JsonValue | null;
            previousStatus: import("@prisma/client").$Enums.LeadStatus | null;
            convertedToDealId: number | null;
        } | {
            status: string;
            priority: string | undefined;
            tags: {
                id: any;
                name: any;
                color: any;
            }[];
            source: {
                id: number;
                name: string;
                description: string | null;
            } | null;
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
            createdBy: number | null;
            phone: string | null;
            company: string | null;
            position: string | null;
            website: string | null;
            companySize: number | null;
            annualRevenue: import("@prisma/client/runtime/library").Decimal | null;
            country: string | null;
            state: string | null;
            city: string | null;
            zipCode: string | null;
            address: string | null;
            timezone: string | null;
            linkedinProfile: string | null;
            sourceId: number | null;
            assignedTo: number | null;
            leadScore: number | null;
            preferredContactMethod: string | null;
            nextFollowUpAt: Date | null;
            lastContactedAt: Date | null;
            customFields: import("@prisma/client/runtime/library").JsonValue | null;
            previousStatus: import("@prisma/client").$Enums.LeadStatus | null;
            convertedToDealId: number | null;
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
            status: import("@prisma/client").$Enums.LeadStatus;
            createdBy: number | null;
            phone: string | null;
            company: string | null;
            position: string | null;
            website: string | null;
            companySize: number | null;
            annualRevenue: import("@prisma/client/runtime/library").Decimal | null;
            country: string | null;
            state: string | null;
            city: string | null;
            zipCode: string | null;
            address: string | null;
            timezone: string | null;
            linkedinProfile: string | null;
            sourceId: number | null;
            priority: import("@prisma/client").$Enums.LeadPriority;
            assignedTo: number | null;
            leadScore: number | null;
            preferredContactMethod: string | null;
            nextFollowUpAt: Date | null;
            lastContactedAt: Date | null;
            customFields: import("@prisma/client/runtime/library").JsonValue | null;
            previousStatus: import("@prisma/client").$Enums.LeadStatus | null;
            convertedToDealId: number | null;
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
                status: import("@prisma/client").$Enums.LeadStatus;
                createdBy: number | null;
                phone: string | null;
                company: string | null;
                position: string | null;
                website: string | null;
                companySize: number | null;
                annualRevenue: import("@prisma/client/runtime/library").Decimal | null;
                country: string | null;
                state: string | null;
                city: string | null;
                zipCode: string | null;
                address: string | null;
                timezone: string | null;
                linkedinProfile: string | null;
                sourceId: number | null;
                priority: import("@prisma/client").$Enums.LeadPriority;
                assignedTo: number | null;
                leadScore: number | null;
                preferredContactMethod: string | null;
                nextFollowUpAt: Date | null;
                lastContactedAt: Date | null;
                customFields: import("@prisma/client/runtime/library").JsonValue | null;
                previousStatus: import("@prisma/client").$Enums.LeadStatus | null;
                convertedToDealId: number | null;
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
    bulkExport(res: Response, status?: string, search?: string): Promise<void>;
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
