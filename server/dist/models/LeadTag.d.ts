import { Model } from 'sequelize';
interface LeadTagAttributes {
    id: number;
    leadId: number;
    tagId: number;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class LeadTag extends Model<LeadTagAttributes> implements LeadTagAttributes {
    id: number;
    leadId: number;
    tagId: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default LeadTag;
//# sourceMappingURL=LeadTag.d.ts.map