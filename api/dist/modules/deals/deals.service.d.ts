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
            deals: any[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    getById(id: number): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: any;
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
            };
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
