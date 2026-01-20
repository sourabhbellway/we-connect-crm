import type { Response } from 'express';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
export declare class DealsController {
    private readonly deals;
    constructor(deals: DealsService);
    list(page?: string, limit?: string, search?: string, user?: any): Promise<{
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
    get(id: string, user?: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: any;
        message?: undefined;
    }>;
    create(dto: CreateDealDto, user?: any): Promise<{
        success: boolean;
        message: string;
        data: {
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
            };
        };
    }>;
    update(id: string, dto: UpdateDealDto): Promise<{
        success: boolean;
        message: string;
        data: {
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
            };
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    bulkAssign(dto: {
        dealIds: number[];
        userId: number | null;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    bulkImportDeals(file: Express.Multer.File, user?: any): Promise<{
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
    bulkExport(res: Response, search?: string, user?: any): Promise<void>;
}
