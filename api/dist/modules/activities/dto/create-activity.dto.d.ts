export declare class CreateActivityDto {
    title: string;
    description: string;
    type: string;
    icon?: string;
    iconColor?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
    userId?: number;
    superAdminId?: number;
    leadId?: number;
}
