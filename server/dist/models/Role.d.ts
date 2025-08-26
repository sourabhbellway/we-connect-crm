import { Model, Optional } from 'sequelize';
interface RoleAttributes {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'description' | 'isActive' | 'createdAt' | 'updatedAt'> {
}
declare class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Role;
//# sourceMappingURL=Role.d.ts.map