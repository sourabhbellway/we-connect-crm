import { Model, Optional } from 'sequelize';
interface LeadAttributes {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    position?: string;
    sourceId?: number;
    status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed' | 'lost';
    notes?: string;
    assignedTo?: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
interface LeadCreationAttributes extends Optional<LeadAttributes, 'id' | 'phone' | 'company' | 'position' | 'sourceId' | 'notes' | 'assignedTo' | 'isActive' | 'createdAt' | 'updatedAt'> {
}
declare class Lead extends Model<LeadAttributes, LeadCreationAttributes> implements LeadAttributes {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    position?: string;
    sourceId?: number;
    status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed' | 'lost';
    notes?: string;
    assignedTo?: number;
    isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    get fullName(): string;
}
export default Lead;
//# sourceMappingURL=Lead.d.ts.map