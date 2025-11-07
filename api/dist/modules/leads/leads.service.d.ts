import { PrismaService } from '../../database/prisma.service';
import { BulkAssignDto } from './dto/bulk-assign.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { TransferLeadDto } from './dto/transfer-lead.dto';
export declare class LeadsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        success: boolean;
        data: {
            total: number;
            converted: number;
            active: number;
        };
    }>;
    list({ page, limit, status, search, isDeleted, }: {
        page: number;
        limit: number;
        status?: string;
        search?: string;
        isDeleted?: boolean;
    }): Promise<{
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
    getById(id: number): Promise<{
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
            budget: import("@prisma/client/runtime/library").Decimal | null;
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
            leadScore: number | null;
            lastContactedAt: Date | null;
            nextFollowUpAt: Date | null;
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
                name: string;
                id: number;
                description: string | null;
            } | null;
            industry: string | null;
            budget: import("@prisma/client/runtime/library").Decimal | null;
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
            assignedTo: number | null;
            leadScore: number | null;
            lastContactedAt: Date | null;
            nextFollowUpAt: Date | null;
            previousStatus: import("@prisma/client").$Enums.LeadStatus | null;
            convertedToDealId: number | null;
        };
    }>;
    update(id: number, dto: UpdateLeadDto): Promise<{
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
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    transfer(id: number, dto: TransferLeadDto): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            industry: string | null;
            budget: import("@prisma/client/runtime/library").Decimal | null;
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
    convert(id: number, dto: ConvertLeadDto): Promise<{
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
    undoLeadConversion(id: number): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            lead: {
                industry: string | null;
                budget: import("@prisma/client/runtime/library").Decimal | null;
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
                leadScore: number | null;
                lastContactedAt: Date | null;
                nextFollowUpAt: Date | null;
                previousStatus: import("@prisma/client").$Enums.LeadStatus | null;
                convertedToDealId: number | null;
            };
        };
    }>;
    restore(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
