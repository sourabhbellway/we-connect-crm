import { PrismaService } from '../../database/prisma.service';
import { UpsertTagDto } from './dto/upsert-tag.dto';
export declare class TagsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private predefinedColors;
    private generateUniqueColor;
    list(): Promise<{
        success: boolean;
        data: {
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            companyId: number | null;
            name: string;
            description: string | null;
            color: string;
        }[];
    }>;
    create(dto: UpsertTagDto): Promise<{
        success: boolean;
        data: {
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            companyId: number | null;
            name: string;
            description: string | null;
            color: string;
        };
    }>;
    update(id: number, dto: UpsertTagDto): Promise<{
        success: boolean;
        data: {
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            companyId: number | null;
            name: string;
            description: string | null;
            color: string;
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
