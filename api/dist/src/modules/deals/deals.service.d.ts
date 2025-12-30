import { PrismaService } from '../../database/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { AutomationService } from '../automation/automation.service';
export declare class DealsService {
    private readonly prisma;
    private readonly notificationsService;
    private readonly automationService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, automationService: AutomationService);
    list({ page, limit, search, }: {
        page?: number;
        limit?: number;
        search?: string;
    }, user?: any): Promise<{
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
    getById(id: number, user?: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: any;
        message?: undefined;
    }>;
    create(dto: CreateDealDto, userId?: number): Promise<{
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
                status: string;
                createdBy: number | null;
                assignedTo: number | null;
                value: import("@prisma/client/runtime/library").Decimal;
                title: string;
                probability: number;
                expectedCloseDate: Date | null;
                leadId: number | null;
                actualCloseDate: Date | null;
            };
        };
    }>;
    update(id: number, dto: UpdateDealDto): Promise<{
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
                status: string;
                createdBy: number | null;
                assignedTo: number | null;
                value: import("@prisma/client/runtime/library").Decimal;
                title: string;
                probability: number;
                expectedCloseDate: Date | null;
                leadId: number | null;
                actualCloseDate: Date | null;
            };
        };
    }>;
    remove(id: number): Promise<{
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
    bulkExport(opts?: {
        search?: string;
    }, user?: any): Promise<string>;
}
