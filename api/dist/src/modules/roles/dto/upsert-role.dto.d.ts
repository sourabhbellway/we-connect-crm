import { RoleAccessScope } from '@prisma/client';
export declare class UpsertRoleDto {
    name: string;
    description?: string;
    accessScope: RoleAccessScope;
    isActive?: boolean;
    permissionIds: number[];
}
