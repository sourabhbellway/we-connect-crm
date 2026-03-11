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
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            companyId: number | null;
            color: string;
        }[];
    }>;
    create(dto: UpsertTagDto): Promise<{
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
        };
    }>;
    update(id: number, dto: UpsertTagDto): Promise<{
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
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
