import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
export declare class DealsController {
    private readonly deals;
    constructor(deals: DealsService);
    list(page?: string, limit?: string, search?: string): Promise<{
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
    get(id: string): Promise<{
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
                actualCloseDate: Date | null;
                contactId: number | null;
                leadId: number | null;
            };
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
