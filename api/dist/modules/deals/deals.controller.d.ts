import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
export declare class DealsController {
    private readonly deals;
    constructor(deals: DealsService);
    list(page?: string, limit?: string, search?: string): Promise<{
        success: boolean;
        data: {
            items: {
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
                contactId: number | null;
                leadId: number | null;
                actualCloseDate: Date | null;
            }[];
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
                contactId: number | null;
                leadId: number | null;
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
                description: string | null;
                title: string;
                value: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                status: import("@prisma/client").$Enums.DealStatus;
                probability: number;
                expectedCloseDate: Date | null;
                assignedTo: number | null;
                contactId: number | null;
                leadId: number | null;
                actualCloseDate: Date | null;
            };
        };
    }>;
    update(id: string, dto: UpdateDealDto): Promise<{
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
                contactId: number | null;
                leadId: number | null;
                actualCloseDate: Date | null;
            };
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
