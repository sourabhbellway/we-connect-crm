import { Model, Optional } from 'sequelize';
interface TagAttributes {
    id: number;
    name: string;
    color: string;
    description?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
interface TagCreationAttributes extends Optional<TagAttributes, 'id' | 'description' | 'isActive' | 'createdAt' | 'updatedAt'> {
}
declare class Tag extends Model<TagAttributes, TagCreationAttributes> implements TagAttributes {
    id: number;
    name: string;
    color: string;
    description?: string;
    isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Tag;
//# sourceMappingURL=Tag.d.ts.map