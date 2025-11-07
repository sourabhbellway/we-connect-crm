import { PrismaService } from '../../database/prisma.service';
import { UpsertRoleDto } from './dto/upsert-role.dto';
export declare class RolesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list({ search, page, limit, isDeleted, }: {
        search?: string;
        page?: number;
        limit?: number;
        isDeleted?: boolean;
    }): Promise<{
        success: boolean;
        data: {
            roles: {
                id: number;
                name: string;
                description: string | null;
                isActive: boolean;
                accessScope: import("@prisma/client").$Enums.RoleAccessScope;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                permissions: {
                    name: string;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    key: string;
                    module: string;
                }[];
            }[];
            pagination: {
                totalItems: number;
                currentPage: number;
                pageSize: number;
                totalPages: number;
            };
        };
    }>;
    create(dto: UpsertRoleDto): Promise<{
        success: boolean;
        data: {
            id: number;
            name: string;
            description: string | null;
            isActive: boolean;
            accessScope: import("@prisma/client").$Enums.RoleAccessScope;
            permissions: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                key: string;
                module: string;
            }[];
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    update(id: number, dto: UpsertRoleDto): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: number;
            name: string;
            description: string | null;
            isActive: boolean;
            accessScope: import("@prisma/client").$Enums.RoleAccessScope;
            permissions: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                key: string;
                module: string;
            }[];
            createdAt: Date;
            updatedAt: Date;
        };
        message?: undefined;
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    restore(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
