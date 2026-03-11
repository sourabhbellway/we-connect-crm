import { PrismaService } from '../../database/prisma.service';
import { UpsertRoleDto } from './dto/upsert-role.dto';
export declare class RolesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list({ search, status, page, limit, isDeleted, }: {
        search?: string;
        status?: string;
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
                accessScope: import(".prisma/client").$Enums.RoleAccessScope;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                permissions: {
                    description: string | null;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    key: string;
                    module: string;
                }[];
                users: {
                    userId: number;
                    id: number;
                    roleId: number;
                }[];
                permissionsCount: number;
                usersCount: number;
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
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            id: number;
            name: string;
            description: string | null;
            isActive: boolean;
            accessScope: import(".prisma/client").$Enums.RoleAccessScope;
            permissions: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                key: string;
                module: string;
            }[];
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getUsersByRole(roleId: number): Promise<{
        success: boolean;
        data: {
            email: string;
            firstName: string;
            lastName: string;
            id: number;
            isActive: boolean;
        }[];
    }>;
    update(id: number, dto: UpsertRoleDto): Promise<{
        success: boolean;
        message: string;
        warning?: undefined;
        affectedUsers?: undefined;
        affectedUserIds?: undefined;
        data?: undefined;
    } | {
        success: boolean;
        warning: string | null;
        affectedUsers: any[];
        affectedUserIds: number[];
        message: string;
        data: {
            id: number;
            name: string;
            description: string | null;
            isActive: boolean;
            accessScope: import(".prisma/client").$Enums.RoleAccessScope;
            permissions: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                key: string;
                module: string;
            }[];
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    restore(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    deletePermanently(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
