import { PrismaService } from '../../database/prisma.service';
import { UpsertLeadSourceDto } from './dto/upsert-lead-source.dto';
export declare class LeadSourcesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private generateUniqueColor;
    list(): Promise<{
        success: boolean;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            companyId: number | null;
            color: string;
            sortOrder: number;
        }[];
    }>;
    create(dto: UpsertLeadSourceDto): Promise<{
        success: boolean;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            companyId: number | null;
            color: string;
            sortOrder: number;
        };
    }>;
    update(id: number, dto: UpsertLeadSourceDto): Promise<{
        success: boolean;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            companyId: number | null;
            color: string;
            sortOrder: number;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
