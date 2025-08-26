import { Model, Optional } from 'sequelize';
interface LeadSourceAttributes {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
interface LeadSourceCreationAttributes extends Optional<LeadSourceAttributes, 'id' | 'description' | 'isActive' | 'createdAt' | 'updatedAt'> {
}
declare class LeadSource extends Model<LeadSourceAttributes, LeadSourceCreationAttributes> implements LeadSourceAttributes {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default LeadSource;
//# sourceMappingURL=LeadSource.d.ts.map