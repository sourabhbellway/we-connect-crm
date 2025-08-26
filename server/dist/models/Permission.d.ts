import { Model, Optional } from 'sequelize';
interface PermissionAttributes {
    id: number;
    name: string;
    key: string;
    description?: string;
    module: string;
    createdAt?: Date;
    updatedAt?: Date;
}
interface PermissionCreationAttributes extends Optional<PermissionAttributes, 'id' | 'description' | 'createdAt' | 'updatedAt'> {
}
declare class Permission extends Model<PermissionAttributes, PermissionCreationAttributes> implements PermissionAttributes {
    id: number;
    name: string;
    key: string;
    description?: string;
    module: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Permission;
//# sourceMappingURL=Permission.d.ts.map