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
        data: {
            total: number;
            converted: number;
            active: number;
        };
    }>;
    list(page?: string, limit?: string, status?: string, search?: string, isDeleted?: string): Promise<{
        success: boolean;
        data: {
            leads: any[];
            pagination: {
                totalItems: number;
                currentPage: number;
                pageSize: number;
                totalPages: number;
            };
        };
    }>;
    get(id: string): Promise<{
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
    create(dto: CreateLeadDto): Promise<{
        success: boolean;
        data: {
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
    transfer(id: string, dto: TransferLeadDto): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
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
            };
        };
    }>;
    restore(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
