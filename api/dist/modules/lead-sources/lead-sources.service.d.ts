import { PrismaService } from '../../database/prisma.service';
import { UpsertLeadSourceDto } from './dto/upsert-lead-source.dto';
export declare class LeadSourcesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): Promise<{
        success: boolean;
        data: {
            name: string;
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            description: string | null;
        }[];
    }>;
    create(dto: UpsertLeadSourceDto): Promise<{
        success: boolean;
        data: {
            name: string;
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            description: string | null;
        };
    }>;
    update(id: number, dto: UpsertLeadSourceDto): Promise<{
        success: boolean;
        data: {
            name: string;
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            description: string | null;
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
