export declare class UpsertTemplateDto {
    name: string;
    type: string;
    subject?: string;
    content: string;
    variables?: Record<string, unknown>;
    isActive?: boolean;
    isDefault?: boolean;
    createdBy?: number;
}
