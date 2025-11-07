import { RolesService } from './roles.service';
import { UpsertRoleDto } from './dto/upsert-role.dto';
export declare class RolesController {
    private readonly service;
    constructor(service: RolesService);
    list(search?: string, page?: string, limit?: string, isDeleted?: string): Promise<{
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
    update(id: string, dto: UpsertRoleDto): Promise<{
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
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    restore(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
