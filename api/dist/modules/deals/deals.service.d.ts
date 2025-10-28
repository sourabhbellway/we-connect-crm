import { PrismaService } from '../../database/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
export declare class DealsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list({ page, limit, search, }: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        success: boolean;
        data: {
            items: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                status: import("@prisma/client").$Enums.DealStatus;
                assignedTo: number | null;
                currency: string;
                title: string;
                description: string | null;
                value: import("@prisma/client/runtime/library").Decimal;
                probability: number;
                expectedCloseDate: Date | null;
                leadId: number | null;
                contactId: number | null;
                actualCloseDate: Date | null;
            }[];
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
            deal: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                status: import("@prisma/client").$Enums.DealStatus;
                assignedTo: number | null;
                currency: string;
                title: string;
                description: string | null;
                value: import("@prisma/client/runtime/library").Decimal;
                probability: number;
                expectedCloseDate: Date | null;
                leadId: number | null;
                contactId: number | null;
                actualCloseDate: Date | null;
            };
        };
        message?: undefined;
    }>;
    create(dto: CreateDealDto): Promise<{
        success: boolean;
        message: string;
        data: {
            deal: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                status: import("@prisma/client").$Enums.DealStatus;
                assignedTo: number | null;
                currency: string;
                title: string;
                description: string | null;
                value: import("@prisma/client/runtime/library").Decimal;
                probability: number;
                expectedCloseDate: Date | null;
                leadId: number | null;
                contactId: number | null;
                actualCloseDate: Date | null;
            };
        };
    }>;
    update(id: number, dto: UpdateDealDto): Promise<{
        success: boolean;
        message: string;
        data: {
            deal: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                status: import("@prisma/client").$Enums.DealStatus;
                assignedTo: number | null;
                currency: string;
                title: string;
                description: string | null;
                value: import("@prisma/client/runtime/library").Decimal;
                probability: number;
                expectedCloseDate: Date | null;
                leadId: number | null;
                contactId: number | null;
                actualCloseDate: Date | null;
            };
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
