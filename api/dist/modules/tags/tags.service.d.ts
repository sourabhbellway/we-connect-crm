import { PrismaService } from '../../database/prisma.service';
import { UpsertTagDto } from './dto/upsert-tag.dto';
export declare class TagsService {
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
            color: string;
        }[];
    }>;
    create(dto: UpsertTagDto): Promise<{
        success: boolean;
        data: {
            name: string;
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            description: string | null;
            color: string;
        };
    }>;
    update(id: number, dto: UpsertTagDto): Promise<{
        success: boolean;
        data: {
            name: string;
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            description: string | null;
            color: string;
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
