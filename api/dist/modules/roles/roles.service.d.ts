import { PrismaService } from '../../database/prisma.service';
import { UpsertRoleDto } from './dto/upsert-role.dto';
export declare class RolesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list({ search, page, limit, }: {
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        success: boolean;
        data: {
            items: {
                name: string;
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
            }[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    create(dto: UpsertRoleDto): Promise<{
        success: boolean;
        data: {
            name: string;
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
        };
    }>;
    update(id: number, dto: UpsertRoleDto): Promise<{
        success: boolean;
        data: {
            name: string;
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
